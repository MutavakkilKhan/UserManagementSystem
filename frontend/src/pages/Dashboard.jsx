import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  AppBar,
  Toolbar,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  TextField,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const Dashboard = () => {
  const [software, setSoftware] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedSoftware, setSelectedSoftware] = useState(null);
  const [accessType, setAccessType] = useState('read');
  const [reason, setReason] = useState('');
  const [requestMsg, setRequestMsg] = useState('');
  const [requestErr, setRequestErr] = useState('');

  useEffect(() => {
    fetchSoftware();
  }, []);

  const fetchSoftware = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/software`);
      setSoftware(response.data);
    } catch (error) {
      setError('Error fetching software list');
      console.error('Error:', error);
    }
  };

  const handleRequestAccess = (software) => {
    setSelectedSoftware(software);
    setAccessType('read');
    setReason('');
    setRequestMsg('');
    setRequestErr('');
    setOpen(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setRequestMsg('');
    setRequestErr('');
    try {
      await axios.post(`${API_BASE_URL}/api/access-request`, {
        softwareId: selectedSoftware.id,
        accessType,
        reason,
      });
      setRequestMsg('Access request submitted successfully!');
      setOpen(false);
    } catch (error) {
      if (error.response?.data?.message === 'Access request already pending') {
        setRequestErr('You already have a pending request for this software.');
      } else {
        setRequestErr('Error submitting access request');
      }
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        zIndex: 0,
      }}
    >
      <CssBaseline />
      <AppBar position="static" sx={{ borderRadius: 2, mt: 2, width: '96%', mx: 'auto', background: 'rgba(26, 35, 126, 0.95)', boxShadow: 3 }}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1 }}>
            User Access Management
          </Typography>
          <Button color="inherit" onClick={handleLogout} sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} disableGutters sx={{ mt: 6, mb: 6, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <Box
          sx={{
            p: { xs: 2, sm: 4, md: 6 },
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.97)',
            boxShadow: 6,
            width: '100%',
            maxWidth: 1600,
            minWidth: { xs: '100%', sm: '90%', md: '80%' },
            textAlign: 'center',
            mx: 'auto',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold', mb: 4 }}>
            Available Software
          </Typography>
          {error && (
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
          )}
          <Grid container spacing={4} justifyContent="center" sx={{ width: '100%' }}>
            {software.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id} sx={{ display: 'flex' }}>
                <Card sx={{ borderRadius: 3, boxShadow: 4, minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', width: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" component="h2" sx={{ color: '#0d47a1', fontWeight: 'bold' }}>
                      {item.name}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button
                      size="medium"
                      variant="contained"
                      sx={{
                        background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                        color: '#fff',
                        fontWeight: 'bold',
                        borderRadius: 2,
                        px: 3,
                        '&:hover': {
                          background: 'linear-gradient(45deg, #0d47a1 30%, #1a237e 90%)',
                        },
                      }}
                      onClick={() => handleRequestAccess(item)}
                    >
                      Request Access
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Request Access: {selectedSoftware?.name}</DialogTitle>
        <form onSubmit={handleSubmitRequest}>
          <DialogContent>
            <TextField
              select
              label="Access Type"
              value={accessType}
              onChange={(e) => setAccessType(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            >
              <MenuItem value="read">Read</MenuItem>
              <MenuItem value="write">Write</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <TextField
              label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              fullWidth
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            {requestErr && <Typography color="error">{requestErr}</Typography>}
            {requestMsg && <Typography color="success.main">{requestMsg}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Submit</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 