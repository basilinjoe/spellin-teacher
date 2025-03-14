from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update, Integer
from sqlalchemy.orm import joinedload
from datetime import datetime
import random

from app.core.database import get_db
from app.models.models import Word, WordList, User, MistakePattern
from app.schemas.schemas import PracticeRequest, PracticeResponse, PracticeSubmitRequest, PracticeResult, MistakePatternResponse, WordBase, WordForPattern
from app.services.tts_service import tts_service
from app.services.dictionary_service import dictionary_service
from app.services.mistake_pattern_service import mistake_pattern_service
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/get-word", response_model=PracticeResponse)
async def get_practice_word(
    request: PracticeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a random word from the word list for practice
    """
    # Verify word list exists and belongs to user
    result = await db.execute(
        select(WordList).filter(
            WordList.id == request.word_list_id,
            WordList.owner_id == current_user.id
        )
    )
    word_list = result.scalars().first()
    if not word_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Word list not found or access denied"
        )
    
    # Get a random word from the list, prioritizing unfamiliar words
    # First try to get an unfamiliar word
    result = await db.execute(
        select(Word).filter(
            Word.word_list_id == request.word_list_id,
            Word.familiar == False
        ).order_by(func.random())
    )
    words = result.scalars().all()
    
    # If no unfamiliar words, get any word
    if not words:
        result = await db.execute(
            select(Word).filter(
                Word.word_list_id == request.word_list_id
            ).order_by(func.random())
        )
        words = result.scalars().all()
    
    if not words:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No words found in this list"
        )
    
    # Select a random word
    word = random.choice(words)
    
    # Generate audio for the word
    audio_url = tts_service.synthesize_speech(word.word, request.speed)
    
    if not audio_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate audio for word"
        )
    
    return {
        "word_id": word.id,
        "audio_url": audio_url
    }


@router.post("/submit", response_model=PracticeResult)
async def submit_practice(
    request: PracticeSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit a practice attempt and get results
    """
    # Get the word and verify access
    result = await db.execute(
        select(Word)
        .options(joinedload(Word.mistake_patterns))
        .join(WordList)
        .filter(
            Word.id == request.word_id,
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
    
    # Update word stats
    word.practice_count += 1
    if is_correct:
        word.correct_count += 1
    else:
        word.incorrect_count += 1
        # Analyze mistake pattern if incorrect
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
            # Update existing pattern
            existing_pattern.frequency += 1
            if request.user_spelling not in existing_pattern.examples:
                existing_pattern.examples = existing_pattern.examples + [request.user_spelling]
        else:
            # Create new pattern
            new_pattern = MistakePattern(
                word_id=word.id,
                pattern_type=pattern["pattern_type"],
                description=pattern["description"],
                examples=[request.user_spelling],
                frequency=1
            )
            db.add(new_pattern)
    
    # Update familiar status based on practice history
    if word.practice_count >= 3 and word.correct_count / word.practice_count >= 0.8:
        word.familiar = True
    
    word.last_practiced = datetime.utcnow()
    await db.commit()
    await db.refresh(word)
    
    # Get dictionary data if not already available
    if not word.meaning and dictionary_service:
        try:
            meaning, example = await dictionary_service.get_word_details(word.word)
            if meaning:
                word.meaning = meaning
                await db.commit()
            if example: 
                word.example = example
                await db.commit()
        except Exception as e:
            print(f"Error getting dictionary data: {e}")
    
    # Transform mistake patterns for response using the updated schema
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


@router.get("/{word_list_id}/stats")
async def get_practice_stats(
    word_list_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get practice statistics for a word list
    """
    # Verify word list exists and belongs to user
    result = await db.execute(
        select(WordList).filter(
            WordList.id == word_list_id,
            WordList.owner_id == current_user.id
        )
    )
    word_list = result.scalars().first()
    if not word_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Word list not found or access denied"
        )
    
    # Get word statistics
    result = await db.execute(
        select(
            func.count().label('total_words'),
            func.sum(Word.familiar.cast(Integer)).label('familiar_words'),
            func.sum((Word.practice_count > 0).cast(Integer)).label('practiced_words'),
            func.sum(Word.correct_count).label('total_correct'),
            func.sum(Word.practice_count).label('total_practices')
        ).filter(Word.word_list_id == word_list_id)
    )
    stats = result.first()
    
    # Calculate statistics
    total_words = stats.total_words or 0
    familiar_words = stats.familiar_words or 0
    practiced_words = stats.practiced_words or 0
    total_correct = stats.total_correct or 0
    total_practices = stats.total_practices or 0
    
    return {
        "total_words": total_words,
        "familiar_words": familiar_words,
        "practiced_words": practiced_words,
        "accuracy": total_correct / total_practices if total_practices > 0 else 0
    }

@router.get("/mistake-patterns", response_model=list[MistakePatternResponse])
async def get_mistake_patterns(
    word_list_id: int = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all mistake patterns for the current user.
    If word_list_id is provided, only return patterns for that word list.
    """
    query = (
        select(MistakePattern)
        .options(joinedload(MistakePattern.word))  # Eager load the word relationship
        .join(Word)
        .join(WordList)
        .filter(WordList.owner_id == current_user.id)
    )
    
    if word_list_id:
        query = query.filter(Word.word_list_id == word_list_id)
    
    result = await db.execute(query)
    patterns = result.unique().scalars().all()
    
    # Transform the patterns to match the response schema
    return [
        MistakePatternResponse(
            pattern_type=pattern.pattern_type,
            description=pattern.description,
            examples=pattern.examples,
            count=pattern.frequency,
            word=WordForPattern(
                id=pattern.word.id,
                word=pattern.word.word
            ) if pattern.word else None
        )
        for pattern in patterns
    ]