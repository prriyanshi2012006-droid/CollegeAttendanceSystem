// Mock API for demonstration purposes

export const calculatePercentage = (attended, total) => total === 0 ? 0 : (attended / total) * 100;

export const getStudentDashboard = async (studentId) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                roll_number: 'S123',
                course_of_study: 'Computer Science',
                user: { username: 'john_doe' },
                overall: { totalClasses: 50, attendedClasses: 42 },
                detailedAttendance: [
                    { subject: 'Math', faculty: 'Dr. Smith', total_classes_held: 12, attended_classes: 10 },
                    { subject: 'CS', faculty: 'Prof. Lee', total_classes_held: 15, attended_classes: 13 },
                    { subject: 'Physics', faculty: 'Dr. Brown', total_classes_held: 10, attended_classes: 9 },
                ],
            });
        }, 500);
    });
};

export const getFacultyClassList = async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { studentId: 1, studentProfileId: 1, roll_number: 'S101', name: 'Alice', status: 'P' },
                { studentId: 2, studentProfileId: 2, roll_number: 'S102', name: 'Bob', status: 'A' },
                { studentId: 3, studentProfileId: 3, roll_number: 'S103', name: 'Charlie', status: 'P' },
            ]);
        }, 500);
    });
};

export const submitAttendance = async (records) => {
    return new Promise(resolve => setTimeout(() => resolve({ message: 'Attendance submitted successfully!' }), 500));
};

export const getFacultyList = async () => {
    return new Promise(resolve => setTimeout(() => resolve([
        { id: 1, first_name: 'Alice', department: 'CS' },
        { id: 2, first_name: 'Bob', department: 'Math' },
    ]), 500));
};

export const getCourseList = async () => {
    return new Promise(resolve => setTimeout(() => resolve([
        { id: 1, course_code: 'CS101', title: 'Intro to CS', faculty_name: 'Alice' },
        { id: 2, course_code: 'MATH101', title: 'Calculus I', faculty_name: 'Bob' },
    ]), 500));
};

export const deleteFaculty = async (id) => new Promise(resolve => setTimeout(() => resolve({ success: true }), 300));
export const deleteCourse = async (id) => new Promise(resolve => setTimeout(() => resolve({ success: true }), 300));

export const getAdminStats = async () => {
    return new Promise(resolve => setTimeout(() => resolve({
        totalStudents: 120,
        totalFaculty: 12,
        averageAttendance: 82,
        courses: 8,
        departmentalReport: [
            { dept: 'CS', avg: 85, compliance: 'High' },
            { dept: 'Math', avg: 78, compliance: 'Moderate' },
            { dept: 'Physics', avg: 65, compliance: 'Low' },
        ],
    }), 500));
};
