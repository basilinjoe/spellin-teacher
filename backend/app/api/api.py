from fastapi import APIRouter
from app.api.endpoints import auth, word_lists, practice, srs

# Create main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

api_router.include_router(
    word_lists.router,
    prefix="/word-lists",
    tags=["Word Lists"]
)

api_router.include_router(
    practice.router,
    prefix="/practice",
    tags=["Practice"]
)

api_router.include_router(
    srs.router,
    prefix="/srs",
    tags=["Spaced Repetition"]
)