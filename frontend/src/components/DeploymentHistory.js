import React, { useEffect, useState } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip, Button } from '@mui/material';
import axios from 'axios';

function DeploymentHistory({ userId }) {
  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/deploy/history/${userId}`);
      setDeployments(response.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'live': 'success',
      'failed': 'error',
      'pending': 'default',
      'building': 'primary'
    };
    return colors[status] || 'default';
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Deployment History</Typography>
      
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Repository</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Live URL</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {deployments.map((dep) => (
            <TableRow key={dep._id}>
              <TableCell>{dep.repoName}</TableCell>
              <TableCell>
                <Chip label={dep.status} color={getStatusColor(dep.status)} />
              </TableCell>
              <TableCell>
                {dep.liveUrl ? (
                  <a href={dep.liveUrl} target="_blank" rel="noreferrer">
                    {dep.liveUrl}
                  </a>
                ) : '-'}
              </TableCell>
              <TableCell>{new Date(dep.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}

export default DeploymentHistory;
