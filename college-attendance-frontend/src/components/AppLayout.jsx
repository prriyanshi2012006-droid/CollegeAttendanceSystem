import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Box, AppBar, Toolbar, Typography, Button, IconButton, Drawer,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    useMediaQuery, useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const drawerWidth = 240;

const navigationMap = {
    student: [
        { text: 'Student Dashboard', icon: <SchoolIcon />, path: '/student/dashboard' },
    ],
    faculty: [
        { text: 'Faculty Dashboard', icon: <PersonIcon />, path: '/faculty/dashboard' },
        { text: 'Mark Attendance', icon: <EventAvailableIcon />, path: '/faculty/dashboard' },
    ],
    admin: [
        { text: 'Admin Dashboard', icon: <AdminPanelSettingsIcon />, path: '/admin/dashboard' },
    ],
};

const AppLayout = ({ user, onLogout, children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); 
    const location = useLocation();

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const navItems = navigationMap[user?.role] || [];

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
                            onClick={isMobile ? handleDrawerToggle : undefined}
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
                        {user.name || user.username} | {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Portal
                    </Typography>
                </Toolbar>
            </AppBar>

            <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' } }}
                >
                    {drawer}
                </Drawer>

                <Drawer
                    variant="permanent"
                    sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' } }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
                {children}
            </Box>
        </Box>
    );
};

export default AppLayout;
