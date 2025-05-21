import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  AppBar,
  Toolbar,
  CssBaseline,
  TextField,
  Paper,
  Checkbox,
  FormControlLabel,
  FormGroup,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const AdminDashboard = () => {
  const [software, setSoftware] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const [managerMsg, setManagerMsg] = useState('');
  const [managerErr, setManagerErr] = useState('');
  const [accessLevels, setAccessLevels] = useState(["read", "write", "admin"]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/login');
    } else {
      fetchSoftware();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchSoftware = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/api/software`);
      setSoftware(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching software list');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessLevelChange = (level) => {
    setAccessLevels((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level]
    );
  };

  const handleCreateSoftware = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await axios.post(`${API_BASE_URL}/api/software`, { name, description, accessLevels });
      setSuccess('Software created successfully!');
      setName('');
      setDescription('');
      setAccessLevels(["read", "write", "admin"]);
      fetchSoftware();
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating software');
    } finally {
      setSubmitting(false);
    }
  };

  const handleManagerChange = async (e) => {
    e.preventDefault();
    setManagerMsg('');
    setManagerErr('');
    setSubmitting(true);

    try {
      const res = await axios.patch(`${API_BASE_URL}/api/users/manager-email`, {
        email: managerEmail,
        name: managerName,
        password: managerPassword,
      });
      setManagerMsg(res.data.message + ': ' + res.data.email);
      setManagerEmail('');
      setManagerName('');
      setManagerPassword('');
    } catch (err) {
      setManagerErr(err.response?.data?.message || 'Error updating manager');
    } finally {
      setSubmitting(false);
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
            Admin Dashboard
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
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold', mb: 4 }}>
            Create New Software
          </Typography>
          <form onSubmit={handleCreateSoftware} style={{ marginBottom: 24 }}>
            <TextField
              label="Software Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              disabled={submitting}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              fullWidth
              disabled={submitting}
              sx={{ mb: 2 }}
            />
            <FormGroup row sx={{ mb: 2, justifyContent: 'center' }}>
              {['read', 'write', 'admin'].map((level) => (
                <FormControlLabel
                  key={level}
                  control={
                    <Checkbox
                      checked={accessLevels.includes(level)}
                      onChange={() => handleAccessLevelChange(level)}
                      name={level}
                      color="primary"
                      disabled={submitting}
                    />
                  }
                  label={level.charAt(0).toUpperCase() + level.slice(1)}
                />
              ))}
            </FormGroup>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ fontWeight: 'bold', px: 4, py: 1.5 }}
            >
              {submitting ? <CircularProgress size={24} /> : 'Create Software'}
            </Button>
          </form>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
        </Box>
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
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold', mb: 4 }}>
            Change Manager
          </Typography>
          <form onSubmit={handleManagerChange} style={{ marginBottom: 24 }}>
            <TextField
              label="Manager Email"
              value={managerEmail}
              onChange={(e) => setManagerEmail(e.target.value)}
              required
              fullWidth
              disabled={submitting}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Manager Name"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              required
              fullWidth
              disabled={submitting}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Manager Password"
              type="password"
              value={managerPassword}
              onChange={(e) => setManagerPassword(e.target.value)}
              required
              fullWidth
              disabled={submitting}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ fontWeight: 'bold', px: 4, py: 1.5 }}
            >
              {submitting ? <CircularProgress size={24} /> : 'Update Manager'}
            </Button>
          </form>
          {managerErr && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {managerErr}
            </Alert>
          )}
          {managerMsg && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {managerMsg}
            </Alert>
          )}
        </Box>
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
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold', mb: 4 }}>
            All Software
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {software.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card sx={{ borderRadius: 3, boxShadow: 4, minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
                  <CardContent>
                    <Typography variant="h6" component="h2" sx={{ color: '#0d47a1', fontWeight: 'bold' }}>
                      {item.name}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 
