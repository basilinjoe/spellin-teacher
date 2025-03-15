from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, Integer
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.models import Word, WordList, User, MistakePattern
from app.schemas.schemas import (
    ReviewWordResponse, ReviewSubmitRequest, SRSStatsResponse,
    MistakePatternResponse, WordForPattern, PracticeResult
)
from app.services.srs_service import srs_service
from app.services.tts_service import tts_service
from app.services.mistake_pattern_service import mistake_pattern_service
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/review", response_model=List[ReviewWordResponse])
async def get_review_words(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 20
):
    """Get words that are due for review"""
    try:
        words = await srs_service.get_due_words(db, current_user.id, limit)
        
        responses = []
        for word in words:
            try:
                # Get audio URL for the word
                audio_url = tts_service.synthesize_speech(word.word)
                if not audio_url:
                    continue
                    
                responses.append(ReviewWordResponse(
                    id=word.id,
                    word=word.word,
                    meaning=word.meaning,
                    example=word.example,
                    audio_url=audio_url,
                    srs_level=word.srs_level
                ))
            except Exception as e:
                # Log the error but continue processing other words
                print(f"Error processing word {word.id}: {str(e)}")
                continue
        
        return responses
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while fetching review words"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/review/{word_id}/submit", response_model=PracticeResult)
async def submit_review(
    word_id: int,
    request: ReviewSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a review result for a word"""
    # Verify word exists and belongs to user
    result = await db.execute(
        select(Word)
        .options(joinedload(Word.mistake_patterns))
        .join(WordList)
        .filter(
            Word.id == word_id,
            WordList.owner_id == current_user.id
        )
    )
    word = result.unique().scalar_one_or_none()
    
    if not word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Word not found or access denied"
        )
    
    # Check if the spelling is correct (case-insensitive)
    is_correct = request.user_spelling.lower().strip() == word.word.lower().strip()
    
    # Update SRS level and next review time based on correctness
    word.practice_count += 1
    if is_correct:
        word.correct_count += 1
        word.srs_level = min(word.srs_level + 1, 5)  # Cap at level 5
    else:
        word.incorrect_count += 1
        word.srs_level = max(word.srs_level - 1, 0)  # Floor at level 0
        
        # Analyze and store mistake pattern
        pattern = mistake_pattern_service.analyze_mistake(word.word, request.user_spelling)
        
        # Check for existing pattern
        result = await db.execute(
            select(MistakePattern).filter(
                MistakePattern.word_id == word.id,
                MistakePattern.pattern_type == pattern["pattern_type"],
                MistakePattern.description == pattern["description"]
            )
        )
        existing_pattern = result.scalar_one_or_none()
        
        if existing_pattern:
            existing_pattern.frequency += 1
            if request.user_spelling not in existing_pattern.examples:
                existing_pattern.examples = existing_pattern.examples + [request.user_spelling]
        else:
            new_pattern = MistakePattern(
                word_id=word.id,
                pattern_type=pattern["pattern_type"],
                description=pattern["description"],
                examples=[request.user_spelling],
                frequency=1
            )
            db.add(new_pattern)
    
    # Calculate next review time based on SRS level
    word.review_interval = srs_service.get_review_interval(word.srs_level)
    word.next_review = datetime.utcnow() + timedelta(hours=word.review_interval)
    word.last_practiced = datetime.utcnow()
    
    # Update familiar status based on practice history
    if word.practice_count >= 3 and word.correct_count / word.practice_count >= 0.8:
        word.familiar = True
    
    await db.commit()
    await db.refresh(word)
    
    # Transform mistake patterns for response
    mistake_patterns = [
        MistakePatternResponse(
            pattern_type=p.pattern_type,
            description=p.description,
            examples=p.examples,
            count=p.frequency,
            word=WordForPattern(
                id=word.id,
                word=word.word
            )
        )
        for p in word.mistake_patterns
    ]
    
    return PracticeResult(
        word_id=word.id,
        word=word.word,
        correct=is_correct,
        correct_spelling=word.word,
        meaning=word.meaning,
        example=word.example,
        mistake_patterns=mistake_patterns
    )

@router.get("/stats", response_model=SRSStatsResponse)
async def get_srs_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get SRS statistics for the current user"""
    return await srs_service.get_user_stats(db, current_user.id)