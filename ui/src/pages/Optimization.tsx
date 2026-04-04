import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Grid,
  Card, CardContent, Alert, CircularProgress, Accordion,
  AccordionSummary, AccordionDetails, Chip
} from '@mui/material';
import { ExpandMore, PlayArrow, Analytics } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface Resource {
  id: string;
  name: string;
  available_power: number;
  max_power: number;
}

interface Task {
  id: string;
  name: string;
  priority: number;
  required_power: number;
  qos_requirement: number;
}

const OptimizationPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([
    { id: 'gpu1', name: 'GPU-1', available_power: 100, max_power: 150 },
    { id: 'gpu2', name: 'GPU-2', available_power: 80, max_power: 120 }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: 'task1', name: 'ML Training', priority: 3, required_power: 60, qos_requirement: 0.9 },
    { id: 'task2', name: 'Inference', priority: 2, required_power: 40, qos_requirement: 0.8 }
  ]);

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useAuth();

  const addResource = () => {
    const newResource: Resource = {
      id: `res${resources.length + 1}`,
      name: `Resource-${resources.length + 1}`,
      available_power: 100,
      max_power: 150
    };
    setResources([...resources, newResource]);
  };

  const addTask = () => {
    const newTask: Task = {
      id: `task${tasks.length + 1}`,
      name: `Task-${tasks.length + 1}`,
      priority: 1,
      required_power: 50,
      qos_requirement: 0.8
    };
    setTasks([...tasks, newTask]);
  };

  const updateResource = (index: number, field: keyof Resource, value: any) => {
    const updated = [...resources];
    updated[index] = { ...updated[index], [field]: value };
    setResources(updated);
  };

  const updateTask = (index: number, field: keyof Task, value: any) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], [field]: value };
    setTasks(updated);
  };

  const runOptimization = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('http://localhost:8002/optimize/allocate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          resources,
          tasks,
          constraint_type: 'power_efficient'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        setError(data.detail || 'Optimization failed');
      }
    } catch (error) {
      setError('Failed to connect to optimization service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Resource Optimization
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure resources and tasks, then run CVXPY-based optimization algorithms
      </Typography>

      <Grid container spacing={4}>
        {/* Resources Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Resources</Typography>
                <Button variant="outlined" size="small" onClick={addResource}>
                  Add Resource
                </Button>
              </Box>

              {resources.map((resource, index) => (
                <Accordion key={resource.id} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>{resource.name} (ID: {resource.id})</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Available Power"
                          type="number"
                          value={resource.available_power}
                          onChange={(e) => updateResource(index, 'available_power', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Max Power"
                          type="number"
                          value={resource.max_power}
                          onChange={(e) => updateResource(index, 'max_power', Number(e.target.value))}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Tasks Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Tasks</Typography>
                <Button variant="outlined" size="small" onClick={addTask}>
                  Add Task
                </Button>
              </Box>

              {tasks.map((task, index) => (
                <Accordion key={task.id} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>{task.name} (Priority: {task.priority})</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Priority (1-5)"
                          type="number"
                          inputProps={{ min: 1, max: 5 }}
                          value={task.priority}
                          onChange={(e) => updateTask(index, 'priority', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Required Power"
                          type="number"
                          value={task.required_power}
                          onChange={(e) => updateTask(index, 'required_power', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="QoS Requirement (0-1)"
                          type="number"
                          inputProps={{ min: 0, max: 1, step: 0.1 }}
                          value={task.qos_requirement}
                          onChange={(e) => updateTask(index, 'qos_requirement', Number(e.target.value))}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Run Optimization */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={runOptimization}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
          sx={{ px: 4, py: 2 }}
        >
          {loading ? 'Running Optimization...' : 'Run Optimization'}
        </Button>
      </Box>

      {/* Results */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {results && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Analytics sx={{ mr: 1 }} />
              Optimization Results
            </Typography>

            <Grid container spacing={2}>
              {results.allocations?.map((allocation: any, index: number) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {allocation.task_id}
                    </Typography>
                    <Typography variant="body2">
                      Resource: {allocation.resource_id}
                    </Typography>
                    <Typography variant="body2">
                      Power: {allocation.allocated_power} units
                    </Typography>
                    <Chip
                      label={`Satisfaction: ${(allocation.satisfaction_level * 100).toFixed(0)}%`}
                      color={allocation.satisfaction_level > 0.8 ? 'success' : 'warning'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default OptimizationPage;