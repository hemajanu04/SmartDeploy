import React, { useEffect, useState } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip, Button, Box } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DeploymentHistory() {
  const [deployments, setDeployments] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('userId') || localStorage.getItem('userId');
    if (uid) {
      setUserId(uid);
      fetchHistory(uid);
    }
  }, []);

  const fetchHistory = async (uid) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/deploy/history/${uid}`);
      setDeployments(response.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const getStatusColor = (status) => {
    const colors = { 'live': 'success', 'failed': 'error', 'pending': 'warning', 'building': 'info' };
    return colors[status] || 'default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Deployment History</Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Back to Dashboard
        </Button>
      </Box>

      {deployments.length === 0 ? (
        <Typography color="text.secondary">No deployments yet.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Repository</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Live URL</TableCell>
              <TableCell>Deployed At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deployments.map((dep) => (
              <TableRow key={dep._id}>
                <TableCell>{dep.repoName}</TableCell>
                <TableCell>
                  <Chip label={dep.status.toUpperCase()} color={getStatusColor(dep.status)} />
                </TableCell>
                <TableCell>
                  {dep.liveUrl ? (
                    <a href={dep.liveUrl} target="_blank" rel="noreferrer">
                      {dep.liveUrl.substring(0, 30)}...
                    </a>
                  ) : '-'}
                </TableCell>
                <TableCell>{formatDate(dep.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Container>
  );
}

export default DeploymentHistory;
