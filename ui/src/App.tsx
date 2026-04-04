import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Container, Button, Chip } from '@mui/material';
import { CloudQueue } from '@mui/icons-material';
import DashboardPage from './pages/Dashboard';
import AuthPage from './pages/Auth';
import OptimizationPage from './pages/Optimization';
import MonitoringPage from './pages/Monitoring';
import ServicesPage from './pages/Services';
import { AuthContext } from './context/AuthContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // You could validate token here
    }

    // Fetch services status
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:8000/services');
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const login = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const Navigation = () => (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <CloudQueue sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Cloud-Native Platform
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {services.map((service) => (
            <Chip
              key={service.name}
              label={`${service.name}`}
              size="small"
              color={service.status === 'healthy' ? 'success' : 'error'}
              variant="outlined"
            />
          ))}
          {isAuthenticated ? (
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" href="/auth">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      <Router>
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
          <Navigation />
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/optimization"
                element={isAuthenticated ? <OptimizationPage /> : <Navigate to="/auth" />}
              />
              <Route path="/monitoring" element={<MonitoringPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;