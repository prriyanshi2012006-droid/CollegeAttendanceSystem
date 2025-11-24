import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, LinearProgress,
    CircularProgress, Alert
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PercentIcon from '@mui/icons-material/Percent';
import { getStudentDashboard, calculatePercentage } from '../api/dataService'; 

const StudentDashboard = ({ user }) => {
    const [studentData, setStudentData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const data = await getStudentDashboard(user.id);
                setStudentData(data);
                setError(null);
            } catch (err) {
                setError(err.message || err);
            } finally {
                setIsLoading(false);
            }
        };
        if (user && user.role === 'student') fetchDashboardData();
        else setError("User is not a student.");
    }, [user]);

    const overallPercentage = useMemo(() => {
        if (!studentData?.overall) return 0;
        return calculatePercentage(studentData.overall.attendedClasses, studentData.overall.totalClasses);
    }, [studentData]);

    const getProgressColor = (percentage) => percentage >= 85 ? 'success' : percentage >= 75 ? 'primary' : 'error';

    if (isLoading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading student records...</Typography>
        </Box>
    );

    if (error) return <Alert severity="error">{error}</Alert>;
    if (!studentData) return <Alert severity="warning">No student data found.</Alert>;

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                {user.first_name || studentData.user.username}'s Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                Roll No: {studentData.roll_number} | Course: {studentData.course_of_study}
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
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
                                    Minimum required: 75%
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <TableContainer component={Box}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
                    Detailed Attendance Report
                </Typography>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                            <TableCell>Subject</TableCell>
                            <TableCell>Faculty</TableCell>
                            <TableCell align="right">Total Classes</TableCell>
                            <TableCell align="right">Attended</TableCell>
                            <TableCell align="right">Percentage</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {studentData.detailedAttendance.map((row, idx) => {
                            const subjectPercent = calculatePercentage(row.attended_classes, row.total_classes_held);
                            return (
                                <TableRow key={idx} hover>
                                    <TableCell>{row.subject}</TableCell>
                                    <TableCell>{row.faculty}</TableCell>
                                    <TableCell align="right">{row.total_classes_held}</TableCell>
                                    <TableCell align="right">{row.attended_classes}</TableCell>
                                    <TableCell align="right">{subjectPercent.toFixed(2)}%</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default StudentDashboard;
