import React, { useEffect, useState } from "react";
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
import ManageUsers from "./components/ManageUsers";
import EventEditPage from "./components/EventEditPage";
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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

// Role-Based Route Component
const RoleBasedRoute = ({ children, allowedRoles }) => {
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
      } catch (err) {
        console.error("Error fetching user:", err);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#456882] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isSuperAdmin = user.isAdmin;
  const isAdmin = user.isHeadCoordinator;
  const isUser = !isSuperAdmin && !isAdmin;

  // Redirect super-admins and admins trying to access user routes
  if (allowedRoles.includes("user") && (isSuperAdmin || isAdmin)) {
    return (
      <Navigate
        to={isSuperAdmin ? "/super-admin-dashboard" : "/admin-dashboard"}
        replace
      />
    );
  }

  // Redirect non-super-admins trying to access super-admin routes
  if (allowedRoles.includes("super-admin") && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Redirect non-admins (and non-super-admins) trying to access admin routes
  if (allowedRoles.includes("admin") && !isAdmin && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Allow super-admins to access admin routes
  if (allowedRoles.includes("admin") && isSuperAdmin) {
    return children;
  }

  // Check if user has one of the allowed roles
  const hasAccess = allowedRoles.some((role) => {
    if (role === "user" && isUser) return true;
    if (role === "admin" && isAdmin) return true;
    if (role === "super-admin" && isSuperAdmin) return true;
    return false;
  });

  return hasAccess ? children : <Navigate to="/dashboard" replace />;
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
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/gallery"
            element={
              <ProtectedRoute>
                <Layout>
                  <GalleryPage />
                </Layout>
              </ProtectedRoute>
            }
          />
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
              <RoleBasedRoute allowedRoles={["user"]}>
                <Layout>
                  <UserDashboard />
                </Layout>
              </RoleBasedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Layout>
                  <Events />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <RoleBasedRoute allowedRoles={["admin", "super-admin"]}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </RoleBasedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard"
            element={
              <RoleBasedRoute allowedRoles={["super-admin"]}>
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
              <RoleBasedRoute allowedRoles={["super-admin"]}>
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
              <RoleBasedRoute allowedRoles={["admin", "super-admin"]}>
                <Layout>
                  <ManageEvents />
                </Layout>
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RoleBasedRoute allowedRoles={["admin", "super-admin"]}>
                <Layout>
                  <ManageUsers />
                </Layout>
              </RoleBasedRoute>
            }
          />
          <Route
            path="/events/:id/edit"
            element={
              <RoleBasedRoute allowedRoles={["admin", "super-admin"]}>
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
              <RoleBasedRoute allowedRoles={["admin", "super-admin"]}>
                <Layout>
                  <ManageClubsPage />
                </Layout>
              </RoleBasedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <RoleBasedRoute allowedRoles={["admin", "super-admin"]}>
                <Layout>
                  <AttendanceTracker />
                </Layout>
              </RoleBasedRoute>
            }
          />
          <Route
            path="/contact-manage"
            element={
              <RoleBasedRoute allowedRoles={["admin", "super-admin"]}>
                <Layout>
                  <AdminContactPanel />
                </Layout>
              </RoleBasedRoute>
            }
          />
          <Route
            path="/ranking-system"
            element={
              <RoleBasedRoute allowedRoles={["admin", "super-admin"]}>
                <Layout>
                  <RankingSystem />
                </Layout>
              </RoleBasedRoute>
            }
          />
          <Route
            path="/clubpage"
            element={
              <RoleBasedRoute allowedRoles={["admin", "super-admin"]}>
                <Layout>
                  <ClubPage />
                </Layout>
              </RoleBasedRoute>
            }
          />
          {/* Catch-all route for undefined paths */}
          <Route path="*" element={<Navigate to="/login" replace />} />
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
