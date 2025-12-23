// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Favorites from './pages/Favorites';
import Review from './pages/Review';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import authService from './services/authService';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="app-root">
          <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/favorites" 
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/review/:cafeId" 
            element={
              <ProtectedRoute>
                <Review />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
          />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
