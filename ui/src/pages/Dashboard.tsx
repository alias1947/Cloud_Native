import React, { useState, useEffect } from 'react';
import {
  Grid, Typography, Box, Card, CardContent,
  LinearProgress, Chip, IconButton, Tooltip
} from '@mui/material';
import {
  Memory, Storage, CloudQueue,
  CheckCircle, Error, Warning, Refresh, Speed
} from '@mui/icons-material';

const DashboardPage: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [metricsRes, servicesRes] = await Promise.all([
        fetch('http://localhost:8004/system/metrics'),
        fetch('http://localhost:8000/services')
      ]);

      const metrics = await metricsRes.json();
      const servicesData = await servicesRes.json();

      setSystemMetrics(metrics);
      setServices(servicesData.services || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      default: return <Error color="error" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      default: return 'error';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Platform Dashboard
        </Typography>
        <Tooltip title="Refresh Data">
          <IconButton onClick={fetchData} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* System Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {systemMetrics?.system_metrics?.map((metric: any, index: number) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card className="metric-card">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {metric.metric_type === 'cpu' && <Speed sx={{ mr: 1 }} />}
                  {metric.metric_type === 'memory' && <Memory sx={{ mr: 1 }} />}
                  {metric.metric_type === 'disk' && <Storage sx={{ mr: 1 }} />}
                  <Typography variant="h6" component="div">
                    {metric.metric_type.toUpperCase()}
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                  {metric.value.toFixed(1)}{metric.labels?.unit || '%'}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={metric.value}
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  color={metric.value > 80 ? 'error' : metric.value > 60 ? 'warning' : 'success'}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Services Status */}
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Service Status
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {services.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service.name}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CloudQueue sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {service.name}
                    </Typography>
                  </Box>
                  {getStatusIcon(service.status)}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Port: {service.port}
                </Typography>
                <Chip
                  label={service.status}
                  color={getStatusColor(service.status) as any}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="optimization-card" sx={{ cursor: 'pointer' }} onClick={() => window.location.href = '/optimization'}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Speed sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6">Run Optimization</Typography>
              <Typography variant="body2">Execute resource allocation algorithms</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="monitoring-card" sx={{ cursor: 'pointer' }} onClick={() => window.location.href = '/monitoring'}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Memory sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6">View Metrics</Typography>
              <Typography variant="body2">Detailed system monitoring</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="status-card" sx={{ cursor: 'pointer' }} onClick={() => window.location.href = '/services'}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CloudQueue sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6">Service Health</Typography>
              <Typography variant="body2">Check all microservices</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer', bgcolor: 'primary.main', color: 'white' }} onClick={() => window.location.href = '/auth'}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6">Authentication</Typography>
              <Typography variant="body2">Login to access features</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;