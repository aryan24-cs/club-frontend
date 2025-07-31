import React, { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import {
  FaUser,
  FaSpinner,
  FaCode,
  FaMusic,
  FaBook,
  FaRunning,
  FaHandsHelping,
  FaTrophy,
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
        backgroundColor: "#CFFFE2",
        willChange: "transform, opacity",
      }}
      initial={{ x: `${randomXOffset}vw`, y: "100vh", opacity: 0.5 }}
      animate={{
        x: [
          `${randomXOffset}vw`,
          `${randomXOffset + (Math.random() * 20 - 10)}vw`,
        ],
        y: "-10vh",
        opacity: [0.5, 0.7, 0],
      }}
      transition={{
        duration: 8 + Math.random() * 4,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeOut",
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
        <div className="text-center p-8 text-[#456882]">
          <h2 className="text-2xl font-bold">Something went wrong.</h2>
          <p>Please try refreshing the page or contact support.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 px-6 py-2 bg-[#456882] text-white rounded-full"
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
const ClubCard = ({ club }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ type: "spring", stiffness: 100, damping: 15 }}
    whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
    className="relative flex flex-col items-center p-6 bg-gradient-to-br from-[#456882]/20 to-[#5a7a98]/20 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
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
    <span
      className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${
        club.type === "technical"
          ? "bg-teal-100 text-teal-600"
          : club.type === "cultural"
          ? "bg-yellow-100 text-yellow-600"
          : club.type === "literary"
          ? "bg-indigo-100 text-indigo-600"
          : club.type === "entrepreneurial"
          ? "bg-orange-100 text-orange-600"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {club.type
        ? club.type.charAt(0).toUpperCase() + club.type.slice(1)
        : "Club"}
    </span>
    <p className="text-sm text-gray-700 mt-2 text-center z-10">
      {club.description}
    </p>
    <p className="text-sm text-gray-700 mt-2 z-10">
      Members: {club.memberCount || 0}
    </p>
    <Link
      to={`/clubs/${club._id}/edit`}
      className="mt-2 text-[#456882] hover:text-[#334d5e] font-medium transition z-10"
      aria-label={`Edit ${club.name}`}
    >
      Edit Club
    </Link>
  </motion.div>
);

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0.7]);
  const scale = useTransform(scrollY, [0, 200], [1, 0.95]);
  const bgY = useTransform(scrollY, [0, 200], [0, -50]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [userResponse, clubsResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/user", config),
          axios.get("http://localhost:5000/api/clubs", config),
        ]);

        const userData = userResponse.data;
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

        const filteredClubs = clubsResponse.data
          .filter((club) =>
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
                memberCount: membersResponse.data.length,
                type: club.type || "club", // Ensure type is set
              };
            } catch (err) {
              return { ...club, memberCount: 0, type: club.type || "club" };
            }
          });
        const clubsWithMembers = await Promise.all(filteredClubs);
        setClubs(clubsWithMembers);
        console.log("AdminDashboard - Clubs:", clubsWithMembers);
      } catch (err) {
        console.error("Error fetching data:", {
          message: err.message,
          response: err.response?.data,
        });
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError(
            err.response?.data?.error ||
              "Failed to load data. Please try again."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const bubbles = Array.from({ length: 10 }, (_, i) => ({
    size: `${15 + Math.random() * 25}px`,
    delay: i * 0.5,
  }));

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-[Poppins]">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50"
          >
            <FaSpinner
              className="text-4xl text-[#456882] animate-spin"
            />
          </motion.div>
        )}
        <Navbar user={user} role="admin" />
        <motion.section
          style={{ opacity, scale }}
          className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-[#456882]/10 to-gray-50 pt-20 relative overflow-hidden"
        >
          <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
            <img
              src="https://images.unsplash.com/photo-1516321497487-e288fb19713f"
              alt="Campus Event Background"
              className="w-full h-full object-cover opacity-20"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#456882]/30 to-transparent"></div>
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
            >
              <FaUser
                className="text-6xl sm:text-8xl text-[#456882] mx-auto"
              />
            </motion.div>
            <div className="min-h-[100px] flex items-center justify-center">
              <TypeAnimation
                sequence={[
                  `Welcome, ${user?.name || "Admin"}!`,
                  2000,
                  "Manage Your Campus Clubs",
                  2000,
                ]}
                wrapper="h1"
                repeat={Infinity}
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#456882] mb-4"
              />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-base sm:text-lg md:text-xl mb-6 text-gray-800"
            >
              Oversee clubs, events, activities, and user management at ACEM.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link
                to="/admin/events"
                className="px-6 py-3 bg-[#456882] text-white rounded-full font-semibold hover:bg-[#334d5e] transition-all"
                aria-label="Manage Events"
              >
                Manage Events
              </Link>
              <Link
                to="/admin/activities"
                className="px-6 py-3 border border-[#456882] text-[#456882] rounded-full font-semibold hover:bg-[#456882]/10 transition-all"
                aria-label="Manage Activities"
              >
                Manage Activities
              </Link>
              <Link
                to="/admin/users"
                className="px-6 py-3 border border-[#456882] text-[#456882] rounded-full font-semibold hover:bg-[#456882]/10 transition-all"
                aria-label="Manage Users"
              >
                Manage Users
              </Link>
              <Link
                to="/manage-clubs"
                className="px-6 py-3 border border-[#456882] text-[#456882] rounded-full font-semibold hover:bg-[#456882]/10 transition-all"
                aria-label="Manage Clubs"
              >
                Manage Clubs
              </Link>
            </motion.div>
          </div>
        </motion.section>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-4 right-4 bg-[#456882] text-white rounded-lg p-4 shadow-lg"
          >
            <p className="text-sm">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-2 text-white underline"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              Dismiss
            </motion.button>
          </motion.div>
        )}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-2 sm:px-4">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-bold text-center mb-8 text-[#456882]"
            >
              Your Managed Clubs
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
                  You are not assigned to any clubs.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-[#456882] text-white rounded-full transition-all"
                  onClick={() => navigate("/manage-clubs")}
                  aria-label="Manage Clubs"
                >
                  Manage Clubs
                </motion.button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
                {clubs.map((club) => (
                  <ClubCard key={club._id} club={club} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
};

export default AdminDashboard;
