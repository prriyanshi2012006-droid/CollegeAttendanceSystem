// src/components/AppLayout.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Box, AppBar, Toolbar, Typography, Button, IconButton, Drawer,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    useMediaQuery, useTheme
} from '@mui/material';

// Icons for navigation
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const drawerWidth = 240;

// Defines the navigation links for each role
const navigationMap = {
    student: [
        { text: 'Student Dashboard', icon: <SchoolIcon />, path: '/student/dashboard' },
    ],
    faculty: [
        { text: 'Faculty Dashboard', icon: <PersonIcon />, path: '/faculty/dashboard' },
        { text: 'Mark Attendance', icon: <EventAvailableIcon />, path: '/faculty/dashboard' }, // Uses same dashboard for simplicity
        // In a real app, this would be a separate path: '/faculty/mark-attendance'
    ],
    admin: [
        { text: 'Admin Dashboard', icon: <AdminPanelSettingsIcon />, path: '/admin/dashboard' },
        { text: 'Manage Faculty', icon: <PersonIcon />, path: '/admin/dashboard' }, // Uses same dashboard for simplicity
        // In a real app, this would be a separate path: '/admin/manage-faculty'
    ],
};


const AppLayout = ({ user, onLogout, children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    // Check if the screen size is small (mobile)
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); 
    const location = useLocation();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Get links relevant to the current user's role
    const navItems = navigationMap[user?.role] || [];
    
    // The main sidebar content
    const drawer = (
        <Box sx={{ p: 1, height: '100%', backgroundColor: theme.palette.background.default }}>
            <Toolbar disableGutters sx={{ justifyContent: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                    CMS - {user?.role.toUpperCase()}
                </Typography>
            </Toolbar>
            
            <List>
                {navItems.map((item) => (
                    <ListItem 
                        key={item.text} 
                        disablePadding
                        // Highlight the active link based on the current path
                        sx={{ 
                            '&:hover': { backgroundColor: theme.palette.action.hover },
                            backgroundColor: location.pathname === item.path ? theme.palette.action.selected : 'transparent',
                            borderRadius: 2, 
                            mb: 0.5 
                        }}
                    >
                        <ListItemButton 
                            component={Link} 
                            to={item.path} 
                            onClick={isMobile ? handleDrawerToggle : undefined} // Close drawer on mobile click
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: location.pathname === item.path ? theme.palette.primary.main : 'inherit' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Box sx={{ position: 'absolute', bottom: 16, width: `calc(${drawerWidth}px - 16px)` }}>
                <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth 
                    startIcon={<LogoutIcon />} 
                    onClick={onLogout}
                    sx={{ borderRadius: 2 }}
                >
                    Logout
                </Button>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
            {/* --- AppBar (Header) --- */}
            <AppBar 
                position="fixed"
                sx={{ 
                    width: { md: `calc(100% - ${drawerWidth}px)` }, 
                    ml: { md: `${drawerWidth}px` },
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    boxShadow: 2,
                }}
            >
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'medium' }}>
                        {user.name} | {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Portal
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* --- Side Navigation (Drawer) --- */}
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                {/* Mobile Drawer (Temporary) */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }} // Better performance on mobile
                    sx={{
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
                    }}
                >
                    {drawer}
                </Drawer>

                {/* Desktop Drawer (Permanent) */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* --- Main Content Area --- */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8, // To offset the fixed AppBar height
                }}
            >
                {children} {/* This is where the dashboards (Student/Faculty/Admin) will be rendered */}
            </Box>
        </Box>
    );
};

export default AppLayout;