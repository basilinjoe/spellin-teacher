from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.models import Word
from app.services.tts_service import tts_service
import logging

logger = logging.getLogger(__name__)

class BatchTTSService:
    """Service for batch generating text-to-speech audio files for all words"""
    
    async def generate_audio_for_all_words(self, db: AsyncSession, speed: str = 'normal'):
        """
        Generate audio files for all words in the database
        
        Args:
            db: Async database session
            speed: Speed of speech ('slow' or 'normal')
        """
        try:
            # Get all words from database
            result = await db.execute(select(Word))
            words = result.scalars().all()
            
            total_words = len(words)
            processed = 0
            failed = 0
            
            logger.info(f"Starting batch audio generation for {total_words} words")
            
            for word in words:
                try:
                    # Generate audio file
                    audio_url = tts_service.synthesize_speech(word.word, speed)
                    if audio_url:
                        processed += 1
                        if processed % 100 == 0:  # Log progress every 100 words
                            logger.info(f"Processed {processed}/{total_words} words")
                    else:
                        failed += 1
                        logger.error(f"Failed to generate audio for word: {word.word}")
                except Exception as e:
                    failed += 1
                    logger.error(f"Error processing word {word.word}: {str(e)}")
            
            logger.info(f"Batch audio generation completed. "
                       f"Successfully processed: {processed}, "
                       f"Failed: {failed}")
            
            return {
                "total": total_words,
                "processed": processed,
                "failed": failed
            }
            
        except Exception as e:
            logger.error(f"Error in batch audio generation: {str(e)}")
            raise

    async def generate_audio_for_word_list(self, db: AsyncSession, word_list_id: int, speed: str = 'normal'):
        """
        Generate audio files for words in a specific word list
        
        Args:
            db: Async database session
            word_list_id: ID of the word list to process
            speed: Speed of speech ('slow' or 'normal')
        """
        try:
            # Get words from specific word list
            result = await db.execute(
                select(Word).where(Word.word_list_id == word_list_id)
            )
            words = result.scalars().all()
            
            total_words = len(words)
            processed = 0
            failed = 0
            
            logger.info(f"Starting audio generation for word list {word_list_id} with {total_words} words")
            
            for word in words:
                try:
                    audio_url = tts_service.synthesize_speech(word.word, speed)
                    if audio_url:
                        processed += 1
                        if processed % 50 == 0:  # Log progress every 50 words
                            logger.info(f"Processed {processed}/{total_words} words")
                    else:
                        failed += 1
                        logger.error(f"Failed to generate audio for word: {word.word}")
                except Exception as e:
                    failed += 1
                    logger.error(f"Error processing word {word.word}: {str(e)}")
            
            logger.info(f"Word list audio generation completed. "
                       f"Successfully processed: {processed}, "
                       f"Failed: {failed}")
            
            return {
                "total": total_words,
                "processed": processed,
                "failed": failed
            }
            
        except Exception as e:
            logger.error(f"Error in word list audio generation: {str(e)}")
            raise

# Create singleton instance
batch_tts_service = BatchTTSService()