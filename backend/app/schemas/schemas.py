from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserResponse(UserBase):
    id: int
    is_active: bool = True

    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Word list schemas
class WordListBase(BaseModel):
    name: str
    description: Optional[str] = None

class WordListCreate(WordListBase):
    pass

class WordListResponse(WordListBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Mistake pattern schemas
class MistakePatternBase(BaseModel):
    pattern_type: str
    description: str
    frequency: int
    examples: List[str]

class MistakePatternCreate(MistakePatternBase):
    word_id: int

class MistakePatternResponse(MistakePatternBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Word schemas
class WordBase(BaseModel):
    word: str
    meaning: Optional[str] = None
    example: Optional[str] = None

class WordCreate(WordBase):
    word_list_id: int

class WordResponse(WordBase):
    id: int
    word_list_id: int
    familiar: bool
    practice_count: int
    correct_count: int
    incorrect_count: int
    last_practiced: Optional[datetime] = None
    srs_level: int
    next_review: Optional[datetime] = None
    review_interval: int

    class Config:
        from_attributes = True

# Practice schemas
class PracticeRequest(BaseModel):
    word_list_id: int
    speed: str = 'normal'  # 'normal' or 'slow'

class PracticeResponse(BaseModel):
    word_id: int
    audio_url: str

class PracticeSubmitRequest(BaseModel):
    word_id: int
    user_spelling: str

class PracticeResult(BaseModel):
    word_id: int
    word: str
    correct: bool
    correct_spelling: str
    meaning: Optional[str] = None
    example: Optional[str] = None
    mistake_patterns: List[MistakePatternResponse] = []

    class Config:
        from_attributes = True

# Stats response
class PracticeStats(BaseModel):
    total_words: int
    familiar_words: int
    practiced_words: int
    accuracy: float

# Similar Words schema
class SimilarWordsResponse(BaseModel):
    word: str
    similar_words: List[str]

# SRS-related schemas
class SRSStatsResponse(BaseModel):
    total_words: int
    total_due: int
    level_counts: Dict[int, int]

class ReviewWordRequest(BaseModel):
    word_id: int

class ReviewWordResponse(BaseModel):
    word: str
    meaning: Optional[str] = None
    example: Optional[str] = None
    audio_url: str

class ReviewSubmitRequest(BaseModel):
    user_spelling: str