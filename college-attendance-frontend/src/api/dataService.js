// src/api/dataService.js
import axios from 'axios';
import { API_ENDPOINTS } from './authService'; 

// Function to calculate attendance percentage (needed for display logic)
export const calculatePercentage = (attended, total) => {
    if (total === 0 || total === null) return 0;
    return (attended / total) * 100;
};


/**
 * Fetches the student's profile and dashboard data.
 * The request is automatically authenticated by the token set in App.jsx.
 */
export const getStudentDashboard = async (userId) => {
    // Note: The StudentDashboardView in Django is a RetrieveAPIView 
    // and automatically targets the logged-in user, so we don't need userId in the URL.
    try {
        const response = await axios.get(API_ENDPOINTS.STUDENT_DASHBOARD);
        
        // --- MOCKING AGGREGATED DATA ---
        // Since the Django view only returns StudentProfile, we'll manually 
        // inject mock attendance data here for now, until we refine the Django view.
        const studentData = response.data;
        
        // Mocking overall and detailed attendance (real logic needed in Django)
        studentData.overall = { totalClasses: 120, attendedClasses: 105 }; 
        studentData.detailedAttendance = [
            { subject: 'Programming with Python', faculty: 'Prof. Vane', total: 40, attended: 38 },
            { subject: 'Advanced Calculus', faculty: 'Dr. Doe', total: 30, attended: 25 },
            { subject: 'Database Systems', faculty: 'Dr. Smith', total: 50, attended: 42 },
        ];
        // -------------------------------
        
        return studentData;

    } catch (error) {
        console.error("Error fetching student dashboard:", error);
        throw error.response.data.detail || "Failed to fetch student data.";
    }
};
// src/api/dataService.js (Add these functions)
// ... (existing code for getStudentDashboard and helpers) ...

/**
 * Fetches the list of students for the faculty member's assigned classes.
 * This list is used for marking daily attendance.
 */
export const getFacultyClassList = async () => {
    try {
        const response = await axios.get(API_ENDPOINTS.FACULTY_CLASS_LIST);
        
        // Transform the response to the format the frontend expects (list of students)
        // We initialize status to 'Present' by default for quick marking
        const initialAttendanceList = response.data.map(studentProfile => ({
            studentId: studentProfile.user.id, // Django User ID
            studentProfileId: studentProfile.user, // Django StudentProfile ID
            name: studentProfile.user.username, // Using username for simplicity
            roll_number: studentProfile.roll_number,
            status: 'P', // 'P' for Present is the default status for marking
        }));
        
        return initialAttendanceList;

    } catch (error) {
        console.error("Error fetching faculty class list:", error);
        throw error.response?.data?.detail || "Failed to fetch class list.";
    }
};


/**
 * Submits the final attendance data to the Django API.
 * @param {Array<Object>} attendanceData - The list of records to submit.
 */
export const submitAttendance = async (attendanceRecords) => {
    try {
        const response = await axios.post(API_ENDPOINTS.MARK_ATTENDANCE, attendanceRecords);
        return response.data;

    } catch (error) {
        console.error("Error submitting attendance:", error);
        // Handle multi-status response (207) or bad request (400)
        if (error.response?.data?.errors) {
            throw error.response.data.errors;
        }
        throw error.response?.data?.detail || "Failed to submit attendance.";
    }
};

// ... (exporting functions at the bottom) ...

// ... Future functions for Faculty and Admin will go here ...
export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/auth/login/`, {
    username,
    password,
  });

  const access = response.data.access;
  const user = response.data.user;

  // Store token
  localStorage.setItem("access_token", access);

  return { access, user };
};
