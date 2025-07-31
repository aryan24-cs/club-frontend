import React, { memo, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Navbar from "../components/Navbar";
import {
  FaCode,
  FaMusic,
  FaBook,
  FaRunning,
  FaHandsHelping,
  FaTrophy,
  FaCalendarAlt,
  FaUsers,
  FaBell,
  FaMapMarkerAlt,
  FaClock,
  FaUserFriends,
  FaStar,
  FaHeart,
  FaShareAlt,
  FaFilter,
  FaSearch,
  FaChartLine,
  FaMedal,
  FaGraduationCap,
  FaFireAlt,
  FaEye,
  FaSpinner,
  FaWhatsapp,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle,
  FaCrown,
  FaShieldAlt,
  FaArrowRight,
  FaPlus,
  FaExternalLinkAlt,
  FaHome,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// Theme configuration
const theme = {
  primary: "#456882",
  secondary: "#CFFFE2",
  accent: "#d1d5db",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
};

// Icon mapping
const iconMap = {
  FaCode: <FaCode />,
  FaMusic: <FaMusic />,
  FaBook: <FaBook />,
  FaRunning: <FaRunning />,
  FaHandsHelping: <FaHandsHelping />,
  FaTrophy: <FaTrophy />,
};

// Animation variants
const pageVariants = {
  initial: { opacity: 0, x: "-100%" },
  animate: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
  exit: { opacity: 0, x: "100%", transition: { duration: 0.5, ease: "easeIn" } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const cardVariants = {
  hover: { scale: 1.03, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)", transition: { duration: 0.3 } },
};

const buttonVariants = {
  hover: { scale: 1.05, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)", transition: { duration: 0.3 } },
  tap: { scale: 0.95 },
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
    <motion.div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-16 h-16 border-4 border-[#456882] border-t-transparent rounded-full mx-auto mb-4"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-600 text-lg"
      >
        Loading your dashboard...
      </motion.p>
    </motion.div>
  </div>
);

// Stats Card Component
const StatsCard = memo(({ stat, index }) => (
  <motion.div
    variants={itemVariants}
    whileHover={cardVariants.hover}
    className={`bg-gradient-to-r ${stat.color} p-6 rounded-xl text-white shadow-lg`}
  >
    <div className="flex items-center justify-between">
      <div>
        <motion.p
          className="text-3xl font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
        >
          {stat.value}
        </motion.p>
        <p className="text-sm opacity-90 mt-1">{stat.label}</p>
        {stat.change && (
          <p className="text-xs opacity-75 mt-1">
            {stat.change > 0 ? "+" : ""}{stat.change}% from last month
          </p>
        )}
      </div>
      <motion.div className="text-3xl opacity-80" whileHover={{ scale: 1.2, rotate: 10 }}>
        {stat.icon}
      </motion.div>
    </div>
  </motion.div>
));

// Club Card Component
const ClubCard = memo(({ club, user, handleJoinClub, joiningClub }) => {
  const isJoined = user?.clubs?.includes(club._id);
  const isPending = user?.pendingClubs?.includes(club._id);
  const navigate = useNavigate();

  return (
    <motion.div
      variants={itemVariants}
      whileHover={cardVariants.hover}
      className="relative bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="absolute top-4 right-4 z-10">
        {isJoined ? (
          <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
            <FaCheckCircle /> Joined
          </span>
        ) : isPending ? (
          <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
            <FaClock /> Pending
          </span>
        ) : (
          <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-semibold">
            Available
          </span>
        )}
      </div>
      <div className="relative bg-gradient-to-r from-[#456882] to-blue-600 p-6 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <motion.div
            className="inline-flex p-3 rounded-full bg-white/20 text-3xl mb-4"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {club.icon ? (
              <img src={club.icon} alt={`${club.name} icon`} loading="lazy" className="w-8 h-8 object-cover rounded-full" />
            ) : (
              iconMap[club.iconName] || <FaTrophy />
            )}
          </motion.div>
          <h3 className="text-xl font-bold mb-2">{club.name}</h3>
          <div className="flex items-center gap-4 text-sm opacity-90">
            <div className="flex items-center gap-1">
              <FaStar />
              <span>{club.rating || "N/A"}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaUsers />
              <span>{club.memberCount || 0} members</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-4 line-clamp-2">{club.description}</p>
        <div className="space-y-2 mb-4 text-sm text-gray-500">
          <div className="flex justify-between">
            <span>Category:</span>
            <span className="font-medium">{club.category}</span>
          </div>
          <div className="flex justify-between">
            <span>Founded:</span>
            <span className="font-medium">{club.founded || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span>Head Coordinator:</span>
            <span className="font-medium">{club.headCoordinator || club.headCoordinators?.[0] || "N/A"}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
            onClick={() => navigate(`/clubs/${club._id}`)}
            aria-label="View club details"
          >
            <FaEye />
            View Details
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => handleJoinClub(club._id)}
            disabled={isPending || joiningClub === club._id}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${isPending || joiningClub === club._id
                ? "bg-yellow-400 text-white cursor-not-allowed"
                : "bg-[#456882] text-white hover:bg-[#3a536b]"
              }`}
            aria-label={isPending ? "Membership request pending" : "Join club"}
          >
            {joiningClub === club._id ? (
              <>
                <FaSpinner className="animate-spin" />
                Joining...
              </>
            ) : isPending ? (
              <>
                <FaClock />
                Pending
              </>
            ) : (
              <>
                <FaPlus />
                Join Club
              </>
            )}
          </motion.button>
        </div>
        {isJoined && (
          <div className="flex gap-2 mt-3 pt-3 border-t">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
              title="WhatsApp Group"
              onClick={() => window.open(club.whatsappLink || "https://wa.me", "_blank")}
              aria-label="Join WhatsApp group"
            >
              <FaWhatsapp />
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
              title="Email Coordinator"
              onClick={() => window.location.href = `mailto:${club.contactEmail || club.headCoordinator || "no-email@example.com"}`}
              aria-label="Email coordinator"
            >
              <FaEnvelope />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
});

// Activity Card Component
const ActivityCard = memo(({ activity }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={itemVariants}
      whileHover={cardVariants.hover}
      className="relative bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {activity.featured && (
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
            <FaFireAlt /> Featured
          </span>
        </div>
      )}
      <div className="relative h-48 overflow-hidden">
        <img
          src={activity.images?.[0] || "https://images.unsplash.com/photo-1523240795612-9a054b0db644"}
          alt={activity.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center gap-2 text-sm">
            <FaCalendarAlt />
            <span>{new Date(activity.date).toLocaleDateString()}</span>
            <FaClock />
            <span>{activity.time || "N/A"}</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h4 className="text-lg font-bold text-gray-900 line-clamp-2">{activity.title}</h4>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${activity.type === "seminar"
                ? "bg-blue-100 text-blue-600"
                : activity.type === "competition"
                  ? "bg-green-100 text-green-600"
                  : activity.type === "workshop"
                    ? "bg-purple-100 text-purple-600"
                    : "bg-gray-100 text-gray-600"
              }`}
          >
            {activity.type || "event"}
          </span>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">{activity.description}</p>
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <FaMapMarkerAlt />
            <span>{activity.location || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <FaUsers />
            <span>{activity.attendees || 0}/{activity.maxCapacity || "N/A"} registered</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <FaGraduationCap />
            <span>By {activity.club}</span>
          </div>
        </div>
        {activity.attendees && activity.maxCapacity && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Registration</span>
              <span>{Math.round((activity.attendees / activity.maxCapacity) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-[#456882] h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(activity.attendees / activity.maxCapacity) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
        {activity.tags && (
          <div className="flex flex-wrap gap-1 mb-4">
            {activity.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-3">
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${activity.registrationOpen
                ? "bg-[#456882] text-white hover:bg-[#3a536b]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            disabled={!activity.registrationOpen}
            onClick={() => navigate(`/events/${activity._id}`)}
            aria-label={activity.registrationOpen ? "Register for event" : "Registration closed"}
          >
            {activity.registrationOpen ? "Register Now" : "Registration Closed"}
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            className="p-2 text-gray-500 hover:text-red-500 transition"
            aria-label="Like event"
          >
            <FaHeart />
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            className="p-2 text-gray-500 hover:text-blue-500 transition"
            aria-label="Share event"
          >
            <FaShareAlt />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

// User Profile Card Component
const UserProfileCard = memo(({ user }) => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const getRoleBadge = () => {
    if (user?.isAdmin) return { text: "Super Admin", color: "bg-red-500", icon: <FaCrown /> };
    if (user?.isHeadCoordinator)
      return { text: "Head Coordinator", color: "bg-purple-500", icon: <FaShieldAlt /> };
    return { text: "Student", color: "bg-blue-500", icon: <FaGraduationCap /> };
  };

  const badge = getRoleBadge();

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="bg-gradient-to-r from-[#456882] to-blue-600 p-6 text-white relative">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold"
              whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </motion.div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{user?.name || "User"}</h3>
              <p className="opacity-90">{user?.course}</p>
              <p className="opacity-90 text-sm">Semester {user?.semester || "N/A"} • Roll No: {user?.rollNo || "N/A"}</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color} flex items-center gap-1`}
                >
                  {badge.icon}
                  {badge.text}
                </span>
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                  Rank #{user?.overallRank || "N/A"}
                </span>
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                  {user?.isACEMStudent ? "ACEM Student" : "Non-ACEM Student"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{user?.clubs?.length || 0}</p>
            <p className="text-xs text-gray-600">Clubs Joined</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{user?.eventsAttended?.length || 0}</p>
            <p className="text-xs text-gray-600">Events Attended</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{user?.achievements?.length || 0}</p>
            <p className="text-xs text-gray-600">Achievements</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{user?.attendanceRate || 0}%</p>
            <p className="text-xs text-gray-600">Attendance</p>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="flex-1 px-4 py-2 bg-[#456882] text-white rounded-lg hover:bg-[#3a536b] transition flex items-center justify-center gap-2"
            onClick={() => navigate("/profile")}
            aria-label="View user profile"
          >
            <FaEye />
            View Profile
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="px-4 py-2 border border-[#456882] text-[#456882] rounded-lg hover:bg-[#456882]/10 transition"
            aria-label="External link"
          >
            <FaExternalLinkAlt />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

// Notification Card Component
const NotificationCard = memo(({ notification }) => {
  const getNotificationStyle = (type) => {
    switch (type) {
      case "success":
        return "border-l-green-500 bg-green-50";
      case "warning":
        return "border-l-yellow-500 bg-yellow-50";
      case "error":
        return "border-l-red-500 bg-red-50";
      default:
        return "border-l-blue-500 bg-blue-50";
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={cardVariants.hover}
      className={`p-4 border-l-4 rounded-lg shadow-sm ${getNotificationStyle(notification.type)}`}
    >
      <div className="flex items-start gap-3">
        <FaBell className="text-lg mt-1" style={{ color: theme.primary }} />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(notification.createdAt).toLocaleDateString()}
          </p>
        </div>
        {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
      </div>
    </motion.div>
  );
});

// Main Dashboard Component
const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [joiningClub, setJoiningClub] = useState(null);
  const [activityFilters, setActivityFilters] = useState({
    search: "",
    type: "",
    club: "",
  });
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  // Fetch data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          navigate("/login");
          return;
        }

        // Fetch user data
        const userResponse = await axios.get("http://localhost:5000/api/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = userResponse.data;

        // Fetch clubs
        const clubsResponse = await axios.get("http://localhost:5000/api/clubs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const clubsData = clubsResponse.data;
        setClubs(clubsData);

        // Map club names to IDs
        const userClubs = userData.clubName
          .map((name) => clubsData.find((club) => club.name === name)?._id)
          .filter(Boolean);

        // Fetch activities
        const activitiesResponse = await axios.get("http://localhost:5000/api/activities", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActivities(activitiesResponse.data);

        // Fetch notifications
        const notificationsResponse = await axios.get("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(notificationsResponse.data);

        // Fetch achievements
        const achievementsResponse = await axios.get("http://localhost:5000/api/achievements", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAchievements(achievementsResponse.data);

        // Fetch attendance for rate calculation
        const attendanceResponse = await axios.get("http://localhost:5000/api/attendance", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const attendanceRecords = attendanceResponse.data;
        const userAttendance = attendanceRecords.flatMap((record) =>
          record.attendance.filter((a) => a.userId._id === userData._id)
        );
        const presentCount = userAttendance.filter((a) => a.status === "present").length;
        const totalCount = userAttendance.length;
        const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

        // Fetch events attended
        const eventsAttendedResponse = await axios.get("http://localhost:5000/api/user/events-attended", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch pending membership requests
        const membershipResponse = await axios.get("http://localhost:5000/api/membership-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const pendingClubs = membershipResponse.data
          .filter((req) => req.status === "pending")
          .map((req) => clubsData.find((club) => club.name === req.clubName)?._id)
          .filter(Boolean);

        setUser({
          ...userData,
          clubs: userClubs,
          eventsAttended: eventsAttendedResponse.data || [],
          achievements: achievementsResponse.data.map((a) => a._id),
          overallRank: 5, // Placeholder until backend supports ranking
          attendanceRate,
          pendingClubs,
          isACEMStudent: userData.isACEMStudent || false,
          rollNo: userData.rollNo || "N/A",
        });
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.error || "Failed to load dashboard data");
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleJoinClub = useCallback(async (clubId) => {
    try {
      setJoiningClub(clubId);
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/clubs/${clubId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser((prev) => ({
        ...prev,
        pendingClubs: [...(prev?.pendingClubs || []), clubId],
      }));
      setError("Club join request sent successfully!");
      setTimeout(() => setError(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send join request");
    } finally {
      setJoiningClub(null);
    }
  }, []);

  // Calculate stats
  const stats = [
    {
      icon: <FaUsers />,
      label: "Clubs Joined",
      value: user?.clubs?.length || 0,
      color: "from-blue-500 to-blue-600",
      change: 12,
    },
    {
      icon: <FaCalendarAlt />,
      label: "Events Attended",
      value: user?.eventsAttended?.length || 0,
      color: "from-green-500 to-green-600",
      change: 8,
    },
    {
      icon: <FaTrophy />,
      label: "Achievements",
      value: user?.achievements?.length || 0,
      color: "from-yellow-500 to-yellow-600",
      change: 0,
    },
    {
      icon: <FaBell />,
      label: "Notifications",
      value: notifications.filter((n) => !n.read).length,
      color: "from-red-500 to-red-600",
      change: -25,
    },
  ];

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    return (
      activity.title.toLowerCase().includes(activityFilters.search.toLowerCase()) &&
      (activityFilters.type === "" || activity.type === activityFilters.type) &&
      (activityFilters.club === "" || activity.club.toLowerCase().includes(activityFilters.club.toLowerCase()))
    );
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <AnimatePresence>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-[Poppins]"
      >
        <Navbar />
        <motion.section
          style={shouldReduceMotion ? {} : { opacity: heroOpacity, scale: heroScale }}
          className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#456882]/90 to-blue-600/90"></div>
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644"
              alt="Campus Background"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/5"
                style={{
                  width: Math.random() * 150 + 50,
                  height: Math.random() * 150 + 50,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={shouldReduceMotion ? {} : { opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
              />
            ))}
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div variants={itemVariants} className="text-white">
              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-7xl font-bold mb-6"
              >
                Welcome Back,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  {user?.name?.split(" ")[0]}
                </span>
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-xl md:text-2xl mb-8 text-gray-200"
              >
                Continue your amazing journey at {user?.isACEMStudent ? "ACEM" : "your institution"}
              </motion.p>
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="px-8 py-4 bg-white text-[#456882] rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  onClick={() => navigate("/clubs")}
                  aria-label="Explore clubs"
                >
                  Explore Clubs
                  <FaArrowRight className="inline ml-2" />
                </motion.button>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="px-8 py-4 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-[#456882] transition-all"
                  onClick={() => navigate("/events")}
                  aria-label="View events"
                >
                  View Events
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={shouldReduceMotion ? {} : { y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <motion.div
                className="w-1 h-3 bg-white rounded-full mt-2"
                animate={shouldReduceMotion ? {} : { opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
          </motion.div>
        </motion.section>
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="py-12 -mt-20 relative z-10"
        >
          <div className="container mx-auto px-4">
            <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatsCard key={index} stat={stat} index={index} />
              ))}
            </motion.div>
          </div>
        </motion.section>
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="py-12 bg-white"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <UserProfileCard user={user} />
              </div>
              <motion.div variants={containerVariants} className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Recent Notifications</h3>
                    <span className="text-sm text-gray-500">
                      {notifications.filter((n) => !n.read).length} unread
                    </span>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notifications.slice(0, 3).map((notification) => (
                      <NotificationCard key={notification._id} notification={notification} />
                    ))}
                  </div>
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full mt-4 px-4 py-2 text-[#456882] hover:bg-[#456882]/10 rounded-lg transition text-sm font-medium"
                    aria-label="View all notifications"
                  >
                    View All Notifications
                  </motion.button>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Achievements</h3>
                  <div className="space-y-3">
                    {achievements.map((achievement) => (
                      <motion.div
                        key={achievement._id}
                        variants={itemVariants}
                        whileHover={cardVariants.hover}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg"
                      >
                        <div className="text-2xl">{achievement.icon || "🏆"}</div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{achievement.title}</p>
                          <p className="text-xs text-gray-600">{achievement.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Links</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: <FaUsers />, label: "My Clubs", color: "blue" },
                      { icon: <FaCalendarAlt />, label: "Events", color: "green" },
                      { icon: <FaTrophy />, label: "Hall of Fame", color: "yellow" },
                      { icon: <FaChartLine />, label: "Progress", color: "purple" },
                    ].map((link, index) => (
                      <motion.button
                        key={index}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className={`p-3 bg-${link.color}-50 text-${link.color}-600 rounded-lg hover:bg-${link.color}-100 transition text-center`}
                        aria-label={link.label}
                      >
                        <div className="text-xl mb-1">{link.icon}</div>
                        <div className="text-xs font-medium">{link.label}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="py-12 bg-gradient-to-br from-[#456882]/10 to-blue-50"
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Featured Events</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Don't miss out on these amazing upcoming events and activities
              </p>
            </motion.div>
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredActivities
                .filter((activity) => activity.featured)
                .map((activity) => (
                  <ActivityCard key={activity._id} activity={activity} />
                ))}
            </motion.div>
          </div>
        </motion.section>
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="py-12 bg-white"
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Discover Amazing Clubs</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Join vibrant communities and explore your interests with like-minded peers
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-64">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search clubs..."
                    className="w-full pl-10 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#456882] focus:ring-offset-2 text-gray-800 placeholder-gray-500"
                    onChange={(e) => setActivityFilters({ ...activityFilters, search: e.target.value })}
                    aria-label="Search clubs"
                  />
                </div>
                <select
                  className="px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#456882] focus:ring-offset-2 text-gray-800"
                  value={activityFilters.type}
                  onChange={(e) => setActivityFilters({ ...activityFilters, type: e.target.value })}
                  aria-label="Filter by category"
                >
                  <option value="">All Categories</option>
                  <option value="seminar">Seminar</option>
                  <option value="competition">Competition</option>
                  <option value="workshop">Workshop</option>
                  <option value="cultural">Cultural</option>
                  <option value="technical">Technical</option>
                  <option value="literary">Literary</option>
                  <option value="entrepreneurial">Entrepreneurial</option>
                </select>
              </div>
            </motion.div>
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {clubs.map((club) => (
                <ClubCard
                  key={club._id}
                  club={club}
                  user={user}
                  handleJoinClub={handleJoinClub}
                  joiningClub={joiningClub}
                />
              ))}
            </motion.div>
          </div>
        </motion.section>
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="py-12 bg-gradient-to-br from-[#456882]/10 to-blue-50"
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Upcoming Activities</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Stay updated with the latest events, workshops, and competitions
              </p>
            </motion.div>
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredActivities.map((activity) => (
                <ActivityCard key={activity._id} activity={activity} />
              ))}
            </motion.div>
            {filteredActivities.length === 0 && (
              <motion.div variants={itemVariants} className="text-center py-12">
                <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">No Activities Found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or check back later for new activities
                </p>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setActivityFilters({ search: "", type: "", club: "" })}
                  className="px-6 py-3 bg-[#456882] text-white rounded-full hover:bg-[#3a536b] transition"
                  aria-label="Clear filters"
                >
                  Clear Filters
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.section>
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="py-16 bg-gradient-to-r from-[#456882] to-blue-700 text-white"
        >
          <div className="container mx-auto px-4 text-center">
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-bold mb-6">Ready to Get More Involved?</h2>
              <p className="text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
                Join more clubs, attend exciting events, and build lasting connections with your peers
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="px-8 py-4 bg-white text-[#456882] rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  onClick={() => navigate("/clubs")}
                  aria-label="Explore all clubs"
                >
                  Explore All Clubs
                </motion.button>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="px-8 py-4 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-[#456882] transition-all"
                  onClick={() => navigate("/hall-of-fame")}
                  aria-label="View hall of fame"
                >
                  View Hall of Fame
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.section>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-6 right-6 bg-white border-l-4 border-[#456882] rounded-lg shadow-xl p-4 max-w-sm z-50"
            >
              <div className="flex items-start gap-3">
                <FaBell className="text-[#456882] text-lg mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Notification</p>
                  <p className="text-sm text-gray-600">{error}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setError("")}
                  aria-label="Close notification"
                >
                  ×
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserDashboard;
