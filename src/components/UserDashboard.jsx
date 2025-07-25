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
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
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
        <div className="text-center p-8 text-red-600">
          <h2 className="text-2xl font-bold">Something went wrong.</h2>
          <p>Please try refreshing the page or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Memoized ClubCard component
const ClubCard = memo(({ club, handleJoinClub }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
    className="p-6 bg-white rounded-xl shadow-md text-center border border-gray-200"
  >
    <div className="p-4 rounded-full bg-red-100 text-red-600 text-3xl mb-4">
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
    </div>
    <h3 className="text-lg font-semibold text-gray-900">{club.name}</h3>
    <div className="mt-2 flex gap-2 justify-center">
      <Link
        to={`/club/${club._id}`}
        className="text-red-600 hover:text-red-700 font-medium transition"
      >
        View Details
      </Link>
      <button
        onClick={() => handleJoinClub(club._id)}
        className="px-4 py-1 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition"
      >
        Join Club
      </button>
    </div>
  </motion.div>
));

// Memoized ActivityCard component
const ActivityCard = memo(({ activity }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.03, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
    className="p-6 bg-white rounded-xl shadow-md border border-gray-200"
  >
    <div className="flex items-center gap-3 mb-3">
      <FaCalendarAlt className="text-red-600 text-xl" />
      <h4 className="text-lg font-semibold text-gray-900">{activity.title}</h4>
    </div>
    <p className="text-gray-600 text-sm mb-2">{activity.date}</p>
    <p className="text-gray-700 mb-3">{activity.description}</p>
    <p className="text-gray-500 text-sm">Organized by: {activity.club}</p>
  </motion.div>
));

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");
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

        // Fetch user data
        const userResponse = await axios.get(
          "http://localhost:5000/api/auth/user",
          config
        );
        setUser(userResponse.data);

        // Fetch clubs
        const clubsResponse = await axios.get(
          "http://localhost:5000/api/clubs",
          config
        );
        setClubs(clubsResponse.data);

        // Fetch activities
        const activitiesResponse = await axios.get(
          "http://localhost:5000/api/activities",
          config
        );
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
      setError(response.data.message); // Display success message
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to send membership request."
      );
    }
  };

  // Tagline rotation for hero section
  const taglines = [
    "Connect with Communities",
    "Engage in Exciting Events",
    "Grow Your Skills",
  ];
  const [currentTagline, setCurrentTagline] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % taglines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <style>
          {`
            @keyframes gradientShift {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            .hero-bg {
              background: linear-gradient(45deg, #FEE2E2, #FFFFFF, #E5E7EB, #FEE2E2);
              background-size: 200% 200%;
              animation: gradientShift 15s ease infinite;
            }
          `}
        </style>

        {/* Navbar */}
        <Navbar user={user} />

        {/* Hero Section */}
        <section className="pt-24 pb-16 hero-bg relative overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-70" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6"
            >
              Welcome to ACEM,{" "}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="text-red-600"
              >
                {user?.name || "User"}
              </motion.span>
              !
            </motion.h1>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentTagline}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-8"
              >
                {taglines[currentTagline]}
              </motion.p>
            </AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{
                scale: 1.1,
                boxShadow: "0 12px 24px rgba(220,20,60,0.1)",
                transition: { duration: 0.3 },
              }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 w-fit m-auto rounded-full"
            >
              <Link
                to="/clubs"
                className="inline-block px-10 py-4 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-all duration-300 shadow-lg"
              >
                Discover Clubs
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Error Display */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-600 text-center text-sm mt-4"
          >
            {error}
          </motion.p>
        )}

        {/* Available Clubs Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-bold text-gray-900 mb-8 text-center"
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
                />
                <p className="text-gray-700 mb-4 text-lg">
                  No clubs joined, explore more!
                </p>
                <motion.div
                  whileHover={{
                    scale: 1.1,
                    boxShadow: "0 10px 20px rgba(220,20,60,0.2)",
                    backgroundColor: "#B91C1C",
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-fit m-auto rounded-full"
                >
                  <Link
                    to="/clubs"
                    className="inline-block px-6 py-3 bg-red-600 text-white rounded-full font-semibold transition-all duration-300"
                  >
                    Explore More
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubs.map((club) => (
                  <ClubCard
                    key={club._id}
                    club={club}
                    handleJoinClub={handleJoinClub}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Upcoming Activities Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-bold text-gray-900 mb-8 text-center"
            >
              Upcoming Activities
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {activities.map((activity) => (
                <ActivityCard key={activity._id} activity={activity} />
              ))}
            </div>
            <div className="text-center">
              <motion.div
                whileHover={{
                  scale: 1.1,
                  boxShadow: "0 10px 20px rgba(220,20,60,0.2)",
                  backgroundColor: "#B91C1C",
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-fit m-auto rounded-full"
              >
                <Link
                  to="/events"
                  className="inline-block px-8 py-3 bg-red-600 text-white rounded-full font-semibold transition-all duration-300"
                >
                  Explore More
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-gray-800 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/dashboard" className="hover:text-red-200">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="hover:text-red-200">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/clubs" className="hover:text-red-200">
                      Clubs
                    </Link>
                  </li>
                  <li>
                    <Link to="/events" className="hover:text-red-200">
                      Events
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="hover:text-red-200">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <a href="#" className="text-2xl hover:text-red-200">
                    <FaFacebook />
                  </a>
                  <a href="#" className="text-2xl hover:text-red-200">
                    <FaTwitter />
                  </a>
                  <a href="#" className="text-2xl hover:text-red-200">
                    <FaInstagram />
                  </a>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Credits</h3>
                <p>Developed By SkillShastra</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default UserDashboard;
