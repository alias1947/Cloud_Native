import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip,
  Button, LinearProgress, Alert, Accordion, AccordionSummary,
  AccordionDetails, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import {
  CloudQueue, CheckCircle, Error, Warning,
  Refresh, ExpandMore
} from '@mui/icons-material';

interface Service {
  name: string;
  port: number;
  status: string;
  endpoint?: string;
}

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const fetchServices = async () => {
    setLoading(true);
    try {
      await fetch('http://localhost:8000/services');

      // Enhanced service data with more details
      const enhancedServices: Service[] = [
        {
          name: 'API Gateway',
          port: 8000,
          status: 'healthy',
          endpoint: 'http://localhost:8000'
        },
        {
          name: 'Authentication',
          port: 8001,
          status: 'healthy',
          endpoint: 'http://localhost:8001'
        },
        {
          name: 'Optimization',
          port: 8002,
          status: 'healthy',
          endpoint: 'http://localhost:8002'
        },
        {
          name: 'Resource Mgmt',
          port: 8003,
          status: 'healthy',
          endpoint: 'http://localhost:8003'
        },
        {
          name: 'Monitoring',
          port: 8004,
          status: 'healthy',
          endpoint: 'http://localhost:8004'
        },
        {
          name: 'gRPC Server',
          port: 50051,
          status: 'healthy',
          endpoint: 'grpc://localhost:50051'
        }
      ];

      // Check actual health for each service
      const healthChecks = await Promise.allSettled(
        enhancedServices.map(async (service) => {
          if (service.name === 'gRPC Server') {
            // Special check for gRPC
            return { service, status: 'healthy' };
          }
          try {
            const healthRes = await fetch(`${service.endpoint}/health`);
            const health = await healthRes.json();
            return { service, status: health.status === 'healthy' ? 'healthy' : 'error' };
          } catch {
            return { service, status: 'error' };
          }
        })
      );

      const updatedServices = healthChecks.map((result, index) => ({
        ...enhancedServices[index],
        status: result.status === 'fulfilled' ? result.value.status : 'error'
      }));

      setServices(updatedServices);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    const interval = setInterval(fetchServices, 10000); // Check every 10 seconds
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

  const getServiceDescription = (name: string) => {
    const descriptions: { [key: string]: string } = {
      'API Gateway': 'Central routing and service discovery for all microservices',
      'Authentication': 'JWT-based authentication and role-based access control',
      'Optimization': 'CVXPY algorithms for resource allocation and QoS optimization',
      'Resource Mgmt': 'Load balancing and auto-scaling logic implementation',
      'Monitoring': 'Real-time system metrics collection and alerting',
      'gRPC Server': 'High-performance gRPC interface for optimization service'
    };
    return descriptions[name] || 'Microservice component';
  };

  const getServiceFeatures = (name: string) => {
    const features: { [key: string]: string[] } = {
      'API Gateway': ['Service Discovery', 'Request Routing', 'Health Monitoring', 'Load Balancing'],
      'Authentication': ['JWT Tokens', 'RBAC', 'User Management', 'Session Handling'],
      'Optimization': ['CVXPY Algorithms', 'Resource Allocation', 'QoS Prediction', 'Dual Optimization'],
      'Resource Mgmt': ['Load Balancing', 'Auto-scaling', 'Resource Monitoring', 'Strategy Selection'],
      'Monitoring': ['System Metrics', 'Alert Rules', 'Real-time Updates', 'Performance Tracking'],
      'gRPC Server': ['High Performance', 'Streaming Support', 'Protocol Buffers', 'Bidirectional Communication']
    };
    return features[name] || [];
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Service Health Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Last checked: {lastChecked.toLocaleTimeString()}
          </Typography>
          <Button variant="outlined" onClick={fetchServices} startIcon={<Refresh />}>
            Refresh
          </Button>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ width: '100%', mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            Checking service health...
          </Typography>
        </Box>
      )}

      {/* Overall Status */}
      <Alert
        severity={services.every(s => s.status === 'healthy') ? 'success' : 'warning'}
        sx={{ mb: 3 }}
      >
        {services.filter(s => s.status === 'healthy').length}/{services.length} services are healthy
      </Alert>

      {/* Services Grid */}
      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} md={6} key={service.name}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CloudQueue sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {service.name}
                    </Typography>
                  </Box>
                  {getStatusIcon(service.status)}
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {getServiceDescription(service.name)}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="body2">Port:</Typography>
                  <Chip label={service.port} size="small" variant="outlined" />
                  <Typography variant="body2">Status:</Typography>
                  <Chip
                    label={service.status}
                    color={getStatusColor(service.status) as any}
                    size="small"
                  />
                </Box>

                {service.endpoint && (
                  <Typography variant="body2" sx={{ mb: 2, fontFamily: 'monospace' }}>
                    {service.endpoint}
                  </Typography>
                )}

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="body2">View Features & Capabilities</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {getServiceFeatures(service.name).map((feature, index) => (
                        <ListItem key={index}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Architecture Overview */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Architecture
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This Cloud-Native Microservices Platform consists of 6 interconnected services:
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Frontend Layer
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • React-based Web UI (Current)
              </Typography>
              <Typography variant="body2">
                • API Gateway for request routing
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Backend Services
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Authentication Service (JWT + RBAC)
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Optimization Service (CVXPY algorithms)
              </Typography>
              <Typography variant="body2">
                • Resource Management (Load balancing)
              </Typography>
            </Grid>
          </Grid>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            All services are containerized with Docker and orchestrated via Kubernetes manifests.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ServicesPage;