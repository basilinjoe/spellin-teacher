from datetime import datetime, timedelta
from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_

from app.models.models import Word, WordList


class SRSService:
    """Service for managing spaced repetition learning"""
    
    # Intervals for each SRS level (in hours)
    # Level 0: 4 hours (new/failed words)
    # Level 1: 8 hours
    # Level 2: 24 hours (1 day)
    # Level 3: 72 hours (3 days)
    # Level 4: 168 hours (1 week)
    # Level 5: 720 hours (30 days)
    INTERVALS = [4, 8, 24, 72, 168, 720]
    
    async def get_due_words(self, db: AsyncSession, user_id: int, limit: int = 20) -> List[Word]:
        """Get words that are due for review"""
        current_time = datetime.utcnow()
        result = await db.execute(
            select(Word)
            .join(WordList)
            .filter(
                and_(
                    WordList.owner_id == user_id,
                    Word.next_review <= current_time
                )
            )
            .order_by(Word.next_review)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def process_review_result(self, db: AsyncSession, word: Word, correct: bool) -> None:
        """Process the result of a word review and update SRS accordingly"""
        current_time = datetime.utcnow()
        
        # Update practice statistics
        word.practice_count += 1
        word.last_practiced = current_time
        
        if correct:
            word.correct_count += 1
            # Advance SRS level if correct (max 5)
            if word.srs_level < 5:
                word.srs_level += 1
        else:
            word.incorrect_count += 1
            # Reset SRS level to 0 if incorrect
            word.srs_level = 0
        
        # Update review interval and next review time
        word.review_interval = self.INTERVALS[word.srs_level]
        word.next_review = current_time + timedelta(hours=word.review_interval)
        
        # Mark as familiar if accuracy is good
        if word.practice_count >= 3 and (word.correct_count / word.practice_count) >= 0.8:
            word.familiar = True
        
        await db.commit()
    
    async def initialize_word(self, db: AsyncSession, word: Word) -> None:
        """Initialize SRS for a new word"""
        current_time = datetime.utcnow()
        word.srs_level = 0
        word.review_interval = self.INTERVALS[0]
        word.next_review = current_time + timedelta(hours=word.review_interval)
        await db.commit()
    
    async def get_user_stats(self, db: AsyncSession, user_id: int) -> Dict:
        """Get SRS statistics for the user"""
        current_time = datetime.utcnow()
        
        # Get all words for user
        result = await db.execute(
            select(Word)
            .join(WordList)
            .filter(WordList.owner_id == user_id)
        )
        words = result.scalars().all()
        
        total_words = len(words)
        total_due = sum(1 for word in words if word.next_review and word.next_review <= current_time)
        
        # Count words at each SRS level
        level_counts = {i: 0 for i in range(6)}  # 0-5 levels
        for word in words:
            level_counts[word.srs_level] += 1
        
        return {
            "total_words": total_words,
            "total_due": total_due,
            "level_counts": level_counts
        }


# Create singleton instance
srs_service = SRSService()