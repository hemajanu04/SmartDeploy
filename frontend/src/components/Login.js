import React from 'react';
import { Button, Container, Typography, Box, Paper } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

function Login() {
  const handleLogin = () => {
    // Redirect to backend GitHub OAuth
    window.location.href = 'http://localhost:5000/api/auth/github';
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            SmartDeploy
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Automated CI/CD Deployment with Self-Healing
          </Typography>
          <Typography variant="body1" paragraph>
            One-click deployment for your GitHub projects
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<GitHubIcon />}
            onClick={handleLogin}
            sx={{ 
              mt: 3, 
              bgcolor: '#24292e',
              '&:hover': { bgcolor: '#1a1f24' }
            }}
          >
            Login with GitHub
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
