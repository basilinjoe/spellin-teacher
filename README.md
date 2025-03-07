# Spelling Teacher

An interactive web application for practicing and improving spelling through audio-based learning.

## Features

- User authentication and account management
- Upload custom word lists via CSV files
- Text-to-speech pronunciation of words
- Interactive spelling practice
- Progress tracking and statistics
- Responsive design for desktop and mobile

## Technology Stack

### Backend
- FastAPI (Python web framework)
- SQLAlchemy (Database ORM)
- SQLite (Database)
- gTTS (Google Text-to-Speech)
- NLTK (Natural Language Toolkit)
- JWT Authentication

### Frontend
- React
- React Bootstrap
- React Router
- Axios
- Context API for state management

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/spelling-teacher.git
cd spelling-teacher
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Create your environment file
```

3. Set up the frontend:
```bash
cd frontend
npm install
cp .env.example .env  # Create your environment file
```

## Configuration

### Backend Configuration
Edit the `.env` file in the backend directory:
```
SECRET_KEY=your-secure-secret-key
DATABASE_URL=sqlite+aiosqlite:///./spelling_teacher.db
```

### Frontend Configuration
Edit the `.env` file in the frontend directory:
```
REACT_APP_API_URL=http://localhost:8000
```

## Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## CSV File Format

Upload word lists using CSV files with the following format:
```csv
word,meaning,example
accommodate,to provide lodging or room for,The hotel can accommodate up to 500 guests
rhythm,a strong regular repeated pattern,She danced to the rhythm of the music
```

## Development

### Backend Structure
```
backend/
├── app/
│   ├── api/           # API endpoints
│   ├── core/          # Core configuration
│   ├── models/        # Database models
│   ├── schemas/       # Pydantic schemas
│   └── services/      # Business logic
├── static/           # Static files (audio, uploads)
└── main.py          # Application entry point
```

### Frontend Structure
```
frontend/
├── public/
└── src/
    ├── components/   # Reusable components
    ├── contexts/     # React contexts
    ├── pages/        # Page components
    ├── services/     # API services
    └── App.js        # Root component
```

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.