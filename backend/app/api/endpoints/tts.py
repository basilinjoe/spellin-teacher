from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict

from app.api.deps import get_db
from app.services.batch_tts_service import batch_tts_service

router = APIRouter()

@router.post("/generate-all", response_model=Dict)
async def generate_all_audio(
    speed: str = "normal",
    db: AsyncSession = Depends(get_db)
):
    """Generate audio files for all words in the database"""
    if speed not in ["normal", "slow"]:
        raise HTTPException(status_code=400, detail="Speed must be 'normal' or 'slow'")
    
    try:
        result = await batch_tts_service.generate_audio_for_all_words(db, speed)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))