import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import UserDetailsForm from "./components/UserDetailsForm";
import ClubsPage from "./components/ClubsPage";
import ClubDetailPage from "./components/ClubDetailPage";
import CreateClubPage from "./components/CreateClubPage";
import EditClubPage from "./components/EditClubPage";
import ManageEvents from "./components/ManageEvents";
// import ManageActivities from "./components/ManageActivities";
import ManageUsers from "./components/ManageUsers";
import EventEditPage from "./components/EventEditPage";
// import ActivityEditPage from "./components/ActivityEditPage";
import NotificationsPage from "./components/NotificationsPage";
import ContactPage from "./components/ContactPage";
import ProfilePage from "./components/ProfilePage";
import ManageClubsPage from "./components/ManageClubsPage";
import AttendanceTracker from "./components/Admin/AttendanceTracker";
import AdminContactPanel from "./components/Admin/AdminContactPanel";
import ClubPage from "./components/Admin/ClubPage";
import RankingSystem from "./components/Admin/RankingSystem";
import Events from "./components/Events";
import CreateEventPage from "./components/CreateEvent";
import GalleryPage from "./components/GalleryPage";
import axios from "axios";
import { useEffect, useState } from "react";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

// Role-Based Route Component
const RoleBasedRoute = ({ children, roles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          "http://localhost:5000/api/auth/user",
          config
        );
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user:", err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse w-16 h-16 bg-gray-200 rounded-full"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if user has any of the required roles
  const hasRequiredRole = roles.some((role) => {
    if (role === "super-admin") return user.isAdmin;
    if (role === "admin") return user.isHeadCoordinator || user.isAdmin;
    if (role === "user") return !user.isAdmin && !user.isHeadCoordinator;
    return false;
  });

  if (!hasRequiredRole) {
    if (user.isAdmin) {
      return <Navigate to="/super-admin-dashboard" />;
    }
    if (user.isHeadCoordinator) {
      return <Navigate to="/admin-dashboard" />;
    }
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Layout Component
const Layout = ({ children }) => {
  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
      >
        <Routes location={location}>
          {/* Unprotected Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/gallery" element={<GalleryPage />} />

          {/* Protected Routes */}
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
            path="/dashboard"
            element={
              <RoleBasedRoute roles={["user"]}>
                <Layout>
                  <UserDashboard />
                </Layout>
              </RoleBasedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <RoleBasedRoute roles={["user"]}>
                <Layout>
                  <Events />
                </Layout>
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <RoleBasedRoute roles={["admin", "super-admin"]}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </RoleBasedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard"
            element={
              <RoleBasedRoute roles={["super-admin"]}>
                <Layout>
                  <SuperAdminDashboard />
                </Layout>
              </RoleBasedRoute>
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
            path="/clubs/:clubId"
            element={
              <ProtectedRoute>
                <Layout>
                  <ClubDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateEventPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-club"
            element={
              <RoleBasedRoute roles={["super-admin"]}>
                <Layout>
                  <CreateClubPage />
                </Layout>
              </RoleBasedRoute>
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
          <Route
            path="/admin/events"
            element={
              <RoleBasedRoute roles={["admin", "super-admin"]}>
                <Layout>
                  <ManageEvents />
                </Layout>
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RoleBasedRoute roles={["admin", "super-admin"]}>
                <Layout>
                  <ManageUsers />
                </Layout>
              </RoleBasedRoute>
            }
          />
          <Route
            path="/events/:id/edit"
            element={
              <RoleBasedRoute roles={["admin", "super-admin"]}>
                <Layout>
                  <EventEditPage />
                </Layout>
              </RoleBasedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <NotificationsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <Layout>
                  <ContactPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-clubs"
            element={
              <RoleBasedRoute roles={["admin", "super-admin"]}>
                <Layout>
                  <ManageClubsPage />
                </Layout>
              </RoleBasedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <RoleBasedRoute roles={["admin", "super-admin"]}>
                <Layout>
                  <AttendanceTracker />
                </Layout>
              </RoleBasedRoute>
            }
          />
          <Route
            path="/contact-manage"
            element={
              <RoleBasedRoute roles={["admin", "super-admin"]}>
                <Layout>
                  <AdminContactPanel />
                </Layout>
              </RoleBasedRoute>
            }
          />
          <Route
            path="/ranking-system"
            element={
              <ProtectedRoute >
                <Layout>
                  <RankingSystem />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clubpage"
            element={
              <RoleBasedRoute roles={["admin", "super-admin"]}>
                <Layout>
                  <ClubPage />
                </Layout>
              </RoleBasedRoute>
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
};

export default App;
