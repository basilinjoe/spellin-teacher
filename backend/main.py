import uvicorn
import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.api.api import api_router
from app.core.config import settings
from app.core.init_db import init_db

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Spelling Teacher API",
    description="API for learning spelling through practice",
    version="1.0.0",
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router with the correct prefix
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Create directories for static files if they don't exist
os.makedirs("static/audio", exist_ok=True)
os.makedirs("static/uploads", exist_ok=True)

# Mount static directories
app.mount("/audio", StaticFiles(directory="static/audio"), name="audio")
app.mount("/uploads", StaticFiles(directory="static/uploads"), name="uploads")

@app.get("/")
async def root():
    """Root endpoint providing API information"""
    return {
        "app": "Spelling Teacher API",
        "version": "1.0.0",
        "documentation_url": "/docs",
        "alternative_docs_url": "/redoc"
    }

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error"},
    )

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    logger.info("Initializing database")
    await init_db()
    logger.info("Database initialized")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)