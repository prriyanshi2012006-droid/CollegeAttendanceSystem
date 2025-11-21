// src/components/FacultyDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Alert, Snackbar, Grid,
    CircularProgress
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SendIcon from '@mui/icons-material/Send';
// --- NEW IMPORTS ---
import { getFacultyClassList, submitAttendance } from '../api/dataService'; 


const FacultyDashboard = ({ user }) => {
    const [attendanceList, setAttendanceList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const classDetails = {
        subject: user.department || 'Assigned Course', // Using department as subject mock
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format for API
        displayDate: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        // WARNING: In a real app, faculty must select the course ID they are marking for.
        // For simplicity, we hardcode a mock Course ID (e.g., 1) here.
        courseId: 1, 
    };

    // --- EFFECT: Fetch Class List on Mount ---
    useEffect(() => {
        const fetchClassList = async () => {
            setIsLoading(true);
            try {
                // Fetch the list of students for this faculty's courses
                const list = await getFacultyClassList();
                setAttendanceList(list);
                setError(null);
            } catch (err) {
                console.error("Faculty List Fetch Error:", err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && user.role === 'faculty') {
            fetchClassList();
        }
    }, [user]);

    // --- HANDLER: Toggle Attendance Status ---
    const toggleStatus = (studentId) => {
        setAttendanceList(prevList =>
            prevList.map(item =>
                item.studentId === studentId
                    ? { ...item, status: item.status === 'P' ? 'A' : 'P' } // P or A for Django model
                    : item
            )
        );
    };

    // --- HANDLER: Submit Attendance ---
    const handleMarkAttendance = async () => {
        setIsSubmitting(true);

        // Prepare data for the Django API (AttendanceRecordSerializer format)
        const recordsToSubmit = attendanceList.map(item => ({
            course_id: classDetails.courseId,
            student_id: item.studentProfileId, // This must be the StudentProfile ID or object
            date: classDetails.date,
            status: item.status,
        }));

        try {
            const result = await submitAttendance(recordsToSubmit);
            setSnackbarMessage(result.message);
            setSnackbarOpen(true);
            
            // Re-fetch or clear list if necessary after submission
            // For now, we leave the list for review

        } catch (err) {
            console.error("Submission Error:", err);
            const msg = Array.isArray(err) ? 
                `Submission finished with errors for some records. Check console for details.` : 
                `Submission failed: ${err}`;
            setError(msg);

        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // Calculate summary stats
    const totalStudents = attendanceList.length;
    const presentCount = attendanceList.filter(item => item.status === 'P').length;
    const absentCount = totalStudents - presentCount;
    const attendancePercentage = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0;

    // --- CONDITIONAL RENDERING ---
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading class list...</Typography>
            </Box>
        );
    }
    
    if (error) {
        return <Alert severity="error">Error: {error}</Alert>;
    }
    
    if (attendanceList.length === 0) {
        return <Alert severity="info">No students found in your assigned courses. Check database enrollment.</Alert>;
    }


    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                Attendance Marking Portal
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                {user.first_name || user.username} | Course ID: {classDetails.courseId} | Date: {classDetails.displayDate}
            </Typography>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Summary Card 2: Attendance Rate */}
                <Grid item xs={12} sm={6} lg={4}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, borderTop: '4px solid #f97316' }}>
                        <Typography variant="subtitle1" color="text.secondary">Current Rate</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'medium' }}>{attendancePercentage}% Present</Typography>
                    </Paper>
                </Grid>
                {/* Summary Card 3: Total Students */}
                <Grid item xs={12} sm={6} lg={4}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, borderTop: '4px solid #10b981' }}>
                        <Typography variant="subtitle1" color="text.secondary">Total Class Strength</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'medium' }}>{totalStudents}</Typography>
                    </Paper>
                </Grid>
                 {/* Summary Card 4: Absent Count */}
                <Grid item xs={12} sm={6} lg={4}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, borderTop: '4px solid #ef4444' }}>
                        <Typography variant="subtitle1" color="text.secondary">Currently Absent</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'medium' }}>{absentCount}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Attendance Marking Table */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" sx={{ fontWeight: 'medium' }} display="flex" alignItems="center">
                        <EventAvailableIcon color="primary" sx={{ mr: 1 }} /> Mark Daily Attendance
                    </Typography>
                </Box>
                
                <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader aria-label="attendance marking table">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Roll No</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Current Status</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attendanceList.map((item) => (
                                <TableRow key={item.studentId} hover>
                                    <TableCell>{item.roll_number}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={item.status === 'P' ? 'Present' : 'Absent'}
                                            color={item.status === 'P' ? 'success' : 'error'}
                                            variant="outlined"
                                            sx={{ minWidth: 80, fontWeight: 'medium' }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color={item.status === 'P' ? 'error' : 'success'}
                                            onClick={() => toggleStatus(item.studentId)}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Mark {item.status === 'P' ? 'Absent' : 'Present'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                        onClick={handleMarkAttendance}
                        disabled={isSubmitting}
                        size="large"
                        sx={{ py: 1.5, borderRadius: 2 }}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
                    </Button>
                </Box>
            </Paper>

            {/* Success Notification */}
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default FacultyDashboard;