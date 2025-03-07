from datetime import datetime, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.models.models import WordList, Word, User
from app.schemas.schemas import WordListCreate, WordListResponse, WordResponse, SimilarWordsResponse
from app.services.csv_service import csv_service
from app.services.dictionary_service import dictionary_service
from app.api.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[WordListResponse])
async def get_word_lists(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all word lists for the current user"""
    result = await db.execute(
        select(WordList).filter(WordList.owner_id == current_user.id)
    )
    return result.scalars().all()

@router.get("/{list_id}", response_model=WordListResponse)
async def get_word_list(
    list_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific word list"""
    result = await db.execute(
        select(WordList).filter(
            WordList.id == list_id,
            WordList.owner_id == current_user.id
        )
    )
    word_list = result.scalars().first()
    if not word_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Word list not found"
        )
    return word_list

@router.get("/{list_id}/words", response_model=List[WordResponse])
async def get_words_in_list(
    list_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all words in a specific word list"""
    # Verify word list exists and belongs to user
    result = await db.execute(
        select(WordList).filter(
            WordList.id == list_id,
            WordList.owner_id == current_user.id
        )
    )
    word_list = result.scalars().first()
    if not word_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Word list not found"
        )
    
    # Get words with practice stats
    result = await db.execute(
        select(Word)
        .filter(Word.word_list_id == list_id)
        .order_by(Word.familiar.desc(), Word.practice_count.desc(), Word.word)
    )
    return result.scalars().all()

@router.post("/upload", response_model=WordListResponse)
async def upload_word_list(
    name: Annotated[str, Form()],
    file: Annotated[UploadFile, File()],
    description: Annotated[str, Form()] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a new word list from CSV file"""
    try:
        # Process CSV file
        processed_data = await csv_service.process_csv_file(file)
        
        # Create word list
        word_list = WordList(
            name=name,
            description=description,
            owner_id=current_user.id,
            created_at=datetime.now(timezone.utc)
        )
        db.add(word_list)
        await db.flush()  # Get word_list.id
        
        # Create words and fetch meanings/examples
        for word_data in processed_data["words"]:
            # Only lookup meaning and example if they're not provided in CSV
            if not word_data["meaning"] or not word_data["example"]:
                meaning, example = await dictionary_service.get_word_details(word_data["word"])
                if not word_data["meaning"]:
                    word_data["meaning"] = meaning
                if not word_data["example"]:
                    word_data["example"] = example
                    
            word = Word(
                word=word_data["word"],
                meaning=word_data["meaning"],
                example=word_data["example"],
                word_list_id=word_list.id,
                familiar=False,
                practice_count=0,
                correct_count=0,
                incorrect_count=0
            )
            db.add(word)
        
        await db.commit()
        return word_list
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/{list_id}")
async def delete_word_list(
    list_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a word list"""
    result = await db.execute(
        select(WordList).filter(
            WordList.id == list_id,
            WordList.owner_id == current_user.id
        )
    )
    word_list = result.scalars().first()
    if not word_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Word list not found"
        )
    
    await db.delete(word_list)
    await db.commit()
    return {"message": "Word list deleted successfully"}

@router.put("/{list_id}", response_model=WordListResponse)
async def update_word_list(
    list_id: int,
    word_list_update: WordListCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a word list's name and description"""
    result = await db.execute(
        select(WordList).filter(
            WordList.id == list_id,
            WordList.owner_id == current_user.id
        )
    )
    word_list = result.scalars().first()
    if not word_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Word list not found"
        )
    
    word_list.name = word_list_update.name
    word_list.description = word_list_update.description
    
    await db.commit()
    await db.refresh(word_list)
    return word_list

@router.get("/words/{word_id}/similar", response_model=SimilarWordsResponse)
async def get_similar_words(
    word_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get similar words for a specific word"""
    # Get the word and verify access
    result = await db.execute(
        select(Word).join(WordList).filter(
            Word.id == word_id,
            WordList.owner_id == current_user.id
        )
    )
    word = result.scalars().first()
    if not word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Word not found or access denied"
        )
    
    # Get similar words
    similar_words = await dictionary_service.get_similar_words(word.word)
    
    return {
        "word": word.word,
        "similar_words": similar_words
    }