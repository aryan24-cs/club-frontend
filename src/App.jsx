import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import UserDetailsForm from './components/UserDetailsForm';
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
        {/* Placeholder routes for future implementation */}
        <Route path="/clubs" element={<ProtectedRoute><Layout><div>Clubs Page (TBD)</div></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><div>Profile Page (TBD)</div></Layout></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><Layout><div>Events Page (TBD)</div></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><div>Settings Page (TBD)</div></Layout></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><Layout><div>Contact Page (TBD)</div></Layout></ProtectedRoute>} />
      </Routes>
    </>
  );
};

export default App;