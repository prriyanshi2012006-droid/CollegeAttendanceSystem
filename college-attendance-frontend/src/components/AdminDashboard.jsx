// src/components/AdminDashboard.jsx
import React, { useState } from 'react';
import {
    Box, Typography, Grid, Paper, Card, CardContent, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
    Tooltip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'; // <-- CORRECTION: Added missing import

// --- MOCK DATA for Admin Dashboard ---
const MOCK_REPORTS = {
    totalStudents: 1200,
    totalFaculty: 150,
    averageAttendance: 82.5, // overall average percentage
    courses: 15,
};

const MOCK_FACULTY_LIST = [
    { id: 201, name: 'Dr. Jane Doe', dept: 'Mathematics', classes: 3, status: 'Active' },
    { id: 202, name: 'Prof. Mark Vane', dept: 'Computer Science', classes: 5, status: 'Active' },
    { id: 203, name: 'Dr. Emily Carter', dept: 'Electrical Eng.', classes: 4, status: 'Active' },
    { id: 204, name: 'Mr. David Lee', dept: 'Mechanical Eng.', classes: 2, status: 'On Leave' },
];


const AdminDashboard = ({ user }) => {
    const [facultyList, setFacultyList] = useState(MOCK_FACULTY_LIST);

    // Mock Handler for Faculty Management
    const handleEditFaculty = (id) => {
        console.log(`Mock Action: Opening edit modal for Faculty ID: ${id}`);
        alert(`MOCK: Editing Faculty ID ${id}. In Phase 3, a form would open here.`);
    };

    const handleDeleteFaculty = (id) => {
        // In Phase 3, this would be an API call to Django
        if (window.confirm(`Are you sure you want to delete faculty ID ${id}? (MOCK)`)) {
            setFacultyList(prevList => prevList.filter(f => f.id !== id));
            console.log(`Mock Action: Faculty ID ${id} deleted.`);
        }
    };
    
    // Mock Overall Departmental Attendance Report
    const departmentalReport = [
        { dept: 'Computer Science', avg: 88.2, compliance: 'High' },
        { dept: 'Electrical Eng.', avg: 79.5, compliance: 'Moderate' },
        { dept: 'Mechanical Eng.', avg: 65.1, compliance: 'Low' },
        { dept: 'Mathematics', avg: 92.0, compliance: 'High' },
    ];


    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                Admin Control Panel
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Welcome, **{user.name}**
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

                {/* Card 2: Total Faculty */}
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
                   {/* Card 4: Total Courses */}
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

            {/* 2. Departmental Report Table */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
                    Overall Departmental Attendance
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
                            {departmentalReport.map((row, index) => (
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

            {/* 3. Manage Faculty Table */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
                    Manage Faculty Records
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Classes Assigned</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {facultyList.map((faculty) => (
                                <TableRow key={faculty.id} hover>
                                    <TableCell>{faculty.id}</TableCell>
                                    <TableCell>{faculty.name}</TableCell>
                                    <TableCell>{faculty.dept}</TableCell>
                                    <TableCell align="right">{faculty.classes}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={faculty.status}
                                            color={faculty.status === 'Active' ? 'success' : 'warning'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Edit Faculty">
                                            <IconButton color="primary" onClick={() => handleEditFaculty(faculty.id)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Faculty">
                                            <IconButton color="error" onClick={() => handleDeleteFaculty(faculty.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
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