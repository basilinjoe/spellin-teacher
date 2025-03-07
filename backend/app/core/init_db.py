import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text

from app.core.database import Base, engine, AsyncSessionLocal
from app.models.models import User, WordList, Word

logger = logging.getLogger(__name__)

async def init_db():
    """Initialize the database by creating all tables"""
    try:
        async with engine.begin() as conn:
            # Drop all tables if they exist (comment out in production)
            # await conn.run_sync(Base.metadata.drop_all)
            
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
            
        logger.info("Database tables created successfully")
        
        # Create a test user if no users exist
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
        
        # Add sample words
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
        
        for word_data in sample_words:
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
            session.add(word)
        
        await session.commit()
        logger.info("Test data created successfully")
        
    except SQLAlchemyError as e:
        await session.rollback()
        logger.error(f"Error creating test data: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(init_db())