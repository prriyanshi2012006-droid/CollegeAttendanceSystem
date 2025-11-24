import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Chip, Grid,
    CircularProgress, Alert, Snackbar
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SendIcon from '@mui/icons-material/Send';
import { getFacultyClassList, submitAttendance } from '../api/dataService'; 

const FacultyDashboard = ({ user }) => {
    const [attendanceList, setAttendanceList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const classDetails = {
        subject: user.department || 'Course',
        date: new Date().toISOString().split('T')[0],
        displayDate: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        courseId: 1,
    };

    useEffect(() => {
        const fetchClassList = async () => {
            setIsLoading(true);
            try {
                const list = await getFacultyClassList();
                setAttendanceList(list);
                setError(null);
            } catch (err) {
                setError(err.message || err);
            } finally {
                setIsLoading(false);
            }
        };
        if (user.role === 'faculty') fetchClassList();
    }, [user]);

    const toggleStatus = (studentId) => {
        setAttendanceList(prev => prev.map(item => item.studentId === studentId ? { ...item, status: item.status === 'P' ? 'A' : 'P' } : item));
    };

    const handleMarkAttendance = async () => {
        setIsSubmitting(true);
        try {
            const recordsToSubmit = attendanceList.map(item => ({
                course_id: classDetails.courseId,
                student_id: item.studentProfileId,
                date: classDetails.date,
                status: item.status,
            }));
            const result = await submitAttendance(recordsToSubmit);
            setSnackbarMessage(result.message);
            setSnackbarOpen(true);
        } catch (err) {
            setError(err.message || err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSnackbarClose = () => setSnackbarOpen(false);

    const totalStudents = attendanceList.length;
    const presentCount = attendanceList.filter(i => i.status === 'P').length;
    const absentCount = totalStudents - presentCount;
    const attendancePercentage = totalStudents ? ((presentCount / totalStudents) * 100).toFixed(1) : 0;

    if (isLoading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading class list...</Typography>
        </Box>
    );

    if (error) return <Alert severity="error">{error}</Alert>;
    if (attendanceList.length === 0) return <Alert severity="info">No students found.</Alert>;

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>Attendance Marking Portal</Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                {user.first_name || user.username} | Course ID: {classDetails.courseId} | Date: {classDetails.displayDate}
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={4}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, borderTop: '4px solid #f97316' }}>
                        <Typography variant="subtitle1" color="text.secondary">Current Rate</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'medium' }}>{attendancePercentage}% Present</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, borderTop: '4px solid #10b981' }}>
                        <Typography variant="subtitle1" color="text.secondary">Total Students</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'medium' }}>{totalStudents}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, borderTop: '4px solid #ef4444' }}>
                        <Typography variant="subtitle1" color="text.secondary">Currently Absent</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'medium' }}>{absentCount}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" sx={{ mb: 2 }} display="flex" alignItems="center">
                    <EventAvailableIcon color="primary" sx={{ mr: 1 }} /> Mark Daily Attendance
                </Typography>
                <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                                <TableCell>Roll No</TableCell>
                                <TableCell>Student Name</TableCell>
                                <TableCell align="center">Current Status</TableCell>
                                <TableCell align="center">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attendanceList.map(item => (
                                <TableRow key={item.studentId} hover>
                                    <TableCell>{item.roll_number}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell align="center">
                                        <Chip label={item.status === 'P' ? 'Present' : 'Absent'} color={item.status === 'P' ? 'success' : 'error'} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button variant="contained" size="small" color={item.status === 'P' ? 'error' : 'success'} onClick={() => toggleStatus(item.studentId)}>
                                            Mark {item.status === 'P' ? 'Absent' : 'Present'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button variant="contained" endIcon={<SendIcon />} sx={{ mt: 2 }} onClick={handleMarkAttendance} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
                </Button>
            </Paper>

            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} message={snackbarMessage} />
        </Box>
    );
};

export default FacultyDashboard;
