# SpellWise Backend

A FastAPI-based backend for the SpellWise application providing APIs for word list management, text-to-speech, and progress tracking.

## Features

- RESTful API endpoints for user and word list management
- Text-to-speech integration with Google TTS
- Word definitions and examples using NLTK/WordNet
- SQLite database for data persistence
- Async support for better performance

## Prerequisites

- Python 3.8 or later
- pip (Python package manager)
- virtualenv (recommended)

## Setup

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Initialize the database:
```bash
python -m app.core.init_db
```

4. Run the development server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

## API Documentation

Once the server is running, you can access:
- Interactive API documentation: `http://localhost:8000/docs`
- Alternative documentation: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── app/
│   ├── api/            # API routes and endpoints
│   ├── core/           # Core configuration and database
│   ├── models/         # SQLAlchemy models
│   ├── schemas/        # Pydantic schemas
│   └── services/       # Business logic services
├── static/
│   ├── audio/         # Generated audio files
│   └── uploads/       # Uploaded CSV files
└── main.py            # Application entry point
```

## Environment Variables

Create a `.env` file in the root directory with the following variables (optional):
```
DATABASE_URL=sqlite:///./spelling_teacher.db
CORS_ORIGINS=["http://localhost:3000"]
```

## API Endpoints

### Authentication
- POST `/api/v1/auth/register` - Register a new user
- POST `/api/v1/auth/login` - Login and get access token

### Word Lists
- GET `/api/v1/word-lists` - Get all word lists
- GET `/api/v1/word-lists/{id}` - Get specific word list
- POST `/api/v1/word-lists/upload` - Upload new word list

### Practice
- POST `/api/v1/practice/get-word` - Get next word for practice
- POST `/api/v1/practice/submit` - Submit practice attempt
- GET `/api/v1/practice/{list_id}/stats` - Get practice statistics

## Development

### Running Tests
```bash
pytest
```

### Code Style
```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run linting
flake8

# Run type checking
mypy .
```

## Deployment

1. Set up a production database (SQLite or other supported by SQLAlchemy)
2. Configure CORS settings for your frontend domain
3. Set up proper authentication secrets
4. Use a production ASGI server like uvicorn behind nginx

Example production command:
```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --workers 4
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request