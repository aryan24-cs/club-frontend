import React, { memo, useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Users,
  Calendar,
  Award,
  ChevronRight,
  X,
  AlertTriangle,
  Heart,
  Eye,
  MapPin,
  Clock,
  User,
  Star,
} from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Navbar from "../components/Navbar";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

// Modal Component
const Modal = ({ isOpen, onClose, message, isSuccess }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl ${
            isSuccess ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <p
              className={`text-lg font-medium ${
                isSuccess ? "text-green-700" : "text-red-700"
              }`}
            >
              {message}
            </p>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <button
            onClick={onClose}
            className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
              isSuccess
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

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

// Event Card Component
const EventCard = memo(({ event }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
    >
      <div className="relative overflow-hidden h-48">
        <img
          src={
            event.banner ||
            "https://images.unsplash.com/photo-1516321310762-4794370e6a66"
          }
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1516321310762-4794370e6a66";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {event.isUpcoming && (
          <div className="absolute top-3 left-3">
            <span className="bg-[#456882] text-white px-3 py-1 rounded-full text-xs font-medium">
              Upcoming
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-[#456882] mb-2 group-hover:text-[#334d5e] transition-colors">
          {event.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{event.time || "N/A"}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{event.location || "N/A"}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{event.club}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/events/${event._id}`)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#456882] to-[#5a7a98] text-white rounded-lg hover:from-[#334d5e] hover:to-[#456882] transition-all duration-300 group-hover:shadow-md"
          >
            <Eye className="w-4 h-4" />
            <span className="font-medium">View Event</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-gray-500 hover:text-red-500 transition"
          >
            <Heart className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

// Club Card Component
const ClubCard = memo(({ club, user, handleJoinClub, joinLoading }) => (
  <motion.div
    key={club._id}
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -8, transition: { duration: 0.3 } }}
    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
  >
    <div className="relative overflow-hidden h-48">
      <img
        src={club.banner || "https://via.placeholder.com/150?text=Club+Banner"}
        alt={`${club.name} banner`}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/150?text=Club+Banner";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute top-3 right-3">
        <span className="bg-[#456882] text-white px-2 py-1 rounded-full text-xs font-medium">
          {club.category || "General"}
        </span>
      </div>
    </div>
    <div className="p-6">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <img
            src={club.icon || "https://via.placeholder.com/150?text=Club+Icon"}
            alt={`${club.name} icon`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/150?text=Club+Icon";
            }}
          />
        </div>
        <h3 className="text-xl font-bold text-[#456882] group-hover:text-[#334d5e] transition-colors">
          {club.name}
        </h3>
      </div>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {club.description || "No description available."}
      </p>
      <div className="grid grid-cols-3 gap-2 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{club.memberCount || 0} members</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{club.eventsCount || 0} events</span>
        </div>
        <div className="flex items-center gap-1">
          <Award className="w-4 h-4" />
          <span>Active</span>
        </div>
      </div>
      {user?.clubs?.includes(club._id) ? (
        <Link
          to={`/clubs/${club._id}`}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#456882] to-[#5a7a98] text-white rounded-lg hover:from-[#334d5e] hover:to-[#456882] transition-all duration-300 group-hover:shadow-md transform group-hover:scale-100"
        >
          <span className="font-medium">Explore Club</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      ) : user?.pendingClubs?.includes(club._id) ? (
        <button
          disabled
          className="w-full py-2 px-4 rounded-lg text-white font-medium bg-gray-400 cursor-not-allowed"
        >
          Pending Approval
        </button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleJoinClub(club._id)}
          disabled={joinLoading[club._id]}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors shadow-md ${
            joinLoading[club._id]
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#456882] to-[#5a7a98] hover:from-[#334d5e] hover:to-[#456882]"
          }`}
        >
          {joinLoading[club._id] ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          ) : (
            "Join Club"
          )}
        </motion.button>
      )}
    </div>
  </motion.div>
));

// Notification Card Component
const NotificationCard = memo(({ notification }) => (
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
        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
      )}
    </div>
  </motion.div>
));

// User Profile Card Component
const UserProfileCard = memo(({ user }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
  >
    <div className="flex items-center gap-4 mb-4">
      <div className="w-16 h-16 bg-[#456882] rounded-lg flex items-center justify-center text-white text-2xl font-semibold">
        {user?.name?.charAt(0).toUpperCase() || "U"}
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900">
          {user?.name || "User"}
        </h3>
        <p className="text-sm text-gray-600">{user?.email || "N/A"}</p>
        <p className="text-sm text-gray-600">
          {user?.isACEMStudent
            ? `ACEM Student (Roll No: ${user?.rollNo || "N/A"})`
            : "Non-ACEM Student"}
        </p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
      <div>
        <p className="font-semibold">Clubs Joined</p>
        <p>{user?.clubs?.length || 0}</p>
      </div>
      <div>
        <p className="font-semibold">Attendance Rate</p>
        <p>{user?.attendanceRate || 0}%</p>
      </div>
      <div>
        <p className="font-semibold">Achievements</p>
        <p>{user?.achievements?.length || 0}</p>
      </div>
      <div>
        <p className="font-semibold">Total Points</p>
        <p>{user?.points?.totalPoints || 0}</p>
      </div>
      <div>
        <p className="font-semibold">Leaderboard Rank</p>
        <p>
          {user?.points?.rank
            ? `${user.points.rank} of ${user.points.totalUsers}`
            : "N/A"}
        </p>
      </div>
      <div>
        <p className="font-semibold">Pending Requests</p>
        <p>{user?.pendingClubs?.length || 0}</p>
      </div>
    </div>
  </motion.div>
));

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [points, setPoints] = useState({
    totalPoints: 0,
    rank: 0,
    totalUsers: 0,
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState({});
  const [eventFilters, setEventFilters] = useState({
    search: "",
    category: "",
    club: "",
  });
  const [clubFilters, setClubFilters] = useState({
    search: "",
    category: "all",
  });
  const navigate = useNavigate();

  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          navigate("/login");
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch user data
        const userResponse = await axios
          .get("http://localhost:5000/api/auth/user", config)
          .catch((err) => {
            throw new Error(
              `User data fetch failed: ${
                err.response?.data?.error || err.message
              }`
            );
          });
        const userData = userResponse.data;

        // Fetch clubs
        const clubsResponse = await axios
          .get("http://localhost:5000/api/clubs", config)
          .catch((err) => {
            throw new Error(
              `Clubs fetch failed: ${err.response?.data?.error || err.message}`
            );
          });
        const clubData = clubsResponse.data.map((club) => ({
          ...club,
          memberCount: club.members?.length || 0,
          eventsCount: club.eventsCount || 0,
          category: club.category || "General",
          description: club.description || "No description available.",
          icon: club.icon || "https://via.placeholder.com/150?text=Club+Icon",
          banner:
            club.banner || "https://via.placeholder.com/150?text=Club+Banner",
          isPending: userData.pendingClubs?.includes(club._id) || false,
        }));
        setClubs(clubData);

        // Fetch registered events
        const eventsResponse = await axios
          .get("http://localhost:5000/api/user/registered-events", config)
          .catch((err) => {
            throw new Error(
              `Events fetch failed: ${err.response?.data?.error || err.message}`
            );
          });
        setRegisteredEvents(eventsResponse.data);

        // Fetch notifications
        const notificationsResponse = await axios
          .get("http://localhost:5000/api/notifications", config)
          .catch((err) => {
            throw new Error(
              `Notifications fetch failed: ${
                err.response?.data?.error || err.message
              }`
            );
          });
        setNotifications(notificationsResponse.data);

        // Fetch achievements (with fallback for 404)
        let achievementsData = [];
        try {
          const achievementsResponse = await axios.get(
            "http://localhost:5000/api/achievements",
            config
          );
          achievementsData = achievementsResponse.data;
        } catch (err) {
          console.warn(
            "Achievements endpoint not found, setting empty array",
            err
          );
        }
        setAchievements(achievementsData);

        // Fetch user points
        const pointsResponse = await axios
          .get("http://localhost:5000/api/points/user", config)
          .catch((err) => {
            throw new Error(
              `Points fetch failed: ${err.response?.data?.error || err.message}`
            );
          });
        setPoints(pointsResponse.data);

        // Fetch leaderboard
        const leaderboardResponse = await axios
          .get("http://localhost:5000/api/points-table", config)
          .catch((err) => {
            throw new Error(
              `Leaderboard fetch failed: ${
                err.response?.data?.error || err.message
              }`
            );
          });
        setLeaderboard(leaderboardResponse.data);

        // Fetch attendance for rate calculation
        const attendanceResponse = await axios
          .get("http://localhost:5000/api/attendance", config)
          .catch((err) => {
            throw new Error(
              `Attendance fetch failed: ${
                err.response?.data?.error || err.message
              }`
            );
          });
        const attendanceRecords = attendanceResponse.data;
        const userAttendance = attendanceRecords.flatMap((record) =>
          record.attendance.filter((a) => a.userId._id === userData._id)
        );
        const presentCount = userAttendance.filter(
          (a) => a.status === "present"
        ).length;
        const totalCount = userAttendance.length;
        const attendanceRate =
          totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

        setUser({
          ...userData,
          clubs: userData.clubName
            .map((name) => clubData.find((club) => club.name === name)?._id)
            .filter(Boolean),
          achievements: achievementsData.map((a) => a._id),
          attendanceRate,
          pendingClubs: userData.pendingClubs || [],
          isACEMStudent: userData.isACEMStudent || false,
          rollNo: userData.rollNo || "N/A",
          points: pointsResponse.data,
        });
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to load dashboard data");
        if (err.message.includes("401")) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  // Handle Join Club
  const handleJoinClub = useCallback(
    async (clubId) => {
      setJoinLoading((prev) => ({ ...prev, [clubId]: true }));
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `http://localhost:5000/api/clubs/${clubId}/join`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setClubs((prev) =>
          prev.map((club) =>
            club._id === clubId ? { ...club, isPending: true } : club
          )
        );
        setUser((prev) => ({
          ...prev,
          pendingClubs: [...(prev.pendingClubs || []), clubId],
        }));
        setSuccess("Membership request submitted! Awaiting approval.");
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to submit membership request."
        );
        setTimeout(() => setError(""), 3000);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setJoinLoading((prev) => ({ ...prev, [clubId]: false }));
      }
    },
    [navigate]
  );

  // Filter events
  const filteredEvents = useMemo(
    () =>
      registeredEvents.filter(
        (event) =>
          event.title
            .toLowerCase()
            .includes(eventFilters.search.toLowerCase()) &&
          (eventFilters.category === "" ||
            event.category === eventFilters.category) &&
          (eventFilters.club === "" ||
            event.club.toLowerCase().includes(eventFilters.club.toLowerCase()))
      ),
    [registeredEvents, eventFilters]
  );

  // Filter clubs
  const filteredClubs = useMemo(
    () =>
      clubs.filter(
        (club) =>
          (club.name || "")
            .toLowerCase()
            .includes(clubFilters.search.toLowerCase()) &&
          (clubFilters.category === "all" ||
            club.category?.toLowerCase() === clubFilters.category.toLowerCase())
      ),
    [clubs, clubFilters]
  );

  // Categories for club filter
  const clubCategories = useMemo(
    () => [
      "all",
      ...new Set(
        clubs.map((club) => club.category?.toLowerCase()).filter(Boolean)
      ),
    ],
    [clubs]
  );

  // Chart.js data for leaderboard
  const chartData = useMemo(
    () => ({
      labels: leaderboard.slice(0, 5).map((user) => user.name || "Unknown"),
      datasets: [
        {
          label: "Total Points",
          data: leaderboard.slice(0, 5).map((user) => user.totalPoints || 0),
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, "#456882");
            gradient.addColorStop(1, "#5a7a98");
            return gradient;
          },
          borderColor: ["#334d5e"],
          borderWidth: 1,
          borderRadius: 8,
          barThickness: 30,
        },
      ],
    }),
    [leaderboard]
  );

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Points",
          font: { size: 14, weight: "600" },
        },
        grid: { color: "rgba(200, 200, 200, 0.2)" },
        ticks: { color: "#334d5e", font: { size: 12 } },
      },
      x: {
        title: {
          display: true,
          text: "Top Users",
          font: { size: 14, weight: "600" },
        },
        grid: { display: false },
        ticks: { color: "#334d5e", font: { size: 12 } },
      },
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Club Leaderboard",
        font: { size: 18, weight: "700" },
      },
      tooltip: {
        backgroundColor: "#334d5e",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        padding: 10,
      },
    },
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: "easeOutCubic",
    },
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-white shadow-sm"></div>
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="h-32 bg-gray-200 rounded-xl mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-xl"></div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-gray-200 rounded-xl"></div>
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
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar user={user} />
        <Modal
          isOpen={!!error}
          onClose={() => setError("")}
          message={error}
          isSuccess={false}
        />
        <Modal
          isOpen={!!success}
          onClose={() => setSuccess("")}
          message={success}
          isSuccess={true}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#456882]">
              Welcome, {user?.name?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-sm text-gray-600">
              Explore your registered events, clubs, and points at{" "}
              {user?.isACEMStudent ? "ACEM" : "your institution"}.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            <StatsCard
              title="Clubs Joined"
              value={user?.clubs?.length || 0}
              icon={Users}
            />
            <StatsCard
              title="Events Registered"
              value={registeredEvents.length}
              icon={Calendar}
            />
            <StatsCard
              title="Achievements"
              value={achievements.length}
              icon={Award}
            />
            <StatsCard
              title="Total Points"
              value={points.totalPoints}
              icon={Star}
            />
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* User Profile */}
              <UserProfileCard user={user} />

              {/* Leaderboard */}
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-[#456882] to-[#5a7a98] rounded-2xl shadow-lg p-6 text-white"
              >
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Star className="w-6 h-6" />
                  Club Leaderboard
                </h3>
                {leaderboard.length === 0 ? (
                  <p className="text-sm text-gray-200 text-center">
                    No leaderboard data available.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Card-based Leaderboard */}
                    <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                      {leaderboard.slice(0, 5).map((entry, index) => (
                        <motion.div
                          key={entry.userId}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex-shrink-0 w-64 bg-white text-gray-900 rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 ${
                            entry.userId === user?._id
                              ? "ring-2 ring-yellow-400"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {entry.profilePicture ? (
                                <img
                                  src={entry.profilePicture}
                                  alt={entry.name}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-[#456882]"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/150?text=User";
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-[#456882] flex items-center justify-center text-white text-lg font-semibold">
                                  {entry.name?.charAt(0).toUpperCase() || "U"}
                                </div>
                              )}
                              <span
                                className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  index === 0
                                    ? "bg-yellow-400 text-gray-900"
                                    : index === 1
                                    ? "bg-gray-300 text-gray-900"
                                    : index === 2
                                    ? "bg-amber-600 text-white"
                                    : "bg-gray-500 text-white"
                                }`}
                              >
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <Link
                                to={`/profile/${entry.userId}`}
                                className="text-sm font-semibold text-[#456882] hover:underline"
                              >
                                {entry.name || "Unknown"}
                              </Link>
                              <p className="text-xs text-gray-600">
                                {entry.totalPoints} Points
                              </p>
                              {entry.userId === user?._id && (
                                <p className="text-xs text-yellow-600 font-medium">
                                  You
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    {/* Chart */}
                    <div className="h-64 bg-white rounded-xl p-4">
                      <Bar data={chartData} options={chartOptions} />
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Registered Events */}
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Your Registered Events
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search events..."
                        value={eventFilters.search}
                        onChange={(e) =>
                          setEventFilters({
                            ...eventFilters,
                            search: e.target.value,
                          })
                        }
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#456882] focus:border-[#456882]"
                        aria-label="Search events"
                      />
                    </div>
                    <select
                      value={eventFilters.category}
                      onChange={(e) =>
                        setEventFilters({
                          ...eventFilters,
                          category: e.target.value,
                        })
                      }
                      className="w-full sm:w-48 pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-[#456882] focus:border-[#456882]"
                      aria-label="Filter by category"
                    >
                      <option value="">All Categories</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Competition">Competition</option>
                    </select>
                    <select
                      value={eventFilters.club}
                      onChange={(e) =>
                        setEventFilters({
                          ...eventFilters,
                          club: e.target.value,
                        })
                      }
                      className="w-full sm:w-48 pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-[#456882] focus:border-[#456882]"
                      aria-label="Filter by club"
                    >
                      <option value="">All Clubs</option>
                      {clubs.map((club) => (
                        <option key={club._id} value={club.name}>
                          {club.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {filteredEvents.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      No registered events found.
                    </p>
                    <Link
                      to="/events"
                      className="inline-block mt-4 px-4 py-2 bg-[#456882] text-white rounded-lg hover:bg-[#334d5e]"
                    >
                      Explore Events
                    </Link>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    <AnimatePresence>
                      {filteredEvents.map((event) => (
                        <EventCard key={event._id} event={event} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
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
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                      {notifications.filter((n) => !n.read).length} unread
                    </span>
                  )}
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {notifications.slice(0, 3).map((notification) => (
                    <NotificationCard
                      key={notification._id}
                      notification={notification}
                    />
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-sm text-gray-500 text-center">
                      No notifications.
                    </p>
                  )}
                </div>
                {notifications.length > 3 && (
                  <Link
                    to="/notifications"
                    className="block mt-4 text-center text-sm text-[#456882] hover:underline"
                  >
                    View All Notifications
                  </Link>
                )}
              </div>

              {/* Achievements */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Achievements
                </h3>
                <div className="space-y-3">
                  {achievements.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center">
                      No achievements yet.
                    </p>
                  ) : (
                    achievements.map((achievement) => (
                      <motion.div
                        key={achievement._id}
                        variants={itemVariants}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="text-2xl">
                          {achievement.icon || "🏆"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {achievement.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {achievement.description || "No description"}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Clubs Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-12"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Discover Clubs
              </h2>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search clubs..."
                    value={clubFilters.search}
                    onChange={(e) =>
                      setClubFilters({ ...clubFilters, search: e.target.value })
                    }
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#456882] focus:border-[#456882]"
                    aria-label="Search clubs"
                  />
                </div>
                <select
                  value={clubFilters.category}
                  onChange={(e) =>
                    setClubFilters({ ...clubFilters, category: e.target.value })
                  }
                  className="w-full sm:w-48 pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-[#456882] focus:border-[#456882]"
                  aria-label="Filter by category"
                >
                  {clubCategories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all"
                        ? "All Categories"
                        : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {filteredClubs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {clubFilters.search || clubFilters.category !== "all"
                    ? "No clubs found."
                    : "No clubs available. Explore to join one!"}
                </p>
                <Link
                  to="/clubs"
                  className="inline-block mt-4 px-4 py-2 bg-[#456882] text-white rounded-lg hover:bg-[#334d5e]"
                >
                  Explore Clubs
                </Link>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <AnimatePresence>
                  {filteredClubs.map((club) => (
                    <ClubCard
                      key={club._id}
                      club={club}
                      user={user}
                      handleJoinClub={handleJoinClub}
                      joinLoading={joinLoading}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default UserDashboard;
