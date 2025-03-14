import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeProvider';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import NavigationBar from './components/NavigationBar';
import SideNav from './components/SideNav';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WordListsPage from './pages/WordListsPage';
import PracticePage from './pages/PracticePage';
import ProgressPage from './pages/ProgressPage';
import MistakePatternsPage from './pages/MistakePatternsPage';

import './App.css';

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="spelling-teacher-theme">
      <Router future={{ v7_relativeSplatPath: true }}>
        <AuthProvider>
          <SidebarProvider>
            <div className="min-h-screen bg-background">
              <NavigationBar />
              <div className="flex">
                <SideNav />
                <MainContent />
              </div>
            </div>
          </SidebarProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

interface MainContentProps {
}

const MainContent: React.FC<MainContentProps> = () => {
  const { collapsed } = useSidebar();
  
  return (
    <main className={`flex-1 p-4 transition-all duration-300 ${collapsed ? 'md:ml-0' : ''}`}>
      <Routes>
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
        <Route path="/practice/:listId" element={
          <ProtectedRoute>
            <PracticePage />
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
    </main>
  );
};

export default App;