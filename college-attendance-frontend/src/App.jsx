// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
// We will create these next:
import AppLayout from './components/AppLayout'; 
import StudentDashboard from './components/StudentDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import AdminDashboard from './components/AdminDashboard';


// Initial State structure for a non-authenticated user
const initialAuthState = {
    isAuthenticated: false,
    user: null, // {id: number, name: string, role: string}
};

function App() {
    // State to hold the authentication information
    const [authState, setAuthState] = useState(initialAuthState);

    // Function to handle logout
    const handleLogout = () => {
        setAuthState(initialAuthState);
    };

    // Helper component for protected routes
    // This checks if the user is authenticated and has the required role
    const ProtectedRoute = ({ children, requiredRole }) => {
        if (!authState.isAuthenticated) {
            // If not logged in, redirect to login page
            return <Navigate to="/login" replace />;
        }
        
        // If the requiredRole is specified and the user role doesn't match, redirect (e.g., to student dashboard)
        if (requiredRole && authState.user.role !== requiredRole) {
            console.warn(`Access Denied: User (${authState.user.role}) attempted to access ${requiredRole} route.`);
            // Redirect unauthorized users to their own dashboard
            const dashboardPath = `/${authState.user.role}/dashboard`;
            return <Navigate to={dashboardPath} replace />;
        }

        // Render the requested component within the layout
        return (
            <AppLayout user={authState.user} onLogout={handleLogout}>
                {children}
            </AppLayout>
        );
    };

    return (
        <div className="App">
            <Routes>
                {/* 1. Login Route: If authenticated, redirect to dashboard */}
                <Route 
                    path="/login" 
                    element={
                        authState.isAuthenticated 
                            ? <Navigate to={`/${authState.user.role}/dashboard`} replace /> 
                            : <LoginPage setAuthState={setAuthState} />
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

                {/* 3. Default/Root Route: Redirects non-logged-in users to login, or logged-in users to their dashboard */}
                <Route 
                    path="/" 
                    element={
                        authState.isAuthenticated 
                            ? <Navigate to={`/${authState.user.role}/dashboard`} replace /> 
                            : <Navigate to="/login" replace />
                    } 
                />
                
                {/* 4. Catch-all for 404s (optional but good practice) */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default App;