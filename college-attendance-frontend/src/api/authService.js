// src/api/authService.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login/`,
  STUDENT_DASHBOARD: `${API_BASE_URL}/student/dashboard/`,
  FACULTY_CLASS_LIST: `${API_BASE_URL}/faculty/students-for-class/`,
  MARK_ATTENDANCE: `${API_BASE_URL}/faculty/mark-attendance/`,
  ADMIN_FACULTY: `${API_BASE_URL}/faculty/`,
  ADMIN_COURSES: `${API_BASE_URL}/courses/`,
};

// Login: returns { access, refresh, user }
export const login = async (username, password) => {
  try {
    const response = await axios.post(API_ENDPOINTS.LOGIN, { username, password });

    // Backend returns { access, refresh, user }
    const { access, refresh, user } = response.data;

    // Persist tokens
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    // Set axios default header
    setAuthToken(access);

    // Return everything for the UI
    return { access, refresh, user };
  } catch (error) {
    // More robust error extraction
    const msg = error?.response?.data?.detail || error?.response?.data || error.message || 'Login failed';
    throw new Error(msg);
  }
};

// Set or remove the Authorization header for axios
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Optional helper to get stored tokens
export const getStoredAccessToken = () => localStorage.getItem('access_token');

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  setAuthToken(null);
};
