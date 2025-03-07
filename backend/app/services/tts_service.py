import os
import hashlib
from gtts import gTTS
from app.core.config import settings

class TTSService:
    """Service for generating text-to-speech audio files"""
    
    def __init__(self):
        """Initialize the TTS service and create audio directory"""
        self.audio_dir = settings.AUDIO_DIR
        os.makedirs(self.audio_dir, exist_ok=True)
    
    def get_audio_filename(self, text: str, speed: str = 'normal') -> str:
        """Generate a unique filename for the audio based on the text and speed"""
        # Create hash of the text and speed to use as filename
        text_hash = hashlib.md5(f"{text}_{speed}".encode()).hexdigest()
        return f"{text_hash}.mp3"
    
    def synthesize_speech(self, text: str, speed: str = 'normal') -> str:
        """
        Convert text to speech and return the URL of the audio file
        
        Args:
            text: The text to convert to speech
            speed: Speed of speech ('slow' or 'normal')
            
        Returns:
            str: The URL path to the generated audio file
        """
        # Generate filename for the audio
        filename = self.get_audio_filename(text, speed)
        filepath = os.path.join(self.audio_dir, filename)
        
        # Generate audio file if it doesn't exist
        if not os.path.exists(filepath):
            try:
                tts = gTTS(text=text, lang='en', slow=(speed == 'slow'))
                tts.save(filepath)
            except Exception as e:
                print(f"Error generating speech for '{text}': {str(e)}")
                return None
        
        # Return the URL path to the audio file
        return f"/audio/{filename}"
    
    def cleanup_old_files(self, max_age_hours: int = 24):
        """
        Clean up old audio files that haven't been accessed recently
        
        Args:
            max_age_hours: Maximum age of files in hours before they are deleted
        """
        import time
        
        current_time = time.time()
        max_age_seconds = max_age_hours * 3600
        
        for filename in os.listdir(self.audio_dir):
            filepath = os.path.join(self.audio_dir, filename)
            if os.path.isfile(filepath):
                # Check file age
                file_age = current_time - os.path.getatime(filepath)
                if file_age > max_age_seconds:
                    try:
                        os.remove(filepath)
                        print(f"Removed old audio file: {filename}")
                    except Exception as e:
                        print(f"Error removing file {filename}: {str(e)}")


# Create singleton instance
tts_service = TTSService()