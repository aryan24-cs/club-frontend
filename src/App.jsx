import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import UserDetailsForm from './components/UserDetailsForm';
import ClubsPage from './components/ClubsPage';
import ClubDetailPage from './components/ClubDetailPage';
import CreateClubPage from './components/CreateClubPage';
import EditClubPage from './components/EditClubPage';
import Navbar from './components/Navbar';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
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
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/user-details"
          element={
            <ProtectedRoute>
              <Layout>
                <UserDetailsForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clubs"
          element={
            <ProtectedRoute>
              <Layout>
                <ClubsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clubs/:clubName"
          element={
            <ProtectedRoute>
              <Layout>
                <ClubDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-club"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateClubPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clubs/:clubName/edit"
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