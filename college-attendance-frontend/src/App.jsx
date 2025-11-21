// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Box, LinearProgress } from '@mui/material';

// Auth helpers
import { setAuthToken, getStoredAccessToken, logout } from './api/authService';

// Pages + Layout
import LoginPage from './components/LoginPage';
import AppLayout from './components/AppLayout';
import StudentDashboard from './components/StudentDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import AdminDashboard from './components/AdminDashboard';

const initialAuthState = {
  isAuthenticated: false,
  user: null,
};

function App() {
  const [authState, setAuthState] = useState(initialAuthState);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ----------------------------------------
  // 1️⃣ AUTO-LOGIN CHECK (when page refreshes)
  // ----------------------------------------
  useEffect(() => {
    const token = getStoredAccessToken();

    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Check token expiry
        if (decoded.exp * 1000 > Date.now()) {
          setAuthToken(token);

          const storedUser = JSON.parse(localStorage.getItem("user_data"));

          setAuthState({
            isAuthenticated: true,
            user: storedUser || {
              id: decoded.user_id,
              username: decoded.username || decoded.user_id,
              role: storedUser?.role || "unknown",
            }
          });
        } else {
          logout();
        }
      } catch (err) {
        console.error("Token decode failed:", err);
        logout();
      }
    }

    setIsCheckingAuth(false);
  }, []);

  // ----------------------------------------
  // 2️⃣ LOGIN HANDLER (called by LoginPage)
  // ----------------------------------------
  const handleLoginSuccess = ({ user, isAuthenticated }) => {
    setAuthState({ user, isAuthenticated });

    localStorage.setItem("user_data", JSON.stringify(user));

    // Set auth token globally for Axios
    const token = getStoredAccessToken();
    if (token) setAuthToken(token);
  };

  // ----------------------------------------
  // 3️⃣ LOGOUT HANDLER
  // ----------------------------------------
  const handleLogout = () => {
    logout();
    setAuthState(initialAuthState);
  };

  // ----------------------------------------
  // Loading UI during initial token check
  // ----------------------------------------
  if (isCheckingAuth) {
    return (
      <Box sx={{ width: "100%", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LinearProgress sx={{ width: "80%" }} />
      </Box>
    );
  }

  // ----------------------------------------
  // 4️⃣ Protected Route Wrapper
  // ----------------------------------------
  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!authState.isAuthenticated) return <Navigate to="/login" replace />;

    if (requiredRole && authState.user.role !== requiredRole) {
      return <Navigate to={`/${authState.user.role}/dashboard`} replace />;
    }

    return (
      <AppLayout user={authState.user} onLogout={handleLogout}>
        {children}
      </AppLayout>
    );
  };

  // ----------------------------------------
  // 5️⃣ APP ROUTES
  // ----------------------------------------
  return (
    <Routes>

      {/* LOGIN PAGE */}
      <Route
        path="/login"
        element={
          authState.isAuthenticated
            ? <Navigate to={`/${authState.user.role}/dashboard`} replace />
            : <LoginPage setAuthState={handleLoginSuccess} />
        }
      />

      {/* DASHBOARDS */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard user={authState.user} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/faculty/dashboard"
        element={
          <ProtectedRoute requiredRole="faculty">
            <FacultyDashboard user={authState.user} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard user={authState.user} />
          </ProtectedRoute>
        }
      />

      {/* ROOT PATH */}
      <Route
        path="/"
        element={
          authState.isAuthenticated
            ? <Navigate to={`/${authState.user.role}/dashboard`} replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
