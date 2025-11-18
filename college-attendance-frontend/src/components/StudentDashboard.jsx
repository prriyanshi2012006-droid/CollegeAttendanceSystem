// src/components/StudentDashboard.jsx
import React, { useMemo } from 'react';
import {
    Box, Typography, Grid, Paper, Card, CardContent, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, LinearProgress,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PercentIcon from '@mui/icons-material/Percent';

// --- MOCK DATA for Student Dashboard ---
const MOCK_STUDENT_DATA = {
    id: 1001,
    name: 'Alice Johnson',
    course: 'Computer Science',
    rollNumber: 'CS/2023/001',
    overall: {
        totalClasses: 120,
        attendedClasses: 105,
    },
    detailedAttendance: [
        { subject: 'Programming with Python', faculty: 'Prof. Vane', total: 40, attended: 38 },
        { subject: 'Advanced Calculus', faculty: 'Dr. Doe', total: 30, attended: 25 },
        { subject: 'Database Systems', faculty: 'Dr. Smith', total: 50, attended: 42 },
    ]
};

// Helper function to calculate attendance percentage
const calculatePercentage = (attended, total) => {
    if (total === 0) return 0;
    return (attended / total) * 100;
};


const StudentDashboard = ({ user }) => {
    // In a real app (Phase 3), we would fetch this data based on user.id
    // For now, we use the mock data structure above.
    const studentData = MOCK_STUDENT_DATA; 
    
    const overallPercentage = useMemo(() => {
        return calculatePercentage(studentData.overall.attendedClasses, studentData.overall.totalClasses);
    }, [studentData]);

    // Determines color based on compliance (e.g., 75% required attendance)
    const getProgressColor = (percentage) => {
        if (percentage >= 85) return 'success';
        if (percentage >= 75) return 'primary';
        return 'error';
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                {studentData.name}'s Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                Roll No: {studentData.rollNumber} | Course: {studentData.course}
            </Typography>

            {/* 1. Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Card 1: Total Classes */}
                <Grid item xs={12} sm={4}>
                    <Card raised sx={{ borderLeft: '4px solid #4f46e5', height: '100%' }}>
                        <CardContent>
                            <AssignmentIcon color="primary" sx={{ fontSize: 30, mb: 1 }} />
                            <Typography variant="h6" color="text.secondary">Total Classes</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                                {studentData.overall.totalClasses}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Card 2: Attended Classes */}
                <Grid item xs={12} sm={4}>
                    <Card raised sx={{ borderLeft: '4px solid #10b981', height: '100%' }}>
                        <CardContent>
                            <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 30, mb: 1 }} />
                            <Typography variant="h6" color="text.secondary">Classes Attended</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                                {studentData.overall.attendedClasses}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Card 3: Overall Percentage */}
                <Grid item xs={12} sm={4}>
                    <Card raised sx={{ borderLeft: '4px solid #f97316', height: '100%' }}>
                        <CardContent>
                            <PercentIcon sx={{ color: '#f97316', fontSize: 30, mb: 1 }} />
                            <Typography variant="h6" color="text.secondary">Overall Attendance</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                                {overallPercentage.toFixed(2)}%
                            </Typography>
                            <Box sx={{ width: '100%', mt: 2 }}>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={overallPercentage} 
                                    color={getProgressColor(overallPercentage)} 
                                    sx={{ height: 10, borderRadius: 5 }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Required minimum: 75%
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 2. Detailed Attendance Table */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
                    Subject-wise Report
                </Typography>
                <TableContainer>
                    <Table stickyHeader aria-label="detailed attendance table">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Subject Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Faculty</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Classes</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Attended</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Percentage</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {studentData.detailedAttendance.map((row, index) => {
                                const subjectPercent = calculatePercentage(row.attended, row.total);
                                const statusColor = subjectPercent >= 75 ? 'success' : 'error';
                                return (
                                    <TableRow key={index} hover>
                                        <TableCell>{row.subject}</TableCell>
                                        <TableCell>{row.faculty}</TableCell>
                                        <TableCell align="right">{row.total}</TableCell>
                                        <TableCell align="right">{row.attended}</TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body1" sx={{ fontWeight: 'medium', color: (theme) => theme.palette[statusColor].main }}>
                                                {subjectPercent.toFixed(2)}%
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box 
                                                component="span" 
                                                sx={{ 
                                                    px: 1.5, py: 0.5, borderRadius: 1, 
                                                    backgroundColor: (theme) => theme.palette[statusColor].light, 
                                                    color: (theme) => theme.palette[statusColor].dark, 
                                                    fontWeight: 'medium'
                                                }}
                                            >
                                                {subjectPercent >= 75 ? 'In Good Standing' : 'Below Threshold'}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default StudentDashboard;