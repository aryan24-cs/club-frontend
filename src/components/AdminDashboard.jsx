import React, { memo, useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  Calendar,
  Search,
  ChevronDown,
  Edit3,
  Eye,
  ChevronRight,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Bell,
} from "lucide-react";
import Navbar from "./Navbar";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Something went wrong
            </h2>
            <p className="text-red-600 mb-4">Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Stats Card Component
const StatsCard = memo(({ title, value, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <h3 className="text-lg font-semibold text-gray-900">
          {typeof value === "number" ? value : "N/A"}
        </h3>
      </div>
      <Icon className="w-6 h-6 text-[#456882]" />
    </div>
  </motion.div>
));

// Notification Card Component
const NotificationCard = memo(({ notification, onMarkAsRead }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-50 rounded-lg p-3 border border-gray-100"
  >
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-[#456882] rounded-lg flex items-center justify-center text-white text-sm">
        {notification.type.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-800">{notification.message}</p>
        <p className="text-xs text-gray-500">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
      {!notification.read && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onMarkAsRead(notification._id)}
            className="text-gray-500 hover:text-[#456882] text-xs"
            aria-label={`Mark notification ${notification.message} as read`}
          >
            Mark as read
          </motion.button>
        </div>
      )}
    </div>
  </motion.div>
));

// Club Card Component
const ClubCard = memo(({ club, onEdit, onView }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -8, transition: { duration: 0.3 } }}
    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
  >
    <div className="relative overflow-hidden">
      <img
        src={
          club.banner ||
          "https://content3.jdmagicbox.com/v2/comp/faridabad/c2/011pxx11.xx11.180720042429.n1c2/catalogue/aravali-college-of-engineering-and-management-jasana-faridabad-colleges-5hhqg5d110.jpg"
        }
        alt={club.name || "Club Banner"}
        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        onError={(e) => {
          e.target.src =
            "https://content3.jdmagicbox.com/v2/comp/faridabad/c2/011pxx11.xx11.180720042429.n1c2/catalogue/aravali-college-of-engineering-and-management-jasana-faridabad-colleges-5hhqg5d110.jpg";
          console.warn(
            `Failed to load banner for club ${club.name}: ${club.banner}`
          );
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onView(club)}
          className="p-1 bg-white/20 rounded-full hover:bg-white/30"
          aria-label={`View club ${club.name}`}
        >
          <Eye className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => onEdit(club)}
          className="p-1 bg-white/20 rounded-full hover:bg-white/30"
          aria-label={`Edit club ${club.name}`}
        >
          <Edit3 className="w-4 h-4 text-white" />
        </button>
      </div>
      <div className="absolute top-4 left-4">
        <span className="bg-[#456882] text-white px-3 py-1 rounded-full text-sm font-medium">
          {club.category || "General"}
        </span>
      </div>
    </div>
    <div className="p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-[#456882] rounded-lg flex items-center justify-center text-white text-lg font-semibold overflow-hidden">
          {club.icon ? (
            <img
              src={club.icon}
              alt={club.name || "Club Icon"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.outerHTML = `<div class="w-full h-full flex items-center justify-center bg-[#456882] text-white text-lg font-semibold">${
                  club.name?.charAt(0).toUpperCase() || "C"
                }</div>`;
                console.warn(
                  `Failed to load icon for club ${club.name}: ${club.icon}`
                );
              }}
            />
          ) : (
            club.name?.charAt(0).toUpperCase() || "C"
          )}
        </div>
        <h3 className="text-xl font-bold text-[#456882] group-hover:text-[#334d5e] transition-colors">
          {club.name || "Unnamed Club"}
        </h3>
      </div>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {club.description || "No description available"}
      </p>
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{club.memberCount || 0} members</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{club.eventsCount || 0} events</span>
        </div>
      </div>
      <Link
        to={`/clubs/${club._id}`}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#456882] to-[#5a7a98] text-white rounded-full hover:from-[#334d5e] hover:to-[#456882] transition-all duration-300 group-hover:shadow-lg transform group-hover:scale-105"
        aria-label={`View club ${club.name}`}
      >
        <span className="font-medium">View Club</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  </motion.div>
));

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState(["all"]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          navigate("/login");
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [userResponse, clubsResponse, notificationsResponse] =
          await Promise.all([
            axios.get("http://localhost:5000/api/auth/user", config),
            axios.get("http://localhost:5000/api/clubs", config),
            axios
              .get("http://localhost:5000/api/notifications", config)
              .catch((err) => {
                console.warn("Failed to fetch notifications:", err.message);
                return { data: [] }; // Fallback to empty array
              }),
          ]);

        const userData = userResponse.data;
        if (!userData || !userData._id) {
          setError("Failed to load user data.");
          navigate("/login");
          return;
        }
        setUser({
          ...userData,
          isACEMStudent: userData.isACEMStudent || false,
          rollNo: userData.rollNo || "N/A",
        });

        // Debug logging
        console.log("AdminDashboard - User:", {
          _id: userData._id,
          name: userData.name,
          isAdmin: userData.isAdmin,
          headCoordinatorClubs: userData.headCoordinatorClubs,
          isACEMStudent: userData.isACEMStudent || false,
          rollNo: userData.rollNo || "N/A",
        });

        const processedClubs = clubsResponse.data
          .filter(
            (club) =>
              userData.isAdmin ||
              userData.headCoordinatorClubs?.includes(club.name)
          )
          .map(async (club) => {
            try {
              const membersResponse = await axios.get(
                `http://localhost:5000/api/clubs/${club._id}/members`,
                config
              );
              return {
                ...club,
                memberCount: Number(membersResponse.data.length) || 0,
                eventsCount: Number(club.eventsCount) || 0,
                category: club.category || "General",
              };
            } catch (err) {
              console.warn(
                `Failed to fetch members for club ${club.name}: ${err.message}`
              );
              return {
                ...club,
                memberCount: 0,
                eventsCount: Number(club.eventsCount) || 0,
                category: club.category || "General",
              };
            }
          });
        const clubsWithMembers = await Promise.all(processedClubs);
        setClubs(clubsWithMembers);
        console.log("AdminDashboard - Clubs:", clubsWithMembers);

        // Set notifications
        setNotifications(notificationsResponse.data);

        // Set categories
        setCategories([
          "all",
          ...new Set(
            clubsWithMembers
              .map((club) => club.category?.toLowerCase())
              .filter(Boolean)
          ),
        ]);

        if (clubsWithMembers.length === 0) {
          setError("You do not have access to manage any clubs.");
        }

        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", {
          message: err.message,
          stack: err.stack,
          status: err.response?.status,
          data: err.response?.data,
        });
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          setError("Session expired or unauthorized. Please log in again.");
          navigate("/login");
        } else {
          setError(err.response?.data?.error || "Failed to load data.");
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Handle marking notification as read
  const handleMarkAsRead = useCallback(
    async (notificationId) => {
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `http://localhost:5000/api/notifications/${notificationId}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotifications((prev) =>
          prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
        );
        setSuccess("Notification marked as read.");
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to mark notification as read."
        );
        setTimeout(() => setError(""), 3000);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    },
    [navigate]
  );

  const filteredClubs = useMemo(
    () =>
      clubs.filter(
        (club) =>
          club.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (selectedFilter === "all" ||
            club.category?.toLowerCase() === selectedFilter.toLowerCase())
      ),
    [clubs, searchTerm, selectedFilter]
  );

  // Filter notifications for admin
  const filteredNotifications = useMemo(
    () =>
      notifications
        .filter(
          (n) =>
            user?.isAdmin ||
            (n.clubId && user?.headCoordinatorClubs?.includes(n.clubId))
        )
        .slice(0, 3),
    [notifications, user]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-white shadow-sm"></div>
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 font-[Poppins]">
        <Navbar user={user} role="admin" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-18">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-[#456882]">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome, {user?.name || "Admin"}! Manage your clubs, events,
                  and activities.
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/admin/events"
                  className="flex items-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-lg hover:bg-[#334d5e]"
                >
                  <Calendar className="w-4 h-4" />
                  Manage Events
                </Link>
                <Link
                  to="/admin/activities"
                  className="flex items-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-lg hover:bg-[#334d5e]"
                >
                  <Calendar className="w-4 h-4" />
                  Manage Activities
                </Link>
                <Link
                  to="/admin/users"
                  className="flex items-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-lg hover:bg-[#334d5e]"
                >
                  <Users className="w-4 h-4" />
                  Manage Users
                </Link>
                <Link
                  to="/manage-clubs"
                  className="flex items-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-lg hover:bg-[#334d5e]"
                >
                  <Users className="w-4 h-4" />
                  Manage Clubs
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-700">{error}</p>
                  <button onClick={() => setError("")} className="ml-auto">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-700">{success}</p>
                  <button onClick={() => setSuccess("")} className="ml-auto">
                    <XCircle className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <StatsCard
                  title="Managed Clubs"
                  value={clubs.length}
                  icon={Users}
                />
                <StatsCard
                  title="Total Members"
                  value={clubs.reduce(
                    (sum, club) => sum + (Number(club.memberCount) || 0),
                    0
                  )}
                  icon={Users}
                />
                <StatsCard
                  title="Active Events"
                  value={clubs.reduce(
                    (sum, club) => sum + (Number(club.eventsCount) || 0),
                    0
                  )}
                  icon={Calendar}
                />
              </div>

              {/* Clubs */}
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Your Managed Clubs
                  </h2>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Search
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                        aria-hidden="true"
                      />
                      <input
                        type="text"
                        placeholder="Search clubs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#456882] focus:border-[#456882]"
                        aria-label="Search clubs"
                      />
                    </div>
                    <div className="relative">
                      <select
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value)}
                        className="w-full sm:w-48 pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-[#456882] focus:border-[#456882]"
                        aria-label="Filter by category"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category === "all"
                              ? "All Categories"
                              : category.charAt(0).toUpperCase() +
                                category.slice(1)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
                {filteredClubs.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {searchTerm
                        ? "No clubs found."
                        : "You are not assigned to any clubs. Contact a super admin to get started."}
                    </p>
                    <Link
                      to="/manage-clubs"
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-lg hover:bg-[#334d5e]"
                    >
                      Manage Clubs
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredClubs.map((club) => (
                      <ClubCard
                        key={club._id}
                        club={club}
                        onEdit={() => navigate(`/clubs/${club._id}/edit`)}
                        onView={() => navigate(`/clubs/${club._id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Notifications */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Notifications
                  </h3>
                  {filteredNotifications.filter((n) => !n.read).length > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                      {filteredNotifications.filter((n) => !n.read).length}{" "}
                      unread
                    </span>
                  )}
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {filteredNotifications.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center">
                      No notifications.
                    </p>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <NotificationCard
                        key={notification._id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    ))
                  )}
                </div>
                {notifications.length > 3 && (
                  <Link
                    to="/notifications"
                    className="block mt-4 text-center text-sm text-[#456882] hover:underline"
                    aria-label="View all notifications"
                  >
                    View All Notifications
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AdminDashboard;
