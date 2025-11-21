// src/components/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, TextField, Button, Typography, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem, Box, Alert, CircularProgress
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import { login } from '../api/authService';

const LoginPage = ({ setAuthState }) => {
  const [username, setUsername] = useState('student');
  const [password, setPassword] = useState('pass');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Please enter username and password.');
      setIsLoading(false);
      return;
    }

    try {
      const { access, refresh, user } = await login(username, password);

      setAuthState({ user, isAuthenticated: true });

      // Navigate based on role (example)
      if (user.role === 'student') {
        navigate('/student/dashboard');
      } else if (user.role === 'faculty') {
        navigate('/faculty/dashboard'); // adjust route if you have one
      } else {
        navigate('/admin/dashboard'); // adjust route if you have one
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password');
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

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                value={role}
                label="Role"
                onChange={(e) => {
                  const newRole = e.target.value;
                  setRole(newRole);
                  setUsername(newRole);
                  setError('');
                }}
                required
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="faculty">Faculty</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

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
