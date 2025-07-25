import React, { memo, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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

// Static mock data for features not supported by backend
const mockData = {
  notifications: [
    {
      _id: 1,
      message: "Your application to Drama Society has been approved!",
      date: "2025-07-25",
      type: "success",
      read: false,
      clubId: "64f5b1234567890abcdef125",
    },
    {
      _id: 2,
      message: "AI Workshop registration is now open",
      date: "2025-07-24",
      type: "info",
      read: false,
      eventId: 1,
    },
    {
      _id: 3,
      message: "Photography Competition deadline approaching",
      date: "2025-07-23",
      type: "warning",
      read: true,
      eventId: 2,
    },
  ],
  achievements: [
    {
      id: "achievement1",
      title: "Active Participant",
      description: "Attended 10+ events",
      icon: "🎯",
      earnedAt: "2025-03-15",
      category: "Participation",
    },
    {
      id: "achievement2",
      title: "Club Ambassador",
      description: "Member of 3+ clubs",
      icon: "🏆",
      earnedAt: "2025-05-01",
      category: "Leadership",
    },
  ],
  activityExtras: {
    1: {
      time: "10:00 AM - 4:00 PM",
      location: "Main Auditorium",
      type: "workshop",
      attendees: 85,
      maxCapacity: 100,
      registrationOpen: true,
      featured: true,
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
      tags: ["AI", "Technology", "Learning"],
      prerequisites: "Basic programming knowledge",
    },
    2: {
      time: "9:00 AM - 6:00 PM",
      location: "Campus Grounds",
      type: "competition",
      attendees: 45,
      maxCapacity: 50,
      registrationOpen: true,
      featured: false,
      image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d",
      tags: ["Photography", "Competition", "Art"],
      prizes: ["₹5000", "₹3000", "₹2000"],
    },
    3: {
      time: "7:00 PM - 9:00 PM",
      location: "College Theatre",
      type: "performance",
      attendees: 200,
      maxCapacity: 250,
      registrationOpen: false,
      featured: true,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      tags: ["Drama", "Performance", "Entertainment"],
    },
  },
  clubExtras: {
    "64f5b1234567890abcdef123": {
      icon: "FaCode",
      rating: 4.8,
      memberCount: 125,
      coordinators: ["John Doe", "Jane Smith"],
      headCoordinator: "Dr. Sarah Wilson",
      whatsappLink: "https://chat.whatsapp.com/sample",
      isActive: true,
      founded: "2019",
      achievements: ["Best Project Award 2023", "National Level Recognition"],
    },
    "64f5b1234567890abcdef124": {
      icon: "FaMusic",
      rating: 4.6,
      memberCount: 89,
      coordinators: ["Mike Johnson"],
      headCoordinator: "Prof. David Brown",
      whatsappLink: "https://chat.whatsapp.com/sample2",
      isActive: true,
      founded: "2018",
      achievements: ["Inter-college Photo Contest Winner"],
    },
    "64f5b1234567890abcdef125": {
      icon: "FaBook",
      rating: 4.7,
      memberCount: 67,
      coordinators: ["Emily Davis"],
      headCoordinator: "Dr. Lisa Anderson",
      whatsappLink: "https://chat.whatsapp.com/sample3",
      isActive: true,
      founded: "2020",
      achievements: ["Best Drama Performance 2024"],
    },
  },
};

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

// Navbar Component (from CreateClubPage)
// const Navbar = () => {
//   const navigate = useNavigate();
//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   return (
//     <nav className="bg-white shadow-md">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           <div className="flex items-center">
//             <Link to="/" className="text-2xl font-bold text-[#456882]">
//               ACEM
//             </Link>
//           </div>
//           <div className="flex items-center space-x-4">
//             <Link
//               to="/"
//               className="flex items-center text-[#456882] hover:bg-[#456882] hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
//             >
//               <FaHome className="mr-2" />
//               Home
//             </Link>
//             <Link
//               to="/clubs"
//               className="flex items-center text-[#456882] hover:bg-[#456882] hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
//             >
//               <FaUsers className="mr-2" />
//               Clubs
//             </Link>
//             <Link
//               to="/dashboard"
//               className="flex items-center text-[#456882] hover:bg-[#456882] hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
//             >
//               <FaUserCircle className="mr-2" />
//               Dashboard
//             </Link>
//             <button
//               onClick={handleLogout}
//               className="flex items-center text-[#456882] hover:bg-[#456882] hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
//             >
//               <FaSignOutAlt className="mr-2" />
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// Enhanced Loading Component
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

// Enhanced Stats Card Component
const StatsCard = memo(({ stat, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.05, y: -5 }}
    className={`bg-gradient-to-r ${stat.color} p-6 rounded-xl text-white shadow-lg hover:shadow-xl`}
  >
    <div className="flex items-center justify-between">
      <div>
        <motion.p
          className="text-3xl font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.2 }}
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

// Enhanced Club Card Component
const ClubCard = memo(({ club, user, handleJoinClub }) => {
  const isJoined = user?.clubs?.includes(club._id);
  const isPending = user?.pendingClubs?.includes(club._id);
  const clubExtras = mockData.clubExtras[club._id] || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)" }}
      className="relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Status Badge */}
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

      {/* Header with gradient background */}
      <div className="relative bg-gradient-to-r from-[#456882] to-blue-600 p-6 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <motion.div
            className="inline-flex p-3 rounded-full bg-white/20 text-3xl mb-4"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {club.icon ? (
              <img src={club.icon} alt={`${club.name} icon`} className="w-8 h-8 object-cover rounded-full" />
            ) : (
              iconMap[clubExtras.icon] || <FaTrophy />
            )}
          </motion.div>
          <h3 className="text-xl font-bold mb-2">{club.name}</h3>
          <div className="flex items-center gap-4 text-sm opacity-90">
            <div className="flex items-center gap-1">
              <FaStar />
              <span>{clubExtras.rating || "N/A"}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaUsers />
              <span>{clubExtras.memberCount || 0} members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 mb-4 line-clamp-2">{club.description}</p>

        {/* Club Details */}
        <div className="space-y-2 mb-4 text-sm text-gray-500">
          <div className="flex justify-between">
            <span>Category:</span>
            <span className="font-medium">{club.category}</span>
          </div>
          <div className="flex justify-between">
            <span>Founded:</span>
            <span className="font-medium">{clubExtras.founded || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span>Head Coordinator:</span>
            <span className="font-medium">{clubExtras.headCoordinator || club.headCoordinators[0] || "N/A"}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
            onClick={() => navigate(`/clubs/${club._id}`)}
          >
            <FaEye />
            View Details
          </button>

          {isJoined ? (
            <button
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg flex items-center justify-center gap-2"
              disabled
            >
              <FaCheckCircle />
              Joined
            </button>
          ) : (
            <motion.button
              onClick={() => handleJoinClub(club._id)}
              disabled={isPending}
              whileHover={{ scale: isPending ? 1 : 1.02 }}
              whileTap={{ scale: isPending ? 1 : 0.98 }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${isPending
                  ? "bg-yellow-400 text-white cursor-not-allowed"
                  : "bg-[#456882] text-white hover:bg-[#3a536b]"
                }`}
            >
              {isPending ? (
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
          )}
        </div>

        {/* Quick Actions */}
        {isJoined && (
          <div className="flex gap-2 mt-3 pt-3 border-t">
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
              title="WhatsApp Group"
              onClick={() => window.open(clubExtras.whatsappLink, "_blank")}
            >
              <FaWhatsapp />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
              title="Email Coordinator"
              onClick={() => window.location.href = `mailto:${club.contactEmail || clubExtras.headCoordinator}`}
            >
              <FaEnvelope />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
});

// Enhanced Activity Card Component
const ActivityCard = memo(({ activity }) => {
  const extras = mockData.activityExtras[activity.id] || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Featured Badge */}
      {extras.featured && (
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
            <FaFireAlt /> Featured
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={activity.images[0] || extras.image || "https://images.unsplash.com/photo-1523240795612-9a054b0db644"}
          alt={activity.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center gap-2 text-sm">
            <FaCalendarAlt />
            <span>{new Date(activity.date).toLocaleDateString()}</span>
            <FaClock />
            <span>{extras.time || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h4 className="text-lg font-bold text-gray-900 line-clamp-2">{activity.title}</h4>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${extras.type === "workshop"
                ? "bg-blue-100 text-blue-600"
                : extras.type === "competition"
                  ? "bg-green-100 text-green-600"
                  : "bg-purple-100 text-purple-600"
              }`}
          >
            {extras.type || "event"}
          </span>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{activity.description}</p>

        {/* Event Details */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <FaMapMarkerAlt />
            <span>{extras.location || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <FaUsers />
            <span>{extras.attendees || 0}/{extras.maxCapacity || "N/A"} registered</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <FaGraduationCap />
            <span>By {activity.club}</span>
          </div>
        </div>

        {/* Progress Bar */}
        {extras.attendees && extras.maxCapacity && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Registration</span>
              <span>{Math.round((extras.attendees / extras.maxCapacity) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-[#456882] h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(extras.attendees / extras.maxCapacity) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Tags */}
        {extras.tags && (
          <div className="flex flex-wrap gap-1 mb-4">
            {extras.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${extras.registrationOpen
                ? "bg-[#456882] text-white hover:bg-[#3a536b]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            disabled={!extras.registrationOpen}
          >
            {extras.registrationOpen ? "Register Now" : "Registration Closed"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="p-2 text-gray-500 hover:text-red-500 transition"
          >
            <FaHeart />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="p-2 text-gray-500 hover:text-blue-500 transition"
          >
            <FaShareAlt />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

// Enhanced User Profile Card


const UserProfileCard = ({ user }) => {
  const navigate = useNavigate();

  const getRoleBadge = () => {
    if (user?.isAdmin) return { text: "Super Admin", color: "bg-red-500", icon: <FaCrown /> };
    if (user?.isHeadCoordinator)
      return { text: "Head Coordinator", color: "bg-purple-500", icon: <FaShieldAlt /> };
    return { text: "Student", color: "bg-blue-500", icon: <FaGraduationCap /> };
  };

  const badge = getRoleBadge();

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-[#456882] to-blue-600 p-6 text-white relative">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold"
              whileHover={{ scale: 1.1 }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </motion.div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{user?.name || "User"}</h3>
              <p className="opacity-90">{user?.course}</p>
              <p className="opacity-90 text-sm">Semester {user?.semester || "N/A"} • {user?.batch || "N/A"}</p>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
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

        {/* Quick Actions */}
        <div className="mt-6 flex gap-3">
          <button
            className="flex-1 px-4 py-2 bg-[#456882] text-white rounded-lg hover:bg-[#3a536b] transition flex items-center justify-center gap-2"
            onClick={() => navigate("/profile")}
          >
            <FaEye />
            View Profile
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 border border-[#456882] text-[#456882] rounded-lg hover:bg-[#456882]/10 transition"
          >
            <FaExternalLinkAlt />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Notifications Component
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
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className={`p-4 border-l-4 rounded-lg shadow-sm ${getNotificationStyle(notification.type)}`}
    >
      <div className="flex items-start gap-3">
        <FaBell className="text-lg mt-1" style={{ color: theme.primary }} />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(notification.date).toLocaleDateString()}
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
  const [notifications, setNotifications] = useState(mockData.notifications);
  const [achievements, setAchievements] = useState(mockData.achievements);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activityFilters, setActivityFilters] = useState({
    search: "",
    type: "",
    club: "",
  });
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  // Fetch data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        // Fetch user data
        const userResponse = await axios.get("http://localhost:5000/api/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({
          ...userResponse.data,
          clubs: userResponse.data.clubName.map((name) =>
            clubs.find((club) => club.name === name)?._id
          ),
          eventsAttended: [], // Static, no backend support
          achievements: mockData.achievements.map((a) => a.id), // Static
          overallRank: 5, // Static
          attendanceRate: 92, // Static
          batch: "2021-2025", // Static
        });

        // Fetch clubs
        const clubsResponse = await axios.get("http://localhost:5000/api/clubs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClubs(clubsResponse.data);

        // Fetch activities
        const activitiesResponse = await axios.get("http://localhost:5000/api/activities", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActivities(
          activitiesResponse.data.map((activity, index) => ({
            ...activity,
            id: index + 1, // Assign ID for mapping to mockData.activityExtras
          }))
        );

        // Fetch pending membership requests
        const membershipResponse = await axios.get("http://localhost:5000/api/membership-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const pendingClubs = membershipResponse.data
          .filter((req) => req.status === "pending")
          .map((req) => clubs.find((club) => club.name === req.clubName)?._id)
          .filter(Boolean);
        setUser((prev) => ({ ...prev, pendingClubs }));
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleJoinClub = useCallback(
    async (clubId) => {
      try {
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
      }
    },
    []
  );

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
    const extras = mockData.activityExtras[activity.id] || {};
    return (
      activity.title.toLowerCase().includes(activityFilters.search.toLowerCase()) &&
      (activityFilters.type === "" || extras.type === activityFilters.type) &&
      (activityFilters.club === "" || activity.club.toLowerCase().includes(activityFilters.club.toLowerCase()))
    );
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-[Poppins]">
      <Navbar />
      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#456882]/90 to-blue-600/90"></div>
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644"
            alt="Campus Background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: Math.random() * 200 + 50,
                height: Math.random() * 200 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-white"
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Welcome Back,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                {user?.name?.split(" ")[0]}
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl mb-8 text-gray-200"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Continue your amazing journey at ACEM
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-[#456882] rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate("/clubs")}
              >
                Explore Clubs
                <FaArrowRight className="inline ml-2" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-[#456882] transition-all"
              >
                View Events
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-white rounded-full mt-2"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Quick Stats */}
      <section className="py-12 -mt-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatsCard key={index} stat={stat} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* User Profile and Quick Actions */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <UserProfileCard user={user} />
            </div>

            {/* Quick Actions Panel */}
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              {/* Notifications */}
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
                <button className="w-full mt-4 px-4 py-2 text-[#456882] hover:bg-[#456882]/10 rounded-lg transition text-sm font-medium">
                  View All Notifications
                </button>
              </div>

              {/* Achievement Showcase */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Achievements</h3>
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg"
                    >
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{achievement.title}</p>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
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
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-3 bg-${link.color}-50 text-${link.color}-600 rounded-lg hover:bg-${link.color}-100 transition text-center`}
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
      </section>

      {/* Featured Events */}
      <section className="py-12 bg-gradient-to-br from-[#456882]/10 to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Featured Events</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't miss out on these amazing upcoming events and activities
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActivities
              .filter((activity) => mockData.activityExtras[activity.id]?.featured)
              .map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
          </div>
        </div>
      </section>

      {/* Available Clubs */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Discover Amazing Clubs</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join vibrant communities and explore your interests with like-minded peers
            </p>
          </motion.div>

          {/* Filter Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-64">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search clubs..."
                  className="w-full pl-10 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#456882] focus:ring-offset-2 text-gray-800 placeholder-gray-500"
                  value={activityFilters.search}
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
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Literary">Literary</option>
                <option value="Entrepreneurial">Entrepreneurial</option>
              </select>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clubs.map((club) => (
              <ClubCard key={club._id} club={club} user={user} handleJoinClub={handleJoinClub} />
            ))}
          </div>
        </div>
      </section>

      {/* All Activities */}
      <section className="py-12 bg-gradient-to-br from-[#456882]/10 to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Upcoming Activities</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest events, workshops, and competitions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>

          {filteredActivities.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-600 mb-2">No Activities Found</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your filters or check back later for new activities
              </p>
              <button
                onClick={() => setActivityFilters({ search: "", type: "", club: "" })}
                className="px-6 py-3 bg-[#456882] text-white rounded-full hover:bg-[#3a536b] transition"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-[#456882] to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
            <h2 className="text-4xl font-bold mb-6">Ready to Get More Involved?</h2>
            <p className="text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
              Join more clubs, attend exciting events, and build lasting connections with your peers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-[#456882] rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate("/clubs")}
              >
                Explore All Clubs
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-[#456882] transition-all"
              >
                View Hall of Fame
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Error/Success Toast */}
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
              >
                ×
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDashboard;
