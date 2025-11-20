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

// ... Future functions for Faculty and Admin will go here ...