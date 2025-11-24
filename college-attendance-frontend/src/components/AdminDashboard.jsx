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
import { getFacultyList, deleteFaculty, getCourseList, deleteCourse, getAdminStats } from '../api/dataService';

const AdminDashboard = ({ user }) => {
    const [facultyList, setFacultyList] = useState([]);
    const [courseList, setCourseList] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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
                setError(`Failed to load admin data: ${err.message || err}`);
            } finally {
                setIsLoading(false);
            }
        };
        if (user?.role === 'admin') fetchAdminData();
    }, [user]);

    const handleDeleteFaculty = async (id) => {
        if (window.confirm(`Are you sure you want to delete Faculty ID ${id}?`)) {
            try {
                await deleteFaculty(id);
                setFacultyList(prev => prev.filter(f => f.id !== id));
            } catch (err) {
                setError(`Error deleting faculty: ${err.message || err}`);
            }
        }
    };

    const handleDeleteCourse = async (id) => {
        if (window.confirm(`Are you sure you want to delete Course ID ${id}?`)) {
            try {
                await deleteCourse(id);
                setCourseList(prev => prev.filter(c => c.id !== id));
            } catch (err) {
                setError(`Error deleting course: ${err.message || err}`);
            }
        }
    };

    const handleEditFaculty = (id) => alert(`MOCK: Edit Faculty ID ${id}`);
    const handleEditCourse = (id) => alert(`MOCK: Edit Course ID ${id}`);

    if (isLoading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading admin data...</Typography>
        </Box>
    );
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!stats) return <Alert severity="warning">No admin stats available.</Alert>;

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>Admin Control Panel</Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Welcome, {user.first_name || user.username}
            </Typography>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <Card raised sx={{ borderLeft: '4px solid #1976d2', height: '100%' }}>
                        <CardContent>
                            <PeopleIcon color="primary" sx={{ fontSize: 30, mb: 1 }} />
                            <Typography variant="h6" color="text.secondary">Total Students</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.totalStudents}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <Card raised sx={{ borderLeft: '4px solid #f97316', height: '100%' }}>
                        <CardContent>
                            <SupervisorAccountIcon sx={{ color: '#f97316', fontSize: 30, mb: 1 }} />
                            <Typography variant="h6" color="text.secondary">Total Faculty</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.totalFaculty}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <Card raised sx={{ borderLeft: '4px solid #10b981', height: '100%' }}>
                        <CardContent>
                            <AssessmentIcon sx={{ color: '#10b981', fontSize: 30, mb: 1 }} />
                            <Typography variant="h6" color="text.secondary">Avg. Attendance</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.averageAttendance}%</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <Card raised sx={{ borderLeft: '4px solid #9c27b0', height: '100%' }}>
                        <CardContent>
                            <AssignmentTurnedInIcon sx={{ color: '#9c27b0', fontSize: 30, mb: 1 }} />
                            <Typography variant="h6" color="text.secondary">Total Courses</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.courses}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Faculty Table */}
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>Manage Faculty Records</Typography>
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
                                    {facultyList.map(f => (
                                        <TableRow key={f.id} hover>
                                            <TableCell>{f.id}</TableCell>
                                            <TableCell>{f.first_name || f.username}</TableCell>
                                            <TableCell>{f.department || 'N/A'}</TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Edit Faculty">
                                                    <IconButton color="primary" onClick={() => handleEditFaculty(f.id)}><EditIcon fontSize="small" /></IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Faculty">
                                                    <IconButton color="error" onClick={() => handleDeleteFaculty(f.id)}><DeleteIcon fontSize="small" /></IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button variant="contained" size="small" sx={{ mt: 2 }} onClick={() => alert("MOCK: Add Faculty modal")}>Add New Faculty</Button>
                    </Paper>
                </Grid>

                {/* Course Table */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>Manage Course Records</Typography>
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
                                    {courseList.map(c => (
                                        <TableRow key={c.id} hover>
                                            <TableCell>{c.course_code}</TableCell>
                                            <TableCell>{c.title}</TableCell>
                                            <TableCell>{c.faculty_name || 'Unassigned'}</TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Edit Course">
                                                    <IconButton color="primary" onClick={() => handleEditCourse(c.id)}><EditIcon fontSize="small" /></IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Course">
                                                    <IconButton color="error" onClick={() => handleDeleteCourse(c.id)}><DeleteIcon fontSize="small" /></IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button variant="contained" size="small" sx={{ mt: 2 }} onClick={() => alert("MOCK: Add Course modal")}>Add New Course</Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
