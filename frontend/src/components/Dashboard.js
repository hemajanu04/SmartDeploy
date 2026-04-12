import React from 'react';
import { Container, Typography } from '@mui/material';

function Dashboard() {
  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4 }}>
        Welcome to Dashboard!
      </Typography>
      <Typography variant="body1">
        Your repositories will appear here...
      </Typography>
    </Container>
  );
}

export default Dashboard;
