# SpellWise Frontend

A React-based frontend for the SpellWise application that helps users improve their spelling through interactive practice.

## Features

- User authentication (login/register)
- Upload word lists via CSV
- Interactive spelling practice with audio pronunciation
- Progress tracking and statistics
- Responsive design for desktop and mobile

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and add:
```
REACT_APP_API_URL=http://localhost:8000
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Building for Production

To create a production build:

```bash
npm run build
```

The build will be available in the `build` directory.

## CSV File Format

Upload word lists using CSV files with the following columns:
- `word` (required): The word to learn
- `meaning` (optional): Definition of the word
- `example` (optional): Example usage of the word

Example:
```csv
word,meaning,example
accommodate,to provide lodging or room for,The hotel can accommodate up to 500 guests
rhythm,a strong regular repeated pattern,She danced to the rhythm of the music
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Project Structure

```
src/
├── components/    # Reusable UI components
├── contexts/      # React contexts (auth, etc.)
├── pages/         # Page components
├── services/      # API services
└── App.js         # Main application component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
