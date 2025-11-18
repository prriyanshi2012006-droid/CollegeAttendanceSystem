// src/components/LoginPage.jsx
import React, { useState } from 'react';
import {
    Container, TextField, Button, Typography, Card, CardContent,
    FormControl, InputLabel, Select, MenuItem, Box, Alert
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';

// Mock User roles definition
const MOCK_USER_ROLES = {
    student: { id: 1001, name: 'Alice Johnson', role: 'student' },
    faculty: { id: 201, name: 'Dr. Jane Doe', role: 'faculty' },
    admin: { id: 301, name: 'Admin Master', role: 'admin' },
};

// NOTE: This function only performs MOCK authentication.
const LoginPage = ({ setAuthState }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        // Mock Credentials Check: Use role as username, 'pass' as password for simplicity
        if (username.toLowerCase() === role && password === 'pass') {
            const user = MOCK_USER_ROLES[role];
            
            // Set the global state to authenticated
            setAuthState({ user: user, isAuthenticated: true });
        } else {
            setError(`Invalid credentials. Try: (Username: ${role}, Password: pass)`);
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
                                onChange={(e) => { setRole(e.target.value); setError(''); setUsername(e.target.value); }}
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
                            sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
                        >
                            Sign In
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default LoginPage;