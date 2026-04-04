import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, LinearProgress,
  Chip, Alert, Button, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  Memory, Storage, Warning, Error, CheckCircle,
  ExpandMore, Refresh, Speed
} from '@mui/icons-material';

const MonitoringPage: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertRules, setAlertRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [metricsRes, alertsRes, rulesRes] = await Promise.all([
        fetch('http://localhost:8004/system/metrics'),
        fetch('http://localhost:8004/alerts'),
        fetch('http://localhost:8004/alerts/rules')
      ]);

      const metrics = await metricsRes.json();
      const alertsData = await alertsRes.json();
      const rulesData = await rulesRes.json();

      setSystemMetrics(metrics);
      setAlerts(alertsData.alerts || []);
      setAlertRules(rulesData.rules || []);
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'cpu': return <Speed />;
      case 'memory': return <Memory />;
      case 'disk': return <Storage />;
      default: return <Speed />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Loading monitoring data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          System Monitoring
        </Typography>
        <Button variant="outlined" onClick={fetchData} startIcon={<Refresh />}>
          Refresh
        </Button>
      </Box>

      {/* System Metrics */}
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        System Metrics
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {systemMetrics?.system_metrics?.map((metric: any, index: number) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: 'primary.main', mr: 1 }}>
                    {getMetricIcon(metric.metric_type)}
                  </Box>
                  <Typography variant="h6" component="div">
                    {metric.metric_type.toUpperCase()}
                  </Typography>
                </Box>

                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {metric.value.toFixed(1)}{metric.labels?.unit || '%'}
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={metric.value}
                  sx={{ height: 8, borderRadius: 4 }}
                  color={
                    metric.value > 85 ? 'error' :
                    metric.value > 70 ? 'warning' : 'success'
                  }
                />

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Max: {metric.metric_type === 'cpu' ? '100%' :
                        metric.metric_type === 'memory' ? '100%' : '100%'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Active Alerts */}
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Active Alerts
      </Typography>

      {alerts.length === 0 ? (
        <Alert severity="success" sx={{ mb: 4 }}>
          <CheckCircle sx={{ mr: 1 }} />
          No active alerts - all systems normal
        </Alert>
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {alerts.slice(0, 6).map((alert, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ borderLeft: 4, borderColor: `${getSeverityColor(alert.severity)}.main` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {alert.severity === 'critical' && <Error color="error" sx={{ mr: 1 }} />}
                    {alert.severity === 'warning' && <Warning color="warning" sx={{ mr: 1 }} />}
                    <Typography variant="subtitle1" fontWeight="bold">
                      {alert.rule_name}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    {alert.service} - {alert.metric}
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Value: {alert.value.toFixed(1)} (Threshold: {alert.threshold})
                  </Typography>

                  <Chip
                    label={alert.severity.toUpperCase()}
                    color={getSeverityColor(alert.severity) as any}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Alert Rules Configuration */}
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Alert Rules Configuration
      </Typography>

      {alertRules.map((rule, index) => (
        <Accordion key={index} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Typography sx={{ flexGrow: 1 }}>
                {rule.name}: {rule.metric} {rule.operator} {rule.threshold}
              </Typography>
              <Chip
                label={rule.severity}
                color={getSeverityColor(rule.severity) as any}
                size="small"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              Monitors {rule.metric} usage and triggers {rule.severity} alerts when value is {rule.operator} {rule.threshold}.
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Historical Data Placeholder */}
      <Typography variant="h5" component="h2" sx={{ mb: 2, mt: 4 }}>
        Performance Trends
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Historical metrics visualization would be displayed here with real-time charts.
            <br />
            Currently showing live system metrics above.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MonitoringPage;