import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text
from datetime import datetime, timedelta

from app.core.database import Base, engine, AsyncSessionLocal
from app.models.models import User, WordList, Word

logger = logging.getLogger(__name__)

async def apply_srs_migration():
    """Apply SRS migration to add spaced repetition fields"""
    async with AsyncSessionLocal() as session:
        try:
            # Add srs_level column
            try:
                await session.execute(text(
                    "ALTER TABLE words ADD COLUMN srs_level INTEGER DEFAULT 0"
                ))
                await session.commit()
                logger.info("Added srs_level column")
            except Exception as e:
                logger.info(f"srs_level column might already exist: {str(e)}")
                await session.rollback()
            
            # Add next_review column
            try:
                await session.execute(text(
                    "ALTER TABLE words ADD COLUMN next_review TIMESTAMP"
                ))
                await session.commit()
                logger.info("Added next_review column")
            except Exception as e:
                logger.info(f"next_review column might already exist: {str(e)}")
                await session.rollback()
            
            # Add review_interval column
            try:
                await session.execute(text(
                    "ALTER TABLE words ADD COLUMN review_interval INTEGER DEFAULT 0"
                ))
                await session.commit()
                logger.info("Added review_interval column")
            except Exception as e:
                logger.info(f"review_interval column might already exist: {str(e)}")
                await session.rollback()
            
            # Create index for next_review
            try:
                await session.execute(text(
                    "CREATE INDEX IF NOT EXISTS idx_words_next_review ON words(next_review)"
                ))
                await session.commit()
                logger.info("Created next_review index")
            except Exception as e:
                logger.info(f"next_review index might already exist: {str(e)}")
                await session.rollback()
            
        except SQLAlchemyError as e:
            logger.error(f"Error applying SRS migration: {str(e)}")
            raise

async def init_db():
    """Initialize the database by creating all tables and applying migrations"""
    try:
        async with engine.begin() as conn:
            # Create all tables if they don't exist
            await conn.run_sync(Base.metadata.create_all)
            
        logger.info("Database tables created successfully")
        
        # Apply SRS migration
        await apply_srs_migration()
        logger.info("SRS migration applied successfully")
        
        # Initialize test data if database is empty
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT COUNT(*) FROM users"))
            user_count = result.scalar()
            
            if user_count == 0:
                await create_test_data(session)
                
    except SQLAlchemyError as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise
    
async def create_test_data(session: AsyncSession):
    """Create test data for development"""
    try:
        # Create test user
        test_user = User(
            email="test@example.com",
            hashed_password="$2b$12$LQy4y6.vfKPZV/7Zw/YlxOEH9POxD5.7XZviZcuJWxPPGODQYrOjS"  # password: test123
        )
        session.add(test_user)
        await session.flush()
        
        # Create sample word list
        word_list = WordList(
            name="Common Words",
            description="A list of commonly misspelled words",
            owner_id=test_user.id
        )
        session.add(word_list)
        await session.flush()
        
        # Add sample words with SRS initialization
        sample_words = [
            {
                "word": "accommodate",
                "meaning": "to provide lodging or room for",
                "example": "The hotel can accommodate up to 500 guests."
            },
            {
                "word": "rhythm",
                "meaning": "a strong regular repeated pattern of movement or sound",
                "example": "She danced to the rhythm of the music."
            },
            {
                "word": "necessary",
                "meaning": "required to be done, essential",
                "example": "It is necessary to study for the exam."
            }
        ]
        
        current_time = datetime.utcnow()
        for word_data in sample_words:
            word = Word(
                word=word_data["word"],
                meaning=word_data["meaning"],
                example=word_data["example"],
                word_list_id=word_list.id,
                familiar=False,
                practice_count=0,
                correct_count=0,
                incorrect_count=0,
                srs_level=0,
                review_interval=4,  # Initial 4-hour interval
                next_review=current_time + timedelta(hours=4)
            )
            session.add(word)
        
        await session.commit()
        logger.info("Test data created successfully")
        
    except SQLAlchemyError as e:
        await session.rollback()
        logger.error(f"Error creating test data: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(init_db())