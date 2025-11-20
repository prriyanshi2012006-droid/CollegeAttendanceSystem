// src/components/LoginPage.jsx
import React, { useState } from 'react';
import {
    Container, TextField, Button, Typography, Card, CardContent,
    FormControl, InputLabel, Select, MenuItem, Box, Alert, CircularProgress
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
// --- NEW IMPORT ---
import { login, setAuthToken } from '../api/authService'; 


const LoginPage = ({ setAuthState }) => {
    const [username, setUsername] = useState('student'); // Default for quick testing
    const [password, setPassword] = useState('pass'); // Default for quick testing
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // New loading state

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (username.trim() === '' || password.trim() === '') {
            setError('Please enter both username and password.');
            setIsLoading(false);
            return;
        }

        try {
            // --- REAL API CALL ---
            const user = await login(username, password);
            
            // Check if the role matches the selected role (optional security/UI check)
            if (user.role !== role) {
                // If roles don't match, log out immediately and show error
                setAuthToken(null);
                throw `Login successful, but role mismatch. Logged in as ${user.role}.`;
            }

            // If successful, set the global state
            setAuthState({ user: user, isAuthenticated: true });
            
        } catch (err) {
            // Handle error response from Django/Axios
            const errorMsg = typeof err === 'string' ? err : 
                             (err.detail || 'Could not connect to the API. Check if Django server is running.');
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
            <Card raised sx={{ width: '100%', borderRadius: 3, boxShadow: 6 }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
                    <LockOpenIcon color="primary" sx={{ fontSize: 50, mb: 2 }} />
                    <Typography component="h1" variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
                        College Attendance System
                    </Typography>
                    <Typography component="p" variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                        Sign in to access your dashboard
                    </Typography>
                    
                    <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1, width: '100%' }}>
                        
                        {/* Role Selector */}
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="role-select-label">Role</InputLabel>
                            <Select
                                labelId="role-select-label"
                                value={role}
                                label="Role"
                                onChange={(e) => { 
                                    const newRole = e.target.value;
                                    setRole(newRole); 
                                    setError(''); 
                                    setUsername(newRole); // Set username hint
                                }}
                                required
                            >
                                <MenuItem value={'student'}>Student</MenuItem>
                                <MenuItem value={'faculty'}>Faculty</MenuItem>
                                <MenuItem value={'admin'}>Admin</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Username Field */}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                            placeholder={`Try: ${role}`}
                        />

                        {/* Password Field */}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Try: pass"
                        />
                        
                        {/* Error Message */}
                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                        )}

                        {/* Login Button */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isLoading}
                            sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default LoginPage;