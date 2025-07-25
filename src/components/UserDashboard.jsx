import React, { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  FaBars,
  FaTimes,
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

// Airplane Menu Component
const AirplaneMenu = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              duration: 0.5,
            }}
            className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 overflow-hidden"
          >
            <motion.div
              initial={{ x: -100, y: 20 }}
              animate={{ x: 250, y: 20 }}
              exit={{ x: -100, y: 20 }}
              transition={{
                duration: 1,
                ease: 'easeInOut',
                delay: 0.2,
              }}
              className="absolute top-4 text-2xl text-teal-600"
              style={{ color: '#456882' }}
            >
              ✈️
            </motion.div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-teal-600 transition-colors"
              style={{ color: '#456882' }}
            >
              <FaTimes />
            </button>
            <div className="pt-16 px-6">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-teal-600 mb-8"
                style={{ color: '#456882' }}
              >
                Navigation
              </motion.h2>
              <div className="space-y-4">
                <motion.a
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  href="/dashboard"
                  className="block py-3 px-4 text-lg text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                  style={{ color: '#456882' }}
                  onClick={onClose}
                >
                  Dashboard
                </motion.a>
                <motion.a
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  href="/profile"
                  className="block py-3 px-4 text-lg text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                  style={{ color: '#456882' }}
                  onClick={onClose}
                >
                  Profile
                </motion.a>
                <motion.a
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  href="/clubs"
                  className="block py-3 px-4 text-lg text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                  style={{ color: '#456882' }}
                  onClick={onClose}
                >
                  Clubs
                </motion.a>
                <motion.a
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  href="/events"
                  className="block py-3 px-4 text-lg text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                  style={{ color: '#456882' }}
                  onClick={onClose}
                >
                  Events
                </motion.a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
        </div>
      );
    }
    return this.props.children;
  }
}

// Memoized ClubCard component
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
      >
        View Details
      </Link>
      <button
        onClick={() => handleJoinClub(club._id)}
        disabled={isPending}
        className={`px-4 py-1 rounded-full font-semibold transition ${
          isPending
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
            : 'bg-teal-600 text-white hover:bg-teal-700'
        }`}
        style={{ backgroundColor: isPending ? '#d1d5db' : '#456882' }}
      >
        {isPending ? 'Pending' : 'Join Club'}
      </button>
    </div>
  </motion.div>
));

// Memoized ActivityCard component
const ActivityCard = memo(({ activity }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
    whileHover={{ scale: 1.03, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
    className="p-6 bg-white rounded-xl shadow-md border border-gray-200"
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

// User Profile Card
const UserProfileCard = ({ user }) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8, ease: 'easeOut' }}
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

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const [userResponse, clubsResponse, activitiesResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/user", config),
          axios.get("http://localhost:5000/api/clubs", config),
          axios.get("http://localhost:5000/api/activities", config),
        ]);

        setUser(userResponse.data);
        setClubs(clubsResponse.data);
        setActivities(activitiesResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError(
            err.response?.data?.error ||
              "Failed to load data. Please try again."
          );
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
      setError(
        err.response?.data?.error || "Failed to send membership request."
      );
    }
  };

  const bubbles = Array.from({ length: 8 }, (_, i) => ({
    size: `${15 + Math.random() * 25}px`,
    delay: i * 0.5,
  }));

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-[Poppins]">
        <AirplaneMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="fixed top-0 w-full bg-white shadow-md z-30"
        >
          <div className="container mx-auto px-2 sm:px-4 py-4 flex justify-between items-center">
            <motion.h1
              whileHover={{ scale: 1.05 }}
              className="text-3xl font-bold text-teal-600 cursor-pointer"
              style={{ color: '#456882' }}
            >
              ACEM
            </motion.h1>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="md:hidden text-2xl text-teal-600 relative z-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ color: '#456882' }}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <FaBars />
              </motion.div>
            </motion.button>
            <div className="hidden md:flex gap-4">
              <motion.a
                href="/profile"
                whileHover={{ scale: 1.05, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 text-teal-600 border border-teal-600 rounded-full hover:bg-teal-50 transition-all duration-300 font-medium"
                style={{ borderColor: '#456882', color: '#456882' }}
              >
                Profile
              </motion.a>
              <motion.a
                href="/clubs"
                whileHover={{ scale: 1.05, boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-all duration-300 font-medium"
                style={{ backgroundColor: '#456882' }}
              >
                Clubs
              </motion.a>
            </div>
          </div>
        </motion.header>

        <motion.section
          className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-teal-50 to-gray-50 pt-20 relative overflow-hidden"
        >
          {bubbles.map((bubble, index) => (
            <Bubble key={index} size={bubble.size} delay={bubble.delay} />
          ))}
          <div className="container mx-auto px-2 sm:px-4">
            <UserProfileCard user={user} />
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-4xl sm:text-5xl font-bold text-teal-600 mb-6 text-center"
              style={{ color: '#456882' }}
            >
              Welcome, {user?.name || 'User'}!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto mb-8 text-center"
            >
              Discover vibrant communities and exciting events at ACEM.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.05, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="w-fit m-auto rounded-full"
            >
              <Link
                to="/clubs"
                className="inline-block px-8 py-3 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition-all duration-300 shadow-lg"
                style={{ backgroundColor: '#456882' }}
              >
                Discover Clubs
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-teal-600 text-center text-sm mt-4"
            style={{ color: '#456882' }}
          >
            {error}
          </motion.p>
        )}

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
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <img
                  src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                  alt="No Clubs Joined"
                  className="mx-auto mb-4 rounded-lg shadow-md max-w-xs"
                  loading="lazy"
                />
                <p className="text-gray-700 mb-4 text-lg">
                  No clubs joined, explore more!
                </p>
                <motion.div
                  whileHover={{ scale: 1.1, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-fit m-auto rounded-full"
                >
                  <Link
                    to="/clubs"
                    className="inline-block px-6 py-3 bg-teal-600 text-white rounded-full font-semibold transition-all duration-300"
                    style={{ backgroundColor: '#456882' }}
                  >
                    Explore More
                  </Link>
                </motion.div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 mb-8">
              {activities.map((activity) => (
                <ActivityCard key={activity._id} activity={activity} />
              ))}
            </div>
            <div className="text-center">
              <motion.div
                whileHover={{ scale: 1.1, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-fit m-auto rounded-full"
              >
                <Link
                  to="/events"
                  className="inline-block px-8 py-3 bg-teal-600 text-white rounded-full font-semibold transition-all duration-300"
                  style={{ backgroundColor: '#456882' }}
                >
                  Explore More
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        <footer className="py-8 bg-gradient-to-r from-teal-600 to-teal-800 text-white">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/dashboard" className="hover:text-teal-200">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="hover:text-teal-200">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/clubs" className="hover:text-teal-200">
                      Clubs
                    </Link>
                  </li>
                  <li>
                    <Link to="/events" className="hover:text-teal-200">
                      Events
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="hover:text-teal-200">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <motion.a
                    whileHover={{ scale: 1.2, y: -2 }}
                    href="https://facebook.com"
                    className="text-2xl hover:text-teal-200 transition-colors"
                  >
                    <FaFacebook />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.2, y: -2 }}
                    href="https://twitter.com"
                    className="text-2xl hover:text-teal-200 transition-colors"
                  >
                    <FaTwitter />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.2, y: -2 }}
                    href="https://instagram.com"
                    className="text-2xl hover:text-teal-200 transition-colors"
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
                    className="px-4 py-2 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-white text-teal-600 rounded-full hover:bg-teal-100 transition-all font-semibold"
                    style={{ color: '#456882' }}
                  >
                  </motion.button>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p>Developed By SkillShastra</p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default UserDashboard;