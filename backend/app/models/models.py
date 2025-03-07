from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text, JSON, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    word_lists = relationship("WordList", back_populates="owner", cascade="all, delete-orphan")


class WordList(Base):
    __tablename__ = "word_lists"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="word_lists")
    words = relationship("Word", back_populates="word_list", cascade="all, delete-orphan")


class MistakePattern(Base):
    __tablename__ = "mistake_patterns"
    
    id = Column(Integer, primary_key=True, index=True)
    word_id = Column(Integer, ForeignKey("words.id"))
    pattern_type = Column(String, nullable=False)  # e.g., 'substitution', 'insertion', 'deletion', 'transposition'
    description = Column(String, nullable=False)  # e.g., 'ie/ei confusion', 'double letter omission'
    frequency = Column(Integer, default=1)
    examples = Column(JSON, nullable=False, default=list)  # List of incorrect attempts
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    word = relationship("Word", back_populates="mistake_patterns")


class Word(Base):
    __tablename__ = "words"
    
    id = Column(Integer, primary_key=True, index=True)
    word = Column(String, nullable=False)
    meaning = Column(Text, nullable=True)
    example = Column(Text, nullable=True)
    word_list_id = Column(Integer, ForeignKey("word_lists.id"))
    
    # Practice statistics
    familiar = Column(Boolean, default=False)
    practice_count = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    incorrect_count = Column(Integer, default=0)
    last_practiced = Column(DateTime(timezone=True), nullable=True)
    
    # SRS specific fields
    srs_level = Column(Integer, default=0, nullable=False)  # 0-5, representing mastery level
    next_review = Column(DateTime(timezone=True), nullable=True, index=True)
    review_interval = Column(Integer, default=0, nullable=False)  # Interval in hours

    # Constraints
    __table_args__ = (
        CheckConstraint('srs_level >= 0 AND srs_level <= 5', name='check_srs_level_range'),
    )
    
    # Relationships
    word_list = relationship("WordList", back_populates="words")
    mistake_patterns = relationship("MistakePattern", back_populates="word", cascade="all, delete-orphan")