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
  Avatar
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import GitHubIcon from '@mui/icons-material/GitHub';

function Dashboard() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const userId = params.get('userId');

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchRepos();
    }
  }, [userId]);

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
                  onClick={() => alert(`Deploying ${repo.name}... (Pipeline will start here)`)}
                >
                  Deploy to Cloud
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Dashboard;
