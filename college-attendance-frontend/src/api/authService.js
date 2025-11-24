// src/api/authService.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login/`,
  TOKEN_REFRESH: `${API_BASE_URL}/token/refresh/`,   // matches project urls
  STUDENT_DASHBOARD: `${API_BASE_URL}/student/dashboard/`,
  FACULTY_CLASS_LIST: `${API_BASE_URL}/faculty/students-for-class/`,
  MARK_ATTENDANCE: `${API_BASE_URL}/faculty/mark-attendance/`,
  ADMIN_FACULTY: `${API_BASE_URL}/faculty/`,
  ADMIN_COURSES: `${API_BASE_URL}/courses/`,
};

export const login = async (username, password) => {
  try {
    const response = await axios.post(API_ENDPOINTS.LOGIN, { username, password });
    const { access, refresh, user } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    setAuthToken(access);
    return { access, refresh, user };
  } catch (error) {
    const msg = error?.response?.data?.detail || error?.response?.data || error.message || 'Login failed';
    throw new Error(msg);
  }
};

export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const getStoredAccessToken = () => localStorage.getItem('access_token');

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
  setAuthToken(null);
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available.');
  }
  try {
    const response = await axios.post(API_ENDPOINTS.TOKEN_REFRESH, { refresh: refreshToken });
    const newAccessToken = response.data.access;
    localStorage.setItem('access_token', newAccessToken);
    setAuthToken(newAccessToken);
    return newAccessToken;
  } catch (error) {
    logout();
    throw new Error('Token refresh failed. Logging out.');
  }
};

export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (!error.response) return Promise.reject(error);
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newAccessToken = await refreshAccessToken();
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        // eslint-disable-next-line no-unused-vars
        } catch (e) {
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    }
  );
};
