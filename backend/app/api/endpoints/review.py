from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, desc, text
from datetime import datetime
from typing import List, Dict

from app.core.database import get_db
from app.models.models import Word, WordList, User
from app.schemas.schemas import ReviewWordResponse, ReviewSubmitRequest, PracticeResult, SRSStatsResponse
from app.services.tts_service import tts_service
from app.services.srs_service import srs_service
from app.api.deps import get_current_user

router = APIRouter()

@router.get("", response_model=List[ReviewWordResponse])
async def get_review_words(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get words that are due for review"""
    words = await srs_service.get_due_words(db, current_user.id, limit)
    if not words:
        return []

    # Add audio URLs for all words
    responses = []
    for word in words:
        audio_url = tts_service.synthesize_speech(word.word)
        if audio_url:
            responses.append(ReviewWordResponse(
                id=word.id,
                word=word.word,
                meaning=word.meaning,
                example=word.example,
                phonetic=word.phonetic,
                audio_url=audio_url,
                srs_level=word.srs_level
            ))

    return responses

@router.post("/{word_id}/submit", response_model=PracticeResult)
async def submit_review(
    word_id: int,
    request: ReviewSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a review attempt for a word"""
    # Get the word and verify access
    result = await db.execute(
        select(Word)
        .join(WordList)
        .filter(
            Word.id == word_id,
            WordList.owner_id == current_user.id
        )
    )
    word = result.scalar_one_or_none()
    if not word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Word not found or access denied"
        )

    # Check if the spelling is correct
    is_correct = request.user_spelling.lower().strip() == word.word.lower().strip()

    # Process the review result with SRS
    await srs_service.process_review_result(db, word, is_correct)

    return PracticeResult(
        word_id=word.id,
        word=word.word,
        correct=is_correct,
        correct_spelling=word.word,
        meaning=word.meaning,
        example=word.example,
        phonetic=word.phonetic,
        mistake_patterns=[]
    )

@router.get("/stats", response_model=SRSStatsResponse)
async def get_srs_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get SRS statistics for the user"""
    stats = await srs_service.get_user_stats(db, current_user.id)
    return stats