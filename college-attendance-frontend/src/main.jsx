// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import App from './App.jsx';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4f46e5', // A nice indigo color for the primary theme
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <ThemeProvider theme={theme}>
        {/* CssBaseline is MUI's standard CSS reset */}
        <CssBaseline /> 
        <App />
      </ThemeProvider>
    </Router>
  </React.StrictMode>,
);