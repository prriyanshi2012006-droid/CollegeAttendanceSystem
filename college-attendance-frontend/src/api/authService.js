// src/api/authService.js
import axios from 'axios';

// The base URL for our Django backend API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// --- API Endpoints ---
export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/login/`,
    STUDENT_DASHBOARD: `${API_BASE_URL}/student/dashboard/`,
    FACULTY_CLASS_LIST: `${API_BASE_URL}/faculty/students-for-class/`,
    MARK_ATTENDANCE: `${API_BASE_URL}/faculty/mark-attendance/`,
    ADMIN_FACULTY: `${API_BASE_URL}/faculty/`, // Using router endpoint /api/faculty/
    ADMIN_COURSES: `${API_BASE_URL}/courses/`, // Using router endpoint /api/courses/
};


/**
 * Handles the login request to the Django backend.
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<Object>} An object containing access token, refresh token, and user data.
 */
export const login = async (username, password) => {
    try {
        const response = await axios.post(API_ENDPOINTS.LOGIN, {
            username,
            password,
        });
        
        // Success: Store tokens and return user data
        const { access, refresh, user } = response.data;
        
        // 1. Store tokens in localStorage for persistence
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        
        return user; // Return the user object for state management
        
    } catch (error) {
        // Handle API error response (e.g., 401 Unauthorized)
        throw error.response.data.detail || "Login failed due to an unknown error.";
    }
};


/**
 * Sets the default Authorization header for all future requests.
 * We will use this in the next step when fetching data.
 */
export const setAuthToken = (token) => {
    if (token) {
        // Apply the token to all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        // Delete the token if no token is passed (logout)
        delete axios.defaults.headers.common['Authorization'];
    }
};

/**
 * Handles the logout process by clearing local storage.
 */
export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setAuthToken(null);
    // Note: The UI layer (App.jsx) will handle state reset after calling this.
};