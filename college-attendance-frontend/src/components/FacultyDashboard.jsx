// src/components/FacultyDashboard.jsx
import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Alert, Snackbar, Grid
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SendIcon from '@mui/icons-material/Send';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

// --- MOCK DATA for Faculty Attendance Sheet ---
const MOCK_STUDENTS_FOR_CLASS = [
    { studentId: 1001, name: 'Alice Johnson', status: 'Present' },
    { studentId: 1002, name: 'Bob Smith', status: 'Present' },
    { studentId: 1003, name: 'Charlie Brown', status: 'Absent' },
    { studentId: 1004, name: 'Diana Prince', status: 'Present' },
    { studentId: 1005, name: 'Ethan Hunt', status: 'Absent' },
    { studentId: 1006, name: 'Fiona Glenn', status: 'Present' },
];

const FacultyDashboard = ({ user }) => {
    const [attendanceList, setAttendanceList] = useState(MOCK_STUDENTS_FOR_CLASS);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const classDetails = {
        subject: user.subject || 'Programming with Python',
        date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    };

    const toggleStatus = (studentId) => {
        setAttendanceList(prevList =>
            prevList.map(item =>
                item.studentId === studentId
                    ? { ...item, status: item.status === 'Present' ? 'Absent' : 'Present' }
                    : item
            )
        );
    };

    const handleMarkAttendance = () => {
        // --- MOCK API CALL (Phase 3 will replace this with a real fetch) ---
        const presentCount = attendanceList.filter(item => item.status === 'Present').length;
        const totalCount = attendanceList.length;

        console.log('Mock API Call: Submitting attendance data...');
        setSnackbarMessage(`Attendance submitted for ${classDetails.subject}. ${presentCount}/${totalCount} students marked Present.`);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // Calculate summary stats
    const totalStudents = attendanceList.length;
    const presentCount = attendanceList.filter(item => item.status === 'Present').length;
    const absentCount = totalStudents - presentCount;
    const attendancePercentage = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0;

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                Faculty Portal
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                {user.name} | Subject: {classDetails.subject}
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Summary Card 1: Class Date */}
                <Grid item xs={12} sm={4}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, borderTop: '4px solid #1976d2' }}>
                        <Typography variant="subtitle1" color="text.secondary">Today's Date</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'medium' }}>{classDetails.date}</Typography>
                    </Paper>
                </Grid>
                 {/* Summary Card 2: Attendance Rate */}
                <Grid item xs={12} sm={4}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, borderTop: '4px solid #f97316' }}>
                        <Typography variant="subtitle1" color="text.secondary">Current Rate</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'medium' }}>{attendancePercentage}% Present</Typography>
                    </Paper>
                </Grid>
                {/* Summary Card 3: Total Students */}
                <Grid item xs={12} sm={4}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, borderTop: '4px solid #10b981' }}>
                        <Typography variant="subtitle1" color="text.secondary">Total Class Strength</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'medium' }}>{totalStudents}</Typography>
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
                                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Current Status</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attendanceList.map((item) => (
                                <TableRow key={item.studentId} hover>
                                    <TableCell>{item.studentId}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={item.status}
                                            color={item.status === 'Present' ? 'success' : 'error'}
                                            variant="outlined"
                                            sx={{ minWidth: 80, fontWeight: 'medium' }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color={item.status === 'Present' ? 'error' : 'success'}
                                            onClick={() => toggleStatus(item.studentId)}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Mark {item.status === 'Present' ? 'Absent' : 'Present'}
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
                        endIcon={<SendIcon />}
                        onClick={handleMarkAttendance}
                        size="large"
                        sx={{ py: 1.5, borderRadius: 2 }}
                    >
                        Submit Attendance
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