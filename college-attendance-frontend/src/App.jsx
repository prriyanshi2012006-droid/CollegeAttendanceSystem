// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // You need to install this!
import { Box, LinearProgress } from '@mui/material';

import LoginPage from './components/LoginPage';
import AppLayout from './components/AppLayout'; 
import StudentDashboard from './components/StudentDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import AdminDashboard from './components/AdminDashboard';

// --- New Imports ---
import { setAuthToken, logout } from './api/authService'; 

// Initial State structure
const initialAuthState = {
    isAuthenticated: false,
    user: null, // {id: number, name: string, role: string}
};

// --- INSTALL REQUIRED PACKAGE ---
// Before running the server again, open your terminal (in college-attendance-frontend) and run:
// npm install jwt-decode


function App() {
    const [authState, setAuthState] = useState(initialAuthState);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true); // New loading state for startup

    // --- EFFECT 1: Check for existing token on app load ---
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                // Check token expiration (Django tokens typically last 5 minutes)
                if (decodedUser.exp * 1000 > Date.now()) {
                    // Token is valid: Set the token for all future requests
                    setAuthToken(token);
                    
                    // Since we don't have the full user data in the token, 
                    // we'll assume a successful login based on token presence for now.
                    // (In a real app, you would fetch /api/user/details)
                    
                    // We need a helper to reconstruct the basic user object
                    const storedUser = JSON.parse(localStorage.getItem('user_data')); 
                    
                    setAuthState({ 
                        isAuthenticated: true, 
                        user: storedUser || { 
                            id: decodedUser.user_id, 
                            username: decodedUser.username || decodedUser.user_id, 
                            role: 'unknown' // Will be updated on first successful login
                        }
                    });
                } else {
                    // Token expired
                    logout();
                }
            } catch (error) {
                console.error("Failed to decode or use token:", error);
                logout();
            }
        }
        setIsCheckingAuth(false);
    }, []); // Runs only once on mount

    // --- Custom login helper to store full user data ---
    const handleLoginSuccess = ({ user, isAuthenticated }) => {
        setAuthState({ user, isAuthenticated });
        // Store the full user object to local storage for persistence on refresh
        localStorage.setItem('user_data', JSON.stringify(user));
        
        // Also set the global Axios header using the token stored by authService.login()
        const token = localStorage.getItem('access_token');
        if (token) {
             setAuthToken(token);
        }
    }

    // --- Custom logout helper ---
    const handleLogout = () => {
        logout(); // Clears localStorage and Auth header
        setAuthState(initialAuthState);
    };

    // Show a loading bar while checking the initial authentication status
    if (isCheckingAuth) {
        return (
            <Box sx={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LinearProgress sx={{ width: '80%' }} />
            </Box>
        );
    }
    
    // Helper component for protected routes (as defined before)
    const ProtectedRoute = ({ children, requiredRole }) => {
        if (!authState.isAuthenticated) {
            return <Navigate to="/login" replace />;
        }
        
        // If the requiredRole is specified and the user role doesn't match, redirect
        if (requiredRole && authState.user.role !== requiredRole) {
            const dashboardPath = `/${authState.user.role}/dashboard`;
            return <Navigate to={dashboardPath} replace />;
        }

        return (
            <AppLayout user={authState.user} onLogout={handleLogout}>
                {children}
            </AppLayout>
        );
    };

    return (
        <div className="App">
            <Routes>
                {/* 1. Login Route: Use handleLoginSuccess callback */}
                <Route 
                    path="/login" 
                    element={
                        authState.isAuthenticated 
                            ? <Navigate to={`/${authState.user.role}/dashboard`} replace /> 
                            : <LoginPage setAuthState={handleLoginSuccess} />
                    } 
                />

                {/* 2. Role-Specific Protected Routes */}
                <Route 
                    path="/student/dashboard" 
                    element={<ProtectedRoute requiredRole="student"><StudentDashboard user={authState.user} /></ProtectedRoute>} 
                />
                <Route 
                    path="/faculty/dashboard" 
                    element={<ProtectedRoute requiredRole="faculty"><FacultyDashboard user={authState.user} /></ProtectedRoute>} 
                />
                <Route 
                    path="/admin/dashboard" 
                    element={<ProtectedRoute requiredRole="admin"><AdminDashboard user={authState.user} /></ProtectedRoute>} 
                />

                {/* 3. Default/Root Route */}
                <Route 
                    path="/" 
                    element={
                        authState.isAuthenticated 
                            ? <Navigate to={`/${authState.user.role}/dashboard`} replace /> 
                            : <Navigate to="/login" replace />
                    } 
                />
                
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default App;