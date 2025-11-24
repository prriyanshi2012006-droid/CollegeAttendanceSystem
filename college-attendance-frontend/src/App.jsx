import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import StudentDashboard from './components/StudentDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
    const [user, setUser] = useState({
        id: 1,
        username: 'john_doe',
        first_name: 'John',
        role: 'student', // Change to 'faculty' or 'admin' to test other dashboards
    });

    const handleLogout = () => {
        alert('Logged out!');
        setUser(null);
    };

    if (!user) return <Navigate to="/" />;

    return (
        <Router>
            <AppLayout user={user} onLogout={handleLogout}>
                <Routes>
                    {user.role === 'student' && <Route path="/student/dashboard" element={<StudentDashboard user={user} />} />}
                    {user.role === 'faculty' && <Route path="/faculty/dashboard" element={<FacultyDashboard user={user} />} />}
                    {user.role === 'admin' && <Route path="/admin/dashboard" element={<AdminDashboard user={user} />} />}
                    <Route path="*" element={<Navigate to={user.role === 'student' ? "/student/dashboard" : user.role === 'faculty' ? "/faculty/dashboard" : "/admin/dashboard"} />} />
                </Routes>
            </AppLayout>
        </Router>
    );
}

export default App;
