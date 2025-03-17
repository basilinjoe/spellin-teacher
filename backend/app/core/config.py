from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OpenAI Configuration
    OPENAI_API_KEY: str = ""
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./spelling_teacher.db"
    
    # CORS Settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # React development server
    ]
    
    # File Storage
    UPLOAD_DIR: str = "static/uploads"
    AUDIO_DIR: str = "static/audio"
    
    # Practice Settings
    MIN_PRACTICE_COUNT: int = 3  # Minimum practices before word can be familiar
    MIN_ACCURACY: float = 0.8  # Minimum accuracy to mark word as familiar
    
    # File Cleanup
    FILE_MAX_AGE_HOURS: int = 24  # Maximum age for temporary files
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()