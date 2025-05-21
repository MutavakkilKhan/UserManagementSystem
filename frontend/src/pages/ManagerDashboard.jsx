import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  AppBar,
  Toolbar,
  Box,
  CssBaseline,
  Tooltip,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const ManagerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user?.role !== 'manager') {
      navigate('/login');
    } else {
      fetchRequests();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/access-request`);
      setRequests(response.data);
    } catch (error) {
      setError('Error fetching access requests');
    }
  };

  const handleUpdateRequest = async (requestId, status) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/access-request/${requestId}`, {
        status,
      });
      // Update the status in-place for a smoother UX
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status } : req
        )
      );
    } catch (error) {
      setError('Error updating access request');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        zIndex: 0,
      }}
    >
      <CssBaseline />
      <AppBar position="static" sx={{ borderRadius: 0, mt: 0, width: '100vw', mx: 0, background: 'rgba(26, 35, 126, 0.95)', boxShadow: 3 }}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1 }}>
            Manager Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout} sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          mt: 6,
          mb: 6,
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100vw',
        }}
      >
        <Box
          sx={{
            p: { xs: 1, sm: 2, md: 4 },
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.97)',
            boxShadow: 6,
            width: '100vw',
            maxWidth: '100vw',
            minWidth: '100vw',
            textAlign: 'center',
            mx: 0,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold', mb: 4 }}>
            Access Requests
          </Typography>
          {error && (
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
          )}
          <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: 4 }}>
            <Table sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%)' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: '#0d47a1', py: 2 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#0d47a1', py: 2 }}>Software</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#0d47a1', py: 2 }}>Access Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#0d47a1', py: 2 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#0d47a1', py: 2 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#0d47a1', py: 2 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#0d47a1', py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow
                    key={request.id}
                    sx={{
                      transition: 'background 0.2s',
                      '&:hover': { background: '#f5faff' },
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>{request.user.name}</TableCell>
                    <TableCell sx={{ py: 2 }}>{request.software.name}</TableCell>
                    <TableCell sx={{ py: 2 }}>{request.accessType}</TableCell>
                    <TableCell sx={{ py: 2, maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Tooltip title={request.reason} placement="top" arrow>
                        <span>{request.reason}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      {request.status === 'approved' && (
                        <span style={{ color: 'green', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} /> Approved
                        </span>
                      )}
                      {request.status === 'rejected' && (
                        <span style={{ color: 'red', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CancelIcon fontSize="small" sx={{ mr: 0.5 }} /> Rejected
                        </span>
                      )}
                      {request.status === 'pending' && (
                        <span style={{ color: '#1976d2', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <HourglassEmptyIcon fontSize="small" sx={{ mr: 0.5 }} /> Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>{new Date(request.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ py: 2 }}>
                      {request.status === 'pending' && (
                        <Box>
                          <Button
                            color="success"
                            variant="contained"
                            sx={{ mr: 1, fontWeight: 'bold', borderRadius: 2, px: 2, boxShadow: 2 }}
                            onClick={() => handleUpdateRequest(request.id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            color="error"
                            variant="contained"
                            sx={{ fontWeight: 'bold', borderRadius: 2, px: 2, boxShadow: 2 }}
                            onClick={() => handleUpdateRequest(request.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default ManagerDashboard; 