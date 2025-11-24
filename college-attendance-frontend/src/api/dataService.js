// src/api/dataService.js
import axios from 'axios';
import { API_ENDPOINTS } from './authService';

export const calculatePercentage = (attended, total) => {
  if (!total || total === 0) return 0;
  return (attended / total) * 100;
};

export const getStudentDashboard = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.STUDENT_DASHBOARD);
    return response.data;
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    throw error?.response?.data || 'Failed to fetch student data.';
  }
};

export const getFacultyClassList = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.FACULTY_CLASS_LIST);
    const initialAttendanceList = response.data.map((studentProfile) => ({
      studentProfileId: studentProfile.pk || studentProfile.id || null,
      userId: studentProfile.user?.id ?? null,
      name: studentProfile.user?.username ?? `${studentProfile.user?.first_name ?? ''} ${studentProfile.user?.last_name ?? ''}`.trim(),
      roll_number: studentProfile.roll_number ?? '',
      status: 'P',
    }));
    return initialAttendanceList;
  } catch (error) {
    console.error('Error fetching faculty class list:', error);
    throw error?.response?.data || 'Failed to fetch class list.';
  }
};

export const submitAttendance = async (attendanceRecords) => {
  try {
    if (!Array.isArray(attendanceRecords)) throw new Error('Attendance payload must be an array.');
    const response = await axios.post(API_ENDPOINTS.MARK_ATTENDANCE, attendanceRecords);
    return response.data;
  } catch (error) {
    console.error('Error submitting attendance:', error);
    const resp = error?.response?.data;
    if (Array.isArray(resp?.errors)) throw resp.errors;
    throw resp?.detail || error.message || 'Failed to submit attendance.';
  }
};

export const getFacultyList = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.ADMIN_FACULTY);
    return response.data;
  } catch (error) {
    console.error('Error fetching faculty list:', error);
    throw error?.response?.data || 'Failed to fetch faculty list.';
  }
};

export const getCourseList = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.ADMIN_COURSES);
    return response.data;
  } catch (error) {
    console.error('Error fetching course list:', error);
    throw error?.response?.data || 'Failed to fetch course list.';
  }
};
