from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError

from app.core.database import get_db
from app.services.srs_service import srs_service
from app.services.tts_service import tts_service
from app.schemas import schemas
from app.api.deps import get_current_user
from app.models.models import User, Word, WordList

router = APIRouter()

@router.get("/review", response_model=List[schemas.ReviewWordResponse])
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
                    
                responses.append(schemas.ReviewWordResponse(
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

@router.post("/review/{word_id}/submit", response_model=schemas.PracticeResult)
async def submit_review(
    word_id: int,
    request: schemas.ReviewSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a review result for a word"""
    try:
        # Get word and verify ownership
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
                detail="Word not found or not authorized"
            )
        
        # Normalize the strings before comparison
        user_spelling = request.user_spelling.lower().strip()
        correct_spelling = word.word.lower().strip()
        correct = user_spelling == correct_spelling
        
        # Process the review result in SRS system
        await srs_service.process_review_result(db, word, correct)
        
        return schemas.PracticeResult(
            word_id=word.id,
            word=word.word,
            correct=correct,
            correct_spelling=word.word,
            meaning=word.meaning,
            example=word.example
        )
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while submitting review"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/stats", response_model=schemas.SRSStatsResponse)
async def get_srs_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get SRS statistics for the current user"""
    return await srs_service.get_user_stats(db, current_user.id)