import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Frontend Gmail validation
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      setError('Only valid Gmail addresses are allowed.');
      return;
    }
    // Password length validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const result = await register(name, email, password);
    if (result.success) {
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      setError(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0,
      }}
    >
      <Container maxWidth="sm" sx={{ zIndex: 1 }}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{
              color: '#1a237e',
              fontWeight: 'bold',
              mb: 4,
            }}
          >
            Create Account
          </Typography>
          {error && (
            <Typography
              color="error"
              align="center"
              gutterBottom
              sx={{ mb: 2 }}
            >
              {error}
            </Typography>
          )}
          {success && (
            <Typography
              color="success.main"
              align="center"
              gutterBottom
              sx={{ mb: 2 }}
            >
              {success}
            </Typography>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#1a237e',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#1a237e',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#1a237e',
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 4,
                mb: 2,
                py: 1.5,
                background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #0d47a1 30%, #1a237e 90%)',
                },
              }}
            >
              Register
            </Button>
          </form>
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  textDecoration: 'none',
                  color: '#1a237e',
                  fontWeight: 'bold',
                }}
              >
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register; 