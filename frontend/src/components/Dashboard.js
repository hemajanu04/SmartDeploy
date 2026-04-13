import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Grid, 
  Chip,
  CircularProgress,
  Box,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import GitHubIcon from '@mui/icons-material/GitHub';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

function Dashboard() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [deployingRepo, setDeployingRepo] = useState(null);
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const userId = params.get('userId');

  // Pipeline steps for visualizer
  const steps = ['Pending', 'Cloning', 'Building', 'Testing', 'Quality Check', 'Packaging', 'Deploying', 'Live'];

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchRepos();
    }
  }, [userId]);

  // Poll deployment status if active
  useEffect(() => {
    let interval;
    if (deployingRepo && deploymentStatus && deploymentStatus.status !== 'live' && deploymentStatus.status !== 'failed') {
      interval = setInterval(() => {
        checkDeploymentStatus(deploymentStatus._id);
      }, 2000); // Check every 2 seconds
    }
    return () => clearInterval(interval);
  }, [deploymentStatus, deployingRepo]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/auth/user/${userId}`);
      setUserData(response.data);
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const fetchRepos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/repos/${userId}`);
      setRepos(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching repos:', err);
      setLoading(false);
    }
  };

  const handleDeploy = async (repo) => {
    setDeployingRepo(repo);
    setOpenDialog(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/deploy/trigger', {
        userId,
        repoName: repo.name,
        repoFullName: repo.fullName,
        repoUrl: repo.cloneUrl
      });
      
      // Start checking status
      checkDeploymentStatus(response.data.deploymentId);
      
    } catch (err) {
      console.error('Deploy error:', err);
      alert('Failed to start deployment');
    }
  };

  const checkDeploymentStatus = async (deploymentId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/deploy/status/${deploymentId}`);
      setDeploymentStatus(response.data);
    } catch (err) {
      console.error('Status check error:', err);
    }
  };

  const getActiveStep = () => {
    if (!deploymentStatus) return 0;
    const statusMap = {
      'pending': 0,
      'cloning': 1,
      'building': 2,
      'testing': 3,
      'quality_check': 4,
      'packaging': 5,
      'deploying': 6,
      'live': 7,
      'failed': -1
    };
    return statusMap[deploymentStatus.status] || 0;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading your repositories...</Typography>
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ bgcolor: '#24292e', mr: 2 }}>
          <GitHubIcon />
        </Avatar>
        <div>
          <Typography variant="h4" component="h1">
            Welcome{userData ? `, ${userData.username}` : ''}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Select a repository to deploy to the cloud
          </Typography>
        </div>
      </Box>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Your GitHub Repositories ({repos.length})
      </Typography>

      <Grid container spacing={3}>
        {repos.map((repo) => (
          <Grid item xs={12} md={6} lg={4} key={repo.id}>
            <Card variant="outlined" sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              '&:hover': { boxShadow: 3 }
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div" noWrap title={repo.name}>
                  {repo.name}
                </Typography>
                
                <Typography sx={{ mb: 1.5 }} color="text.secondary" variant="body2">
                  {repo.fullName}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 2, minHeight: 40 }}>
                  {repo.description || 'No description available'}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {repo.language && (
                    <Chip 
                      label={repo.language} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  )}
                  <Chip 
                    label={`⭐ ${repo.stars}`} 
                    size="small" 
                    variant="outlined"
                  />
                </Box>
              </CardContent>
              
              <CardActions>
                <Button 
                  variant="contained" 
                  color="success"
                  fullWidth
                  startIcon={<RocketLaunchIcon />}
                  onClick={() => handleDeploy(repo)}
                  disabled={deployingRepo && deployingRepo.id === repo.id}
                >
                  {deployingRepo && deployingRepo.id === repo.id ? 'Deploying...' : 'Deploy to Cloud'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Deployment Status Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Deploying {deployingRepo?.name}
          {deploymentStatus?.status === 'live' && ' ✅ LIVE!'}
        </DialogTitle>
        
        <DialogContent>
          {deploymentStatus ? (
            <>
              {/* Stepper Visual */}
              <Stepper activeStep={getActiveStep()} alternativeLabel sx={{ mb: 3 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Status Alert */}
              {deploymentStatus.status === 'live' && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Deployment successful! 
                  <br/>
                  <strong>Live URL:</strong> <a href={deploymentStatus.liveUrl} target="_blank" rel="noopener noreferrer">{deploymentStatus.liveUrl}</a>
                </Alert>
              )}
              
              {deploymentStatus.status === 'failed' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Deployment failed: {deploymentStatus.errorMessage}
                </Alert>
              )}

              {/* Live Logs */}
              <Typography variant="h6" gutterBottom>
                Deployment Logs
              </Typography>
              <List dense sx={{ 
                bgcolor: '#f5f5f5', 
                borderRadius: 1,
                maxHeight: 300,
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}>
                {deploymentStatus.logs.map((log, index) => (
                  <ListItem key={index} divider={index < deploymentStatus.logs.length - 1}>
                    <ListItemText 
                      primary={`[${new Date(log.timestamp).toLocaleTimeString()}] [${log.stage.toUpperCase()}] ${log.message}`}
                    />
                  </ListItem>
                ))}
                {deploymentStatus.status !== 'live' && deploymentStatus.status !== 'failed' && (
                  <ListItem>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    <ListItemText primary="Working..." />
                  </ListItem>
                )}
              </List>
            </>
          ) : (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          )}
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setOpenDialog(false)} color="primary">
              {deploymentStatus?.status === 'live' || deploymentStatus?.status === 'failed' ? 'Close' : 'Hide'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default Dashboard;
