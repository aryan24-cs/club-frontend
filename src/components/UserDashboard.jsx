
import React, { memo, useEffect, useState, useCallback } from "react";

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import {
  FaCode,
  FaMusic,
  FaBook,
  FaRunning,
  FaHandsHelping,
  FaTrophy,
  FaFacebook,
  FaTwitter,
  FaInstagram,
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
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

// Theme object for consistent styling
const theme = {
  primary: '#456882',
  secondary: '#CFFFE2',
  accent: '#d1d5db',
};

// Click Bubble Effect Component
const ClickBubble = ({ x, y, id }) => {
  return (
    <motion.div
      key={id}
      className="fixed pointer-events-none z-50"
      style={{ left: x - 15, top: y - 15 }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: [0, 1.5, 0], opacity: [1, 0.8, 0] }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-r from-teal-400 to-teal-600 shadow-lg" />
    </motion.div>
  );
};

// Floating Bubble Component
const Bubble = ({ size, delay }) => {
  const randomXOffset = Math.random() * 100 - 50;

  return (
    <motion.div
      className="absolute rounded-full bg-mint opacity-50"
      style={{
        width: size,
        height: size,
        backgroundColor: theme.secondary,
        willChange: 'transform, opacity',
      }}
      initial={{ x: `${randomXOffset}vw`, y: '100vh', opacity: 0.5 }}
      animate={{
        x: [`${randomXOffset}vw`, `${randomXOffset + (Math.random() * 20 - 10)}vw`],
        y: '-10vh',
        opacity: [0.5, 0.7, 0],
      }}
      transition={{
        duration: 8 + Math.random() * 4,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeOut',
        delay: delay,
      }}
      whileHover={{ scale: 1.3, opacity: 0.8 }}
    />
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8 text-teal-600">
          <h2 className="text-2xl font-bold">Something went wrong.</h2>
          <p>Please try refreshing the page or contact support.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-full"
            style={{ backgroundColor: theme.primary }}
            onClick={() => window.location.reload()}
          >
            Retry
          </motion.button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Quick Stats Component
const QuickStats = ({ user, clubs, activities }) => {
  const stats = [
    {
      icon: <FaUsers />,
      label: "Clubs Joined",
      value: user?.clubs?.length || 0,
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <FaCalendarAlt />,
      label: "Events Attended",
      value: user?.eventsAttended?.length || 0,
      color: "from-green-500 to-green-600"
    },
    {
      icon: <FaTrophy />,
      label: "Achievements",
      value: user?.achievements?.length || 0,
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: <FaBell />,
      label: "Pending Requests",
      value: user?.pendingClubs?.length || 0,
      color: "from-red-500 to-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className={`bg-gradient-to-r ${stat.color} p-4 rounded-xl text-white shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-90">{stat.label}</p>
            </div>
            <div className="text-2xl opacity-80">{stat.icon}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Icon mapping for ClubCard
const iconMap = {
  FaCode: <FaCode />,
  FaMusic: <FaMusic />,
  FaBook: <FaBook />,
  FaRunning: <FaRunning />,
  FaHandsHelping: <FaHandsHelping />,
  FaTrophy: <FaTrophy />
};

// Enhanced Club Card Component
const ClubCard = memo(({ club, handleJoinClub, isPending, isJoined }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
    whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
    className="relative flex flex-col items-center p-6 bg-gradient-to-br from-teal-200 to-teal-400 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
  >
    <div className="absolute inset-0 bg-white opacity-10 transform skew-y-6"></div>
    
    {/* Club Rating */}
    <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
      <FaStar className="text-yellow-400 text-sm" />
      <span className="text-white text-sm font-semibold">{club.rating || '4.5'}</span>
    </div>

    <motion.div
      className="p-4 rounded-full bg-white bg-opacity-20 text-white text-3xl mb-4 z-10"
      whileHover={{ scale: 1.1, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {iconMap[club.icon] || <FaTrophy />}
    </motion.div>
    
    <h3 className="text-lg font-semibold text-gray-900 z-10">{club.name}</h3>
    <p className="text-sm text-gray-700 mt-2 text-center z-10">{club.description}</p>
    
    {/* Member Count */}
    <div className="flex items-center gap-1 mt-2 text-gray-700 z-10">
      <FaUserFriends className="text-sm" />
      <span className="text-sm">{club.memberCount || '50+'} members</span>
    </div>

    <div className="mt-4 flex gap-2 justify-center z-10">
      <Link
        to={`/club/${club._id}`}
        className="text-teal-600 hover:text-teal-700 font-medium transition"
        style={{ color: theme.primary }}
        aria-label={`View details of ${club.name}`}
      >
        View Details
      </Link>
      
      {isJoined ? (
        <span className="px-4 py-1 bg-green-500 text-white rounded-full font-semibold">
          Joined
        </span>
      ) : (
        <motion.button
          onClick={() => handleJoinClub(club._id)}
          disabled={isPending}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-1 rounded-full font-semibold transition ${
            isPending
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
          style={{ backgroundColor: isPending ? theme.accent : theme.primary }}
          aria-label={isPending ? `Pending request for ${club.name}` : `Join ${club.name}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && !isPending && handleJoinClub(club._id)}
        >
          {isPending ? 'Pending' : 'Join Club'}
        </motion.button>
      )}
    </div>
  </motion.div>
));

// Enhanced Activity Card Component
const ActivityCard = memo(({ activity }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
    whileHover={{ scale: 1.03, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
    className="p-6 bg-white rounded-xl shadow-md border border-gray-200 break-inside-avoid mb-6 relative overflow-hidden"
  >
    {/* Activity Type Badge */}
    <div className="absolute top-4 right-4">
      <span className="px-2 py-1 bg-teal-100 text-teal-600 rounded-full text-xs font-semibold">
        {activity.type || 'Event'}
      </span>
    </div>

    <div className="flex items-center gap-3 mb-3">
      <FaCalendarAlt className="text-teal-600 text-xl" style={{ color: theme.primary }} />
      <h4 className="text-lg font-semibold text-gray-900">{activity.title}</h4>
    </div>
    
    <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
      <div className="flex items-center gap-1">
        <FaClock />
        <span>{activity.date}</span>
      </div>
      {activity.location && (
        <div className="flex items-center gap-1">
          <FaMapMarkerAlt />
          <span>{activity.location}</span>
        </div>
      )}
    </div>
    
    <p className="text-gray-700 mb-3">{activity.description}</p>
    <p className="text-gray-500 text-sm mb-4">Organized by: {activity.club}</p>
    
    {/* Action Buttons */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
          aria-label="Like activity"
          role="button"
          tabIndex={0}
        >
          <FaHeart />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
          aria-label="Share activity"
          role="button"
          tabIndex={0}
        >
          <FaShareAlt />
        </motion.button>
      </div>
      
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <FaUsers />
        <span>{activity.attendees || '25'} interested</span>
      </div>
    </div>
  </motion.div>
));

// No Activities Component (Chrome-style error page)
const NoActivitiesFound = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="text-center py-16"
  >
    <div className="relative max-w-md mx-auto">
      <svg
        className="mx-auto mb-8 w-64 h-64 text-gray-300"
        fill="none"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 250 L100 200 L150 220 L200 180 L250 200 L300 160 L350 180 L400 150 L400 300 L50 300 Z"
          fill="currentColor"
          opacity="0.3"
        />
        <path
          d="M0 280 L80 240 L140 260 L200 220 L280 240 L350 200 L400 220 L400 300 L0 300 Z"
          fill="currentColor"
          opacity="0.2"
        />
        <circle cx="320" cy="80" r="30" fill="currentColor" opacity="0.4" />
        <ellipse cx="100" cy="100" rx="40" ry="20" fill="white" opacity="0.8" />
        <ellipse cx="280" cy="120" rx="50" ry="25" fill="white" opacity="0.6" />
        <rect x="160" y="180" width="80" height="80" rx="8" fill="currentColor" opacity="0.4" />
        <rect x="170" y="190" width="60" height="60" rx="4" fill="white" />
        <line x1="180" y1="200" x2="220" y2="200" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        <line x1="180" y1="210" x2="220" y2="210" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        <line x1="180" y1="220" x2="200" y2="220" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      </svg>
      
      <h3 className="text-2xl font-bold text-gray-800 mb-4">No Upcoming Activities</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        There are currently no upcoming activities scheduled. Check back later or explore clubs to stay updated!
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition-all"
          style={{ backgroundColor: theme.primary }}
          onClick={() => window.location.reload()}
          aria-label="Refresh page"
          role="button"
          tabIndex={0}
        >
          Refresh Page
        </motion.button>
        <Link
          to="/clubs"
          className="px-6 py-3 border border-teal-600 text-teal-600 rounded-full font-semibold hover:bg-teal-50 transition-all text-center"
          style={{ borderColor: theme.primary, color: theme.primary }}
          aria-label="Explore clubs"
        >
          Explore Clubs
        </Link>
      </div>
    </div>
  </motion.div>
);

// Activity Filter Component
const ActivityFilters = ({ filters, setFilters, clubs }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-4 rounded-xl shadow-md mb-6"
  >
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search activities..."
          className="pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          aria-label="Search activities"
        />
      </div>
      
      <select
        className="px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400"
        value={filters.type}
        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        aria-label="Filter by activity type"
      >
        <option value="">All Types</option>
        <option value="workshop">Workshop</option>
        <option value="seminar">Seminar</option>
        <option value="competition">Competition</option>
        <option value="social">Social Event</option>
      </select>
      
      <select
        className="px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400"
        value={filters.club}
        onChange={(e) => setFilters({ ...filters, club: e.target.value })}
        aria-label="Filter by club"
      >
        <option value="">All Clubs</option>
        {clubs.map((club) => (
          <option key={club._id} value={club.name.toLowerCase()}>
            {club.name}
          </option>
        ))}
      </select>
    </div>
  </motion.div>
);

// Memoized Notification Card Component
const NotificationCard = memo(({ notification }) => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
    whileHover={{ scale: 1.02 }}
    className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center gap-3"
  >
    <FaBell className="text-teal-600 text-lg" style={{ color: theme.primary }} />
    <div>
      <p className="text-gray-800 text-sm">{notification.message}</p>
      <p className="text-gray-500 text-xs">{notification.date}</p>
    </div>
  </motion.div>
));

// User Profile Card
const UserProfileCard = ({ user }) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8, ease: 'easeOut' }}
    whileHover={{ scale: 1.02, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
    className="relative bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8 overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-white opacity-50"></div>
    <div className="flex items-center gap-4 relative z-10">
      <motion.div
        className="h-16 w-16 rounded-full bg-teal-600 flex items-center justify-center text-white text-2xl"
        whileHover={{ scale: 1.1 }}
        style={{ backgroundColor: theme.primary }}
      >
        {user?.name?.charAt(0).toUpperCase() || 'U'}
      </motion.div>
      <div>
        <h3 className="text-xl font-bold text-gray-900">{user?.name || 'User'}</h3>
        <p className="text-gray-600">{user?.course || 'Course'} - Semester {user?.semester || 'N/A'}</p>
        <p className="text-gray-600">{user?.specialization || 'Specialization'}</p>
        {user?.pendingClubs?.length > 0 && (
          <motion.span
            className="inline-block mt-2 px-3 py-1 bg-teal-600 text-white rounded-full text-sm"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ backgroundColor: theme.primary }}
          >
            {user.pendingClubs.length} Pending Request{user.pendingClubs.length > 1 ? 's' : ''}
          </motion.span>
        )}
      </div>
    </div>
  </motion.div>
);

// Progress Tracker Component
const ProgressTracker = ({ user }) => {
  const clubsJoined = user?.clubs?.length || 0;
  const eventsAttended = user?.eventsAttended?.length || 0;
  const progress = Math.min((clubsJoined * 20 + eventsAttended * 10), 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 mb-8"
    >
      <h3 className="text-lg font-bold text-teal-600 mb-4" style={{ color: theme.primary }}>
        Your Campus Involvement
      </h3>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <motion.div
            className="bg-teal-600 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ backgroundColor: theme.primary }}
          />
        </div>
        <span className="text-sm font-semibold">{progress}%</span>
      </div>
      <p className="text-gray-600 text-sm">
        Clubs Joined: {clubsJoined} | Events Attended: {eventsAttended}
      </p>
    </motion.div>
  );
};

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [clickBubbles, setClickBubbles] = useState([]);
  const [activityFilters, setActivityFilters] = useState({
    search: '',
    type: '',
    club: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0.7]);
  const scale = useTransform(scrollY, [0, 200], [1, 0.95]);
  const bgY = useTransform(scrollY, [0, 200], [0, -50]);

  // Handle click bubble effect
  const handleClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newBubble = {
      id: Date.now() + Math.random(),
      x,
      y
    };
    
    setClickBubbles(prev => [...prev, newBubble]);
    
    setTimeout(() => {
      setClickBubbles(prev => prev.filter(bubble => bubble.id !== newBubble.id));
    }, 600);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [userResponse, clubsResponse, activitiesResponse, notificationsResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/user", config),
          axios.get("http://localhost:5000/api/clubs", config),
          axios.get("http://localhost:5000/api/activities", config),
          axios.get("http://localhost:5000/api/notifications", config).catch(() => ({ data: [] })),
        ]);

        if (isMounted) {
          setUser(userResponse.data);
          setClubs(clubsResponse.data);
          setActivities(activitiesResponse.data);
          setNotifications(notificationsResponse.data.slice(0, 5));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (isMounted) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            localStorage.removeItem("token");
            navigate("/login");
          } else {
            setError(err.response?.data?.error || "Failed to load data. Please try again.");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleJoinClub = async (clubId) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        `http://localhost:5000/api/clubs/${clubId}/join`,
        {},
        config
      );
      setError(response.data.message);
      setUser((prevUser) => ({
        ...prevUser,
        pendingClubs: [...(prevUser.pendingClubs || []), clubId],
      }));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send membership request.");
    }
  };

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    return (
      activity.title.toLowerCase().includes(activityFilters.search.toLowerCase()) &&
      (activityFilters.type === '' || activity.type === activityFilters.type) &&
      (activityFilters.club === '' || activity.club.toLowerCase().includes(activityFilters.club.toLowerCase()))
    );
  });

  const bubbles = Array.from({ length: 10 }, (_, i) => ({
    size: `${15 + Math.random() * 25}px`,
    delay: i * 0.5,
  }));

  const featuredEvent = {
    eventId: "1",
    title: "Annual Tech Fest 2025",
    date: "August 15, 2025",
    image: "https://images.unsplash.com/photo-1516321318429-4b6b5f3b7f9e",
    description: "Join us for a day of innovation and creativity!",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full"
          style={{ borderColor: theme.primary }}
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-[Poppins]" onClick={handleClick}>
        <Navbar user={user} role="user" />

        {/* Click Bubble Effects */}
        <AnimatePresence>
          {clickBubbles.map(bubble => (
            <ClickBubble key={bubble.id} x={bubble.x} y={bubble.y} id={bubble.id} />
          ))}
        </AnimatePresence>

        {/* Hero Section */}
        <motion.section
          style={{ opacity, scale }}
          className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-teal-50 to-gray-50 pt-20 relative overflow-hidden"
        >
          <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
            <img
              src="https://images.unsplash.com/photo-1516321497487-e288fb19713f"
              alt="Campus Event Background"
              className="w-full h-full object-cover opacity-20"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-600/30 to-transparent"></div>
          </motion.div>
          {bubbles.map((bubble, index) => (
            <Bubble key={index} size={bubble.size} delay={bubble.delay} />
          ))}
          <div className="container mx-auto px-2 sm:px-4 text-center relative z-10">
            <motion.div
              className="mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <FaUsers className="text-6xl sm:text-8xl text-teal-600 mx-auto" style={{ color: theme.primary }} />
            </motion.div>
            <div className="min-h-[100px] flex items-center justify-center">
              <TypeAnimation
                sequence={[`Welcome, ${user?.name || 'User'}!`, 2000, 'Explore Your Campus Journey', 2000]}
                wrapper="h1"
                repeat={Infinity}
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-teal-600 mb-4"
                style={{ color: theme.primary }}
              />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-base sm:text-lg md:text-xl mb-6 text-gray-800"
            >
              Discover vibrant communities and exciting events at ACEM.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              whileHover={{ scale: 1.05 }}
              className="flex justify-center gap-4"
            >
              <Link
                to="/clubs"
                className="px-6 py-3 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition-all"
                style={{ backgroundColor: theme.primary }}
                aria-label="Discover Clubs"
              >
                Discover Clubs
              </Link>
              <Link
                to="/events"
                className="px-6 py-3 border border-teal-600 text-teal-600 rounded-full font-semibold hover:bg-teal-50 transition-all"
                style={{ borderColor: theme.primary, color: theme.primary }}
                aria-label="Explore Events"
              >
                Explore Events
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Quick Stats Section */}
        {user && (
          <section className="py-8 bg-white">
            <div className="container mx-auto px-2 sm:px-4">
              <QuickStats user={user} clubs={clubs} activities={activities} />
            </div>
          </section>
        )}

        {/* User Profile and Progress */}
        {user && (
          <section className="py-12 bg-white">
            <div className="container mx-auto px-2 sm:px-4 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
              <UserProfileCard user={user} />
              <ProgressTracker user={user} />
            </div>
          </section>
        )}

        {/* Featured Event Banner */}
        <section className="py-12 bg-gradient-to-br from-teal-50 to-gray-50">
          <div className="container mx-auto px-2 sm:px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative rounded-xl overflow-hidden shadow-lg"
            >
              <img
                src={featuredEvent.image}
                alt={featuredEvent.title}
                className="w-full h-64 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{featuredEvent.title}</h3>
                  <p className="text-gray-200 text-sm">{featuredEvent.date}</p>
                  <p className="text-gray-200 mb-4">{featuredEvent.description}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700"
                    style={{ backgroundColor: theme.primary }}
                    aria-label="Learn More"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/events/${featuredEvent.eventId}`)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/events/${featuredEvent.eventId}`)}
                  >
                    Learn More
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Notifications Section */}
        {notifications.length > 0 && (
          <section className="py-12 bg-white">
            <div className="container mx-auto px-2 sm:px-4">
              <motion.h2
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-3xl font-bold text-center mb-8 text-teal-600"
                style={{ color: theme.primary }}
              >
                Recent Notifications
              </motion.h2>
              <div className="space-y-2 max-w-md mx-auto">
                {notifications.map((notification) => (
                  <NotificationCard key={notification._id} notification={notification} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Clubs Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-2 sm:px-4">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-bold text-center mb-8 text-teal-600"
              style={{ color: theme.primary }}
            >
              Available Clubs
            </motion.h2>
            {clubs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <img
                  src="https://images.unsplash.com/photo-1518341497361-4b6b5f3b7f9e"
                  alt="No Clubs Found"
                  className="mx-auto mb-6 rounded-lg shadow-lg max-w-xs"
                  loading="lazy"
                />
                <p className="text-gray-700 mb-4 text-lg">
                  No clubs available yet. Check back soon!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-teal-600 text-white rounded-full transition-all"
                  style={{ backgroundColor: theme.primary }}
                  onClick={() => window.location.reload()}
                  aria-label="Refresh Page"
                  role="button"
                  tabIndex={0}
                >
                  Refresh Page
                </motion.button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
                {clubs.map((club) => (
                  <ClubCard
                    key={club._id}
                    club={club}
                    handleJoinClub={handleJoinClub}
                    isPending={user?.pendingClubs?.includes(club._id)}
                    isJoined={user?.clubs?.includes(club._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Activities Section */}
        <section className="py-12 bg-gradient-to-br from-teal-50 to-gray-50">
          <div className="container mx-auto px-2 sm:px-4">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-bold text-center mb-8 text-teal-600"
              style={{ color: theme.primary }}
            >
              Upcoming Activities
            </motion.h2>
            
            {/* Activity Filters */}
            <ActivityFilters filters={activityFilters} setFilters={setActivityFilters} clubs={clubs} />
            
            {filteredActivities.length === 0 ? (
              <NoActivitiesFound />
            ) : (
              <>
                <div className="columns-1 sm:columns-2 md:columns-3 gap-6">
                  {filteredActivities.map((activity, index) => (
                    <ActivityCard key={index} activity={activity} />
                  ))}
                </div>
                <div className="text-center mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-teal-600 text-white rounded-full transition-all"
                    style={{ backgroundColor: theme.primary }}
                    onClick={() => navigate('/events')}
                    aria-label="Explore More Events"
                    role="button"
                    tabIndex={0}
                  >
                    Explore More
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-gradient-to-r from-teal-600 to-teal-800 text-white">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link to="/dashboard" className="hover:text-teal-200 transition-colors">Dashboard</Link></li>
                  <li><Link to="/profile" className="hover:text-teal-200 transition-colors">Profile</Link></li>
                  <li><Link to="/clubs" className="hover:text-teal-200 transition-colors">Clubs</Link></li>
                  <li><Link to="/events" className="hover:text-teal-200 transition-colors">Events</Link></li>
                  <li><Link to="/contact" className="hover:text-teal-200 transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <motion.a 
                    whileHover={{ scale: 1.2, y: -2 }} 
                    href="https://facebook.com" 
                    className="text-2xl hover:text-teal-200 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow on Facebook"
                  >
                    <FaFacebook />
                  </motion.a>
                  <motion.a 
                    whileHover={{ scale: 1.2, y: -2 }} 
                    href="https://twitter.com" 
                    className="text-2xl hover:text-teal-200 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow on Twitter"
                  >
                    <FaTwitter />
                  </motion.a>
                  <motion.a 
                    whileHover={{ scale: 1.2, y: -2 }} 
                    href="https://instagram.com" 
                    className="text-2xl hover:text-teal-200 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow on Instagram"
                  >
                    <FaInstagram />
                  </motion.a>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
                <div className="flex flex-col gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="px-4 py-2 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    aria-label="Email subscription"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-white text-teal-600 rounded-full hover:bg-teal-100 transition-colors"
                    style={{ color: theme.primary }}
                    aria-label="Subscribe"
                    role="button"
                    tabIndex={0}
                  >
                    Subscribe
                  </motion.button>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center border-t border-teal-500 pt-4">
              <p className="text-teal-200">© 2025 ACEM Club Management. Developed By SkillShastra</p>
            </div>
          </div>
        </footer>

        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-4 right-4 bg-white border border-teal-600 text-teal-600 rounded-lg p-4 shadow-lg max-w-sm z-50"
              style={{ borderColor: theme.primary, color: theme.primary }}
            >
              <div className="flex items-start gap-3">
                <FaBell className="text-lg mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Notification</p>
                  <p className="text-xs text-gray-600 mt-1">{error}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-gray-600 text-lg"
                  onClick={() => setError("")}
                  aria-label="Dismiss notification"
                  role="button"
                  tabIndex={0}
                >
                  ×
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default UserDashboard;