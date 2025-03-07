from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    poolclass=StaticPool,  # Use static pool for SQLite
    connect_args={"check_same_thread": False}  # Required for SQLite
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Create declarative base for models
Base = declarative_base()

# Dependency for database session
async def get_db() -> AsyncSession:
    """Dependency that provides a database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()