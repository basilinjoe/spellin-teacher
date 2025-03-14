from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, func, desc, text
from sqlalchemy.orm import joinedload
from functools import lru_cache

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
    
    # Cache for 1 hour
    @lru_cache(maxsize=128)
    def get_review_interval(self, level: int) -> int:
        """Get the review interval in hours for a given SRS level"""
        if level < 0:
            level = 0
        elif level >= len(self.INTERVALS):
            level = len(self.INTERVALS) - 1
        return self.INTERVALS[level]

    async def get_due_words(self, db: AsyncSession, user_id: int, limit: int = 20) -> List[Word]:
        """Get words that are due for review using an optimized query"""
        current_time = datetime.utcnow()
        
        # Use a properly constructed SQLAlchemy query instead of raw SQL
        # First get due words
        due_query = select(Word).join(WordList, Word.word_list_id == WordList.id).where(
            and_(
                WordList.owner_id == user_id,
                Word.next_review <= current_time
            )
        ).order_by(desc(Word.srs_level), Word.next_review).limit(limit)
        
        due_result = await db.execute(due_query)
        due_words = due_result.scalars().all()
        
        # If we need more words, get new words that haven't been reviewed yet
        if len(due_words) < limit:
            new_words_limit = limit - len(due_words)
            new_query = select(Word).join(WordList, Word.word_list_id == WordList.id).where(
                and_(
                    WordList.owner_id == user_id,
                    Word.next_review == None,
                    Word.srs_level == 0
                )
            ).order_by(func.random()).limit(new_words_limit)
            
            new_result = await db.execute(new_query)
            new_words = new_result.scalars().all()
            
            # Combine due words and new words
            return list(due_words) + list(new_words)
        
        return list(due_words)

    async def process_review_result(self, db: AsyncSession, word: Word, correct: bool) -> None:
        """Process the result of a word review and update SRS accordingly"""
        current_time = datetime.utcnow()
        
        # Initialize stats if this is the first review
        if word.practice_count is None:
            word.practice_count = 0
            word.correct_count = 0
            word.incorrect_count = 0
        
        # Update practice statistics
        word.practice_count += 1
        word.last_practiced = current_time
        
        if correct:
            word.correct_count += 1
            # Use exponential backoff for higher levels
            if word.srs_level < 5:
                word.srs_level += 1
            elif word.review_interval:
                # Exponential increase for mature words
                word.review_interval = int(word.review_interval * 1.5)
        else:
            word.incorrect_count += 1
            # Implement smart level regression
            word.srs_level = max(0, word.srs_level - 2)  # Drop by 2 levels instead of reset
        
        # Update review interval with optimized spacing
        base_interval = self.get_review_interval(word.srs_level)
        # Add graduated jitter based on level
        jitter_factor = 0.1 + (0.05 * word.srs_level)  # More variation for higher levels
        jitter = base_interval * jitter_factor
        final_interval = base_interval + (jitter * (0.5 - func.random()))
        
        word.review_interval = int(final_interval)
        word.next_review = current_time + timedelta(hours=word.review_interval)
        
        # Smarter familiarity algorithm
        if (word.practice_count >= 3 and 
            (word.correct_count / word.practice_count) >= 0.8 and
            word.srs_level >= 3):  # Must be at least level 3
            word.familiar = True
        
        await db.commit()

    async def initialize_word(self, db: AsyncSession, word: Word) -> None:
        """Initialize SRS for a new word"""
        current_time = datetime.utcnow()
        word.srs_level = 0
        word.review_interval = self.get_review_interval(0)
        word.next_review = current_time + timedelta(hours=word.review_interval)
        word.practice_count = 0
        word.correct_count = 0
        word.incorrect_count = 0
        word.familiar = False
        await db.commit()

    async def get_user_stats(self, db: AsyncSession, user_id: int) -> Dict:
        """Get SRS statistics for the user with optimized query"""
        current_time = datetime.utcnow()
        
        # Use a single optimized query to get all stats
        query = text("""
            SELECT 
                COUNT(*) as total_words,
                COUNT(CASE WHEN next_review <= :current_time THEN 1 END) as total_due,
                COUNT(CASE WHEN practice_count > 0 THEN 1 END) as total_practiced,
                COALESCE(SUM(correct_count), 0) as total_correct,
                COALESCE(SUM(practice_count), 0) as total_attempts,
                json_object_agg(
                    COALESCE(srs_level, 0)::text, 
                    COUNT(*)
                ) as level_counts
            FROM words w
            JOIN word_lists wl ON w.word_list_id = wl.id
            WHERE wl.owner_id = :user_id
        """)
        
        result = await db.execute(query, {"user_id": user_id, "current_time": current_time})
        stats = result.first()
        
        if not stats or stats.total_words == 0:
            return {
                "total_words": 0,
                "total_due": 0,
                "level_counts": {str(i): 0 for i in range(6)},
                "accuracy": 0,
                "words_studied": 0
            }
        
        # Parse the level_counts from JSON
        level_counts = stats.level_counts or {str(i): 0 for i in range(6)}
        
        return {
            "total_words": stats.total_words,
            "total_due": stats.total_due,
            "level_counts": level_counts,
            "accuracy": stats.total_correct / stats.total_attempts if stats.total_attempts > 0 else 0,
            "words_studied": stats.total_practiced
        }

# Create singleton instance
srs_service = SRSService()