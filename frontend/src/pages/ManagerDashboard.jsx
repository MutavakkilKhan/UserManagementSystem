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
  CircularProgress,
  Alert,
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
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/api/access-request`);
      setRequests(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching access requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequest = async (requestId, status) => {
    try {
      setUpdating(true);
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
      setError(error.response?.data?.message || 'Error updating access request');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        zIndex: 0,
        overflowX: 'hidden',
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
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Software</TableCell>
                  <TableCell>Access Type</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
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
                    <TableCell sx={{ py: 2 }}>
                      {request.status === 'pending' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            disabled={updating}
                            onClick={() => handleUpdateRequest(request.id, 'approved')}
                            sx={{ minWidth: 100 }}
                          >
                            {updating ? <CircularProgress size={20} /> : 'Approve'}
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            disabled={updating}
                            onClick={() => handleUpdateRequest(request.id, 'rejected')}
                            sx={{ minWidth: 100 }}
                          >
                            {updating ? <CircularProgress size={20} /> : 'Reject'}
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
