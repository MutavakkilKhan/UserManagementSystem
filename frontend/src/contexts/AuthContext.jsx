import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch user info
  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/me`);
      console.log('User data from /me endpoint:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user info:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set:', axios.defaults.headers.common['Authorization']);
      fetchUserInfo();
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with email:', email);
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
        email,
        password,
      });
      console.log('Login response:', response.data);
      const { token } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Token set in localStorage and Authorization header');
      await fetchUserInfo();
      return { success: true };
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      });
      const message = error.response?.data?.message || 'Login error';
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/register`, {
        name,
        email,
        password,
      });
      const { token } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await fetchUserInfo();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration error';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 