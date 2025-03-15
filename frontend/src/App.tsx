import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeProvider';
import { PageProvider, usePage } from './contexts/PageProvider';
import NavigationBar from './components/NavigationBar';
import ProtectedRoute from './components/ProtectedRoute';
import { LoadingBar } from './components/LoadingBar';
import { AnimatePresence } from 'framer-motion';

// Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WordListsPage from './pages/WordListsPage';
import ProgressPage from './pages/ProgressPage';
import MistakePatternsPage from './pages/MistakePatternsPage';

import './App.css';

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="spelling-teacher-theme">
      <Router future={{ v7_relativeSplatPath: true }}>
        <AuthProvider>
          <PageProvider>
            <div className="min-h-screen bg-background">
              <LoadingBar />
              <NavigationBar />
              <MainContent />
            </div>
          </PageProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

interface MainContentProps {}

const MainContent: React.FC<MainContentProps> = () => {
  const location = useLocation();
  const { setIsTransitioning, setPreviousPath } = usePage();
  
  // Handle route changes
  React.useEffect(() => {
    const handleRouteTransitionStart = () => {
      setPreviousPath(location.pathname);
      setIsTransitioning(true);
    };

    const handleRouteTransitionEnd = () => {
      setIsTransitioning(false);
    };

    // Trigger transition start
    handleRouteTransitionStart();

    // Cleanup transition after animation
    const timer = setTimeout(handleRouteTransitionEnd, 300);
    return () => clearTimeout(timer);
  }, [location.pathname, setIsTransitioning, setPreviousPath]);
  
  return (
    <main className="container transition-all duration-300 ease-in-out min-h-[calc(100vh-3.5rem)] px-4 py-6 md:px-6 lg:px-8">
      <AnimatePresence mode="wait" onExitComplete={() => setIsTransitioning(false)}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/word-lists" element={
            <ProtectedRoute>
              <WordListsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/progress/:listId" element={
            <ProtectedRoute>
              <ProgressPage />
            </ProtectedRoute>
          } />
          <Route path="/mistake-patterns" element={
            <ProtectedRoute>
              <MistakePatternsPage />
            </ProtectedRoute>
          } />
          <Route path="/mistake-patterns/:listId" element={
            <ProtectedRoute>
              <MistakePatternsPage />
            </ProtectedRoute>
          } />
        </Routes>
      </AnimatePresence>

      <ScrollRestoration />
    </main>
  );
};

// Component to handle scroll restoration
const ScrollRestoration: React.FC = () => {
  const location = useLocation();
  const { isTransitioning } = usePage();
  
  React.useEffect(() => {
    if (!isTransitioning) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, isTransitioning]);
  
  return null;
};

export default App;