import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import UserDetailsForm from './components/UserDetailsForm';
import ClubsPage from './components/ClubsPage';
import ClubDetailPage from './components/ClubDetailPage';
import CreateClubPage from './components/CreateClubPage';
import EditClubPage from './components/EditClubPage';
import Navbar from './components/Navbar';
import axios from 'axios';
import { useEffect, useState } from 'react';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to='/login' />;
};

// Role-Based Route Component
const RoleBasedRoute = ({ children, role }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          'http://localhost:5000/api/auth/user',
          config
        );
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user:', err);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to='/login' />;
  }

  if (role === 'super-admin' && !user.isAdmin) {
    return <Navigate to='/dashboard' />;
  }

  if (role === 'admin' && !user.isHeadCoordinator) {
    return <Navigate to='/dashboard' />;
  }

  if (role === 'user' && (user.isAdmin || user.isHeadCoordinator)) {
    return (
      <Navigate
        to={user.isAdmin ? '/super-admin-dashboard' : '/admin-dashboard'}
      />
    );
  }

  return children;
};

// Layout Component with Navbar
const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route
          path='/user-details'
          element={
            <ProtectedRoute>
              <Layout>
                <UserDetailsForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/dashboard'
          element={
            <RoleBasedRoute role='user'>
              <Layout>
                <UserDashboard />
              </Layout>
            </RoleBasedRoute>
          }
        />
        <Route
          path='/admin-dashboard'
          element={
            <RoleBasedRoute role='admin'>
              <Layout>
                <AdminDashboard />
              </Layout>
            </RoleBasedRoute>
          }
        />
        <Route
          path='/super-admin-dashboard'
          element={
            <RoleBasedRoute role='super-admin'>
              <Layout>
                <SuperAdminDashboard />
              </Layout>
            </RoleBasedRoute>
          }
        />
        <Route
          path='/clubs'
          element={
            <ProtectedRoute>
              <Layout>
                <ClubsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/club/:clubId'
          element={
            <ProtectedRoute>
              <Layout>
                <ClubDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/create-club'
          element={
            <RoleBasedRoute role='super-admin'>
              <Layout>
                <CreateClubPage />
              </Layout>
            </RoleBasedRoute>
          }
        />
        <Route
          path='/clubs/:clubName/edit'
          element={
            <ProtectedRoute>
              <Layout>
                <EditClubPage />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
