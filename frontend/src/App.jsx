import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';

const PrivateRoute = ({ children, requireManager, requireAdmin }) => {
  const { user, loading } = useAuth();

  console.log('PrivateRoute - User:', user);
  console.log('PrivateRoute - Loading:', loading);
  console.log('PrivateRoute - RequireManager:', requireManager);
  console.log('PrivateRoute - RequireAdmin:', requireAdmin);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log('PrivateRoute - No user, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (requireManager && user.role !== 'manager') {
    console.log('PrivateRoute - Not manager, redirecting to dashboard');
    return <Navigate to="/dashboard" />;
  }

  if (requireAdmin && user.role !== 'admin') {
    console.log('PrivateRoute - Not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <PrivateRoute requireManager>
                <ManagerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute requireAdmin>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
