
import React, { memo, useEffect, useState } from "react";
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
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

// Floating Bubble Component
const Bubble = ({ size, delay }) => {
  const randomXOffset = Math.random() * 100 - 50;

  return (
    <motion.div
      className="absolute rounded-full bg-mint opacity-50"
      style={{
        width: size,
        height: size,
        backgroundColor: '#CFFFE2',
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
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
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
            style={{ backgroundColor: '#456882' }}
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

// Memoized ClubCard Component
const ClubCard = memo(({ club, handleJoinClub, isPending }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
    whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
    className="relative flex flex-col items-center p-6 bg-gradient-to-br from-teal-200 to-teal-400 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
  >
    <div className="absolute inset-0 bg-white opacity-10 transform skew-y-6"></div>
    <motion.div
      className="p-4 rounded-full bg-white bg-opacity-20 text-white text-3xl mb-4 z-10"
      whileHover={{ scale: 1.1, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {club.icon === "FaCode" ? (
        <FaCode />
      ) : club.icon === "FaMusic" ? (
        <FaMusic />
      ) : club.icon === "FaBook" ? (
        <FaBook />
      ) : club.icon === "FaRunning" ? (
        <FaRunning />
      ) : club.icon === "FaHandsHelping" ? (
        <FaHandsHelping />
      ) : (
        <FaTrophy />
      )}
    </motion.div>
    <h3 className="text-lg font-semibold text-gray-900 z-10">{club.name}</h3>
    <p className="text-sm text-gray-700 mt-2 text-center z-10">{club.description}</p>
    <div className="mt-4 flex gap-2 justify-center z-10">
      <Link
        to={`/club/${club._id}`}
        className="text-teal-600 hover:text-teal-700 font-medium transition"
        style={{ color: '#456882' }}
        aria-label={`View details of ${club.name}`}
      >
        View Details
      </Link>
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
        style={{ backgroundColor: isPending ? '#d1d5db' : '#456882' }}
        aria-label={isPending ? `Pending request for ${club.name}` : `Join ${club.name}`}
      >
        {isPending ? 'Pending' : 'Join Club'}
      </motion.button>
    </div>
  </motion.div>
));

// Memoized ActivityCard Component
const ActivityCard = memo(({ activity }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
    whileHover={{ scale: 1.03, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
    className="p-6 bg-white rounded-xl shadow-md border border-gray-200 break-inside-avoid mb-6"
  >
    <div className="flex items-center gap-3 mb-3">
      <FaCalendarAlt className="text-teal-600 text-xl" style={{ color: '#456882' }} />
      <h4 className="text-lg font-semibold text-gray-900">{activity.title}</h4>
    </div>
    <p className="text-gray-600 text-sm mb-2">{activity.date}</p>
    <p className="text-gray-700 mb-3">{activity.description}</p>
    <p className="text-gray-500 text-sm">Organized by: {activity.club}</p>
  </motion.div>
));

// Memoized NotificationCard Component
const NotificationCard = memo(({ notification }) => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
    whileHover={{ scale: 1.02 }}
    className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center gap-3"
  >
    <FaBell className="text-teal-600 text-lg" style={{ color: '#456882' }} />
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
        style={{ backgroundColor: '#456882' }}
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
            style={{ backgroundColor: '#456882' }}
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
      <h3 className="text-lg font-bold text-teal-600 mb-4" style={{ color: '#456882' }}>
        Your Campus Involvement
      </h3>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <motion.div
            className="bg-teal-600 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ backgroundColor: '#456882' }}
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
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0.7]);
  const scale = useTransform(scrollY, [0, 200], [1, 0.95]);
  const bgY = useTransform(scrollY, [0, 200], [0, -50]);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
          axios.get("http://localhost:5000/api/notifications", config).catch(() => ({ data: [] })), // Fallback for notifications
        ]);

        setUser(userResponse.data);
        setClubs(clubsResponse.data);
        setActivities(activitiesResponse.data);
        setNotifications(notificationsResponse.data.slice(0, 5)); // Limit to 5 recent notifications
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError(err.response?.data?.error || "Failed to load data. Please try again.");
        }
      }
    };
    fetchData();
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

  const bubbles = Array.from({ length: 10 }, (_, i) => ({
    size: `${15 + Math.random() * 25}px`,
    delay: i * 0.5,
  }));

  // Mock featured event (replace with actual API data)
  const featuredEvent = {
    eventId: "1", // Added eventId for navigation
    title: "Annual Tech Fest 2025",
    date: "August 15, 2025",
    image: "https://images.unsplash.com/photo-1516321318429-4b6b5f3b7f9e",
    description: "Join us for a day of innovation and creativity!",
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-[Poppins]">
        <Navbar user={user} role="user" />

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
              <FaUsers className="text-6xl sm:text-8xl text-teal-600 mx-auto" style={{ color: '#456882' }} />
            </motion.div>
            <div className="min-h-[100px] flex items-center justify-center">
              <TypeAnimation
                sequence={[`Welcome, ${user?.name || 'User'}!`, 2000, 'Explore Your Campus Journey', 2000]}
                wrapper="h1"
                repeat={Infinity}
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-teal-600 mb-4"
                style={{ color: '#456882' }}
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
                style={{ backgroundColor: '#456882' }}
                aria-label="Discover Clubs"
              >
                Discover Clubs
              </Link>
              <Link
                to="/events"
                className="px-6 py-3 border border-teal-600 text-teal-600 rounded-full font-semibold hover:bg-teal-50 transition-all"
                style={{ borderColor: '#456882', color: '#456882' }}
                aria-label="Explore Events"
              >
                Explore Events
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* User Profile and Progress */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-2 sm:px-4 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
            <UserProfileCard user={user} />
            <ProgressTracker user={user} />
          </div>
        </section>

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
                    style={{ backgroundColor: '#456882' }}
                    aria-label="Learn More"
                    onClick={() => navigate(`/events/${featuredEvent.eventId}`)}
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
                style={{ color: '#456882' }}
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
              style={{ color: '#456882' }}
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
                  No clubs joined yet. Explore more!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-teal-600 text-white rounded-full transition-all"
                  style={{ backgroundColor: '#456882' }}
                  onClick={() => navigate('/clubs')}
                  aria-label="Explore More"
                >
                  Explore More
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
              style={{ color: '#456882' }}
            >
              Upcoming Activities
            </motion.h2>
            <div className="columns-1 sm:columns-2 md:columns-3 gap-6">
              {activities.map((activity, index) => (
                <ActivityCard key={index} activity={activity} />
              ))}
            </div>
            <div className="text-center mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-teal-600 text-white rounded-full transition-all"
                style={{ backgroundColor: '#456882' }}
                onClick={() => navigate('/events')}
                aria-label="Explore More Events"
              >
                Explore More
              </motion.button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-gradient-to-r from-teal-600 to-teal-800 text-white">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link to="/dashboard" className="hover:text-teal-200">Dashboard</Link></li>
                  <li><Link to="/profile" className="hover:text-teal-200">Profile</Link></li>
                  <li><Link to="/clubs" className="hover:text-teal-200">Clubs</Link></li>
                  <li><Link to="/events" className="hover:text-teal-200">Events</Link></li>
                  <li><Link to="/contact" className="hover:text-teal-200">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <motion.a whileHover={{ scale: 1.2, y: -2 }} href="https://facebook.com" className="text-2xl hover:text-teal-200">
                    <FaFacebook />
                  </motion.a>
                  <motion.a whileHover={{ scale: 1.2, y: -2 }} href="https://twitter.com" className="text-2xl hover:text-teal-200">
                    <FaTwitter />
                  </motion.a>
                  <motion.a whileHover={{ scale: 1.2, y: -2 }} href="https://instagram.com" className="text-2xl hover:text-teal-200">
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
                    className="px-6 py-2 bg-white text-teal-600 rounded-full hover:bg-teal-100"
                    style={{ color: '#456882' }}
                    aria-label="Subscribe"
                  >
                    Subscribe
                  </motion.button>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p>Developed By SkillShastra</p>
            </div>
          </div>
        </footer>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-4 right-4 bg-teal-600 text-white rounded-lg p-4 shadow-lg"
            style={{ backgroundColor: '#456882' }}
          >
            <p className="text-sm">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-2 text-white underline"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
            >
              Dismiss
            </motion.button>
          </motion.div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default UserDashboard;
