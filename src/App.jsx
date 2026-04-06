import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SetupPage from './pages/SetupPage';
import LiveInterviewPage from './pages/LiveInterviewPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AuthService from './services/authService';
import './index.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const user = AuthService.getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Auth Route Wrapper (redirects away if already logged in → goes to /setup)
const AuthRoute = ({ children }) => {
  const user = AuthService.getCurrentUser();
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
};


function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/login" element={
            <AuthRoute><LoginPage /></AuthRoute>
          } />
          <Route path="/signup" element={
            <AuthRoute><SignupPage /></AuthRoute>
          } />
          
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/setup" element={
            <ProtectedRoute><SetupPage /></ProtectedRoute>
          } />
          <Route path="/interview" element={
             <ProtectedRoute><LiveInterviewPage /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
             <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
