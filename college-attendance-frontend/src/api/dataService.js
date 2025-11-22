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
// src/api/dataService.js (CLEANED)

// ... (existing imports) ...

/**
 * Fetches the student's profile and dashboard data.
 * The request is automatically authenticated by the token set in App.jsx.
 */
export const getStudentDashboard = async (userId) => {
    try {
        // The Django view (updated above) now returns the calculated data!
        const response = await axios.get(API_ENDPOINTS.STUDENT_DASHBOARD); 
        
        return response.data; // Return the real, calculated data structure

    } catch (error) {
        console.error("Error fetching student dashboard:", error);
        throw error.response.data.detail || "Failed to fetch student data.";
    }
};

// ... (rest of dataService.js remains unchanged) ...
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
// src/api/dataService.js (Add these functions)
// ... (existing code for getStudentDashboard, getFacultyClassList, submitAttendance) ...

/**
 * Fetches the list of all Faculty users.
 */
export const getFacultyList = async () => {
    try {
        // GET request to /api/faculty/
        const response = await axios.get(API_ENDPOINTS.ADMIN_FACULTY);
        return response.data;
    } catch (error) {
        console.error("Error fetching faculty list:", error);
        throw error.response?.data?.detail || "Failed to fetch faculty list.";
    }
};

/**
 * Deletes a Faculty user.
 */
export const deleteFaculty = async (facultyId) => {
    try {
        // DELETE request to /api/faculty/{id}/
        await axios.delete(`${API_ENDPOINTS.ADMIN_FACULTY}${facultyId}/`);
        return true;
    } catch (error) {
        console.error("Error deleting faculty:", error);
        throw error.response?.data?.detail || "Failed to delete faculty.";
    }
};

/**
 * Fetches the list of all Courses.
 */
export const getCourseList = async () => {
    try {
        // GET request to /api/courses/
        const response = await axios.get(API_ENDPOINTS.ADMIN_COURSES);
        return response.data;
    } catch (error) {
        console.error("Error fetching course list:", error);
        throw error.response?.data?.detail || "Failed to fetch course list.";
    }
};


/**
 * Mocks the overall college statistics (Real complex calculation would be in Django).
 */
export const getAdminStats = async () => {
    // This is still mocked, as complex aggregation is not trivial in a single endpoint
    return {
        totalStudents: 1200,
        totalFaculty: (await getFacultyList()).length, // Use real faculty count
        averageAttendance: 82.5,
        courses: (await getCourseList()).length, // Use real course count
        departmentalReport: [
            { dept: 'Computer Science', avg: 88.2, compliance: 'High' },
            { dept: 'Electrical Eng.', avg: 79.5, compliance: 'Moderate' },
            { dept: 'Mechanical Eng.', avg: 65.1, compliance: 'Low' },
            { dept: 'Mathematics', avg: 92.0, compliance: 'High' },
        ]
    };
}