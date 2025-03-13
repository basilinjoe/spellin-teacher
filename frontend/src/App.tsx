import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import NavigationBar from './components/NavigationBar';
import SideNav from './components/SideNav';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WordListsPage from './pages/WordListsPage';
import UploadPage from './pages/UploadPage';
import PracticePage from './pages/PracticePage';
import ProgressPage from './pages/ProgressPage';
import MistakePatternsPage from './pages/MistakePatternsPage';
import ReviewPage from './pages/ReviewPage';
import AudioGenerationPage from './pages/AudioGenerationPage';

// Styles - Removed Bootstrap import
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <NavigationBar />
          <div className="flex">
            <SideNav />
            <main className="flex-grow p-3">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected routes */}
                <Route
                  path="/word-lists"
                  element={
                    <ProtectedRoute>
                      <WordListsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/upload"
                  element={
                    <ProtectedRoute>
                      <UploadPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/practice/:listId"
                  element={
                    <ProtectedRoute>
                      <PracticePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/progress/:listId"
                  element={
                    <ProtectedRoute>
                      <ProgressPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mistake-patterns"
                  element={
                    <ProtectedRoute>
                      <MistakePatternsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mistake-patterns/:listId"
                  element={
                    <ProtectedRoute>
                      <MistakePatternsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/review"
                  element={
                    <ProtectedRoute>
                      <ReviewPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/audio-generation"
                  element={
                    <ProtectedRoute>
                      <AudioGenerationPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;