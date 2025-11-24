// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Paper, Card, CardContent, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Button, Chip, IconButton,
    Tooltip, CircularProgress, Alert
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
// --- NEW IMPORTS ---
import { getFacultyList, deleteFaculty, getCourseList, getAdminStats } from '../api/dataService'; 


const AdminDashboard = ({ user }) => {
    const [facultyList, setFacultyList] = useState([]);
    const [courseList, setCourseList] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- EFFECT: Fetch All Admin Data on Mount ---
    useEffect(() => {
        const fetchAdminData = async () => {
            setIsLoading(true);
            try {
                const [faculty, courses, adminStats] = await Promise.all([
                    getFacultyList(),
                    getCourseList(),
                    getAdminStats()
                ]);
                
                setFacultyList(faculty);
                setCourseList(courses);
                setStats(adminStats);
                setError(null);
            } catch (err) {
                console.error("Admin Dashboard Fetch Error:", err);
                setError(`Failed to load admin data: ${err}`);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && user.role === 'admin') {
            fetchAdminData();
        }
    }, [user]); 

    // --- HANDLER: Delete Faculty ---
    const handleDeleteFaculty = async (id) => {
        if (window.confirm(`Are you sure you want to permanently delete Faculty ID ${id}?`)) {
            try {
                await deleteFaculty(id);
                // Update the state locally by filtering out the deleted faculty
                setFacultyList(prevList => prevList.filter(f => f.id !== id));
            } catch (err) {
                setError(`Error deleting faculty: ${err}`);
            }
        }
    };
    
    // --- HANDLER: Mock Edit Function ---
    const handleEditFaculty = (id) => {
        alert(`MOCK: Editing Faculty ID ${id}. In a full application, a modal form would open here to PUT data back to /api/faculty/${id}/`);
    };
    
    // --- HANDLER: Mock Edit Course Function ---
    const handleEditCourse = (id) => {
        alert(`MOCK: Editing Course ID ${id}. In a full application, a modal form would open here to PUT data back to /api/courses/${id}/`);
    };

    // --- CONDITIONAL RENDERING ---
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading administrator data...</Typography>
            </Box>
        );
    }
    
    if (error) {
        return <Alert severity="error">Error loading dashboard: {error}</Alert>;
    }
    
    if (!stats) {
        return <Alert severity="warning">No stats data found.</Alert>;
    }

    // Use stats for overall summary
    const MOCK_REPORTS = stats;

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                Admin Control Panel
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Welcome, {user.first_name || user.username}
            </Typography>

            {/* 1. Overall Summary Statistics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Card 1: Total Students */}
                <Grid item xs={12} sm={6} lg={3}>
                    <Card raised sx={{ borderLeft: '4px solid #1976d2', height: '100%' }}>
                        <CardContent>
                            <PeopleIcon color="primary" sx={{ fontSize: 30, mb: 1 }} />
                            <Typography variant="h6" color="text.secondary">Total Students</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                                {MOCK_REPORTS.totalStudents}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Card 2: Total Faculty (REAL API DATA) */}
                <Grid item xs={12} sm={6} lg={3}>
                    <Card raised sx={{ borderLeft: '4px solid #f97316', height: '100%' }}>
                        <CardContent>
                            <SupervisorAccountIcon sx={{ color: '#f97316', fontSize: 30, mb: 1 }} />
                            <Typography variant="h6" color="text.secondary">Total Faculty</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                                {MOCK_REPORTS.totalFaculty}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Card 3: Average Attendance */}
                <Grid item xs={12} sm={6} lg={3}>
                    <Card raised sx={{ borderLeft: '4px solid #10b981', height: '100%' }}>
                        <CardContent>
                            <AssessmentIcon sx={{ color: '#10b981', fontSize: 30, mb: 1 }} />
                            <Typography variant="h6" color="text.secondary">Avg. Attendance</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                                {MOCK_REPORTS.averageAttendance}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                 {/* Card 4: Total Courses (REAL API DATA) */}
                <Grid item xs={12} sm={6} lg={3}>
                    <Card raised sx={{ borderLeft: '4px solid #9c27b0', height: '100%' }}>
                        <CardContent>
                            <AssignmentTurnedInIcon sx={{ color: '#9c27b0', fontSize: 30, mb: 1 }} />
                            <Typography variant="h6" color="text.secondary">Total Courses</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                                {MOCK_REPORTS.courses}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            
            <Grid container spacing={4}>
                {/* 2. Manage Faculty Table (REAL API DATA) */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
                            Manage Faculty Records
                        </Typography>
                        <TableContainer sx={{ maxHeight: 400 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Dept</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {facultyList.map((faculty) => (
                                        <TableRow key={faculty.id} hover>
                                            <TableCell>{faculty.id}</TableCell>
                                            <TableCell>{faculty.first_name || faculty.username}</TableCell>
                                            <TableCell>{faculty.department || 'N/A'}</TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Edit Faculty">
                                                    <IconButton color="primary" onClick={() => handleEditFaculty(faculty.id)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Faculty">
                                                    <IconButton color="error" onClick={() => handleDeleteFaculty(faculty.id)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button variant="contained" size="small" sx={{ mt: 2 }} onClick={() => alert("MOCK: Add Faculty modal open")}>Add New Faculty</Button>
                    </Paper>
                </Grid>

                {/* 3. Manage Courses Table (REAL API DATA) */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
                            Manage Course Records
                        </Typography>
                        <TableContainer sx={{ maxHeight: 400 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Faculty</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {courseList.map((course) => (
                                        <TableRow key={course.id} hover>
                                            <TableCell>{course.course_code}</TableCell>
                                            <TableCell>{course.title}</TableCell>
                                            <TableCell>{course.faculty_name || 'Unassigned'}</TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Edit Course">
                                                    <IconButton color="primary" onClick={() => handleEditCourse(course.id)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Course">
                                                    <IconButton color="error" onClick={() => handleDeleteFaculty(course.id)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button variant="contained" size="small" sx={{ mt: 2 }} onClick={() => alert("MOCK: Add Course modal open")}>Add New Course</Button>
                    </Paper>
                </Grid>
            </Grid>
            
            {/* 4. Departmental Report Table (STILL MOCKED) */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
                    Overall Departmental Attendance (Mock Data)
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Avg. Attendance %</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Compliance</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stats.departmentalReport.map((row, index) => (
                                <TableRow key={index} hover>
                                    <TableCell>{row.dept}</TableCell>
                                    <TableCell align="right">{row.avg}%</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={row.compliance}
                                            color={row.compliance === 'High' ? 'success' : row.compliance === 'Moderate' ? 'primary' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

        </Box>
    );
};

export default AdminDashboard;