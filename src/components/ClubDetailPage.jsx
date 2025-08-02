import React, { useState, useEffect, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUsers,
  FaCalendar,
  FaEnvelope,
  FaSearch,
  FaCheckCircle,
  FaUserPlus,
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaMapPin,
  FaClock,
  FaAward,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaPaperPlane,
  FaCrown,
  FaUser,
  FaPhone,
  FaStar,
  FaIdCard,
  FaGraduationCap,
  FaSignOutAlt,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";

// Floating Particle Component
const FloatingParticle = ({ delay, duration }) => {
  return (
    <motion.div
      className="absolute w-2 h-2 bg-[#456882] rounded-full opacity-20"
      initial={{
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 20,
        opacity: 0,
      }}
      animate={{
        x: Math.random() * window.innerWidth,
        y: -20,
        opacity: [0, 0.6, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "linear",
      }}
    />
  );
};

// Animated Background Grid
const AnimatedGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-10">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#456882"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};

// Coordinator Card Component
const CoordinatorCard = ({ coordinator, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition-opacity"></div>
      <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
            <FaCrown className="w-3 h-3" />
            <span>COORDINATOR</span>
          </div>
        </div>
       
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-[#456882] to-[#5a7a95] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {coordinator.name.charAt(0).toUpperCase()}
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <FaStar className="text-white text-xs" />
            </motion.div>
          </div>
         
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[#456882] mb-1 truncate">
              {coordinator.name}
            </h3>
           
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <FaEnvelope className="w-4 h-4 text-[#456882]" />
                <span className="truncate">{coordinator.email}</span>
              </div>
             
              {coordinator.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <FaPhone className="w-4 h-4 text-[#456882]" />
                  <span>{coordinator.phone}</span>
                </div>
              )}
             
              {coordinator.rollNo && (
                <div className="flex items-center gap-2 text-gray-600">
                  <FaIdCard className="w-4 h-4 text-[#456882]" />
                  <span>Roll: {coordinator.rollNo}</span>
                </div>
              )}
             
              {coordinator.year && (
                <div className="flex items-center gap-2 text-gray-600">
                  <FaGraduationCap className="w-4 h-4 text-[#456882]" />
                  <span>Year: {coordinator.year}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ClubDetailPage = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [headCoordinators, setHeadCoordinators] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHeadCoordinator, setIsHeadCoordinator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("about");
  const [joinLoading, setJoinLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactSending, setContactSending] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [membersPage, setMembersPage] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);
  const itemsPerPage = 6;
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 500], [0, -50]);
  const smoothY = useSpring(bgY, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const fetchClubData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to view this page");
      }
      setLoading(true);
      setError("");
      // Fetch club details by ID
      const clubResponse = await axios.get(
        `http://localhost:5000/api/clubs/${clubId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const clubData = clubResponse.data;
      if (!clubData) {
        throw new Error("Club not found");
      }
      setClub(clubData);
      setHeadCoordinators(clubData.headCoordinators || []);
      // Fetch events
      const eventsResponse = await axios.get(
        `http://localhost:5000/api/events?club=${clubData._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEvents(eventsResponse.data);
      // Fetch members
      const membersResponse = await axios.get(
        `http://localhost:5000/api/clubs/${clubData._id}/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMembers(membersResponse.data);
      setFilteredMembers(membersResponse.data);
      // Fetch user data
      const userResponse = await axios.get(
        "http://localhost:5000/api/auth/user",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const isUserMember = userResponse.data.clubs.includes(clubData._id);
      setIsMember(isUserMember);
      setIsAdmin(userResponse.data.isAdmin);
      setIsHeadCoordinator(
        userResponse.data.isHeadCoordinator &&
          userResponse.data.headCoordinatorClubs.includes(clubData._id)
      );
      // Debug log to verify isMember state
      console.log("isMember:", isUserMember, "User clubs:", userResponse.data.clubs, "Club ID:", clubData._id);
      setLoading(false);
      setRetryCount(0);
    } catch (err) {
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          fetchClubData();
        }, 2000);
      } else {
        setError(
          err.response?.data?.error ||
            "Failed to load club details after multiple attempts"
        );
        setLoading(false);
      }
    }
  }, [clubId, retryCount]);

  useEffect(() => {
    fetchClubData();
  }, [fetchClubData]);

  useEffect(() => {
    const sortedMembers = [...members]
      .filter(
        (member) =>
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const isAPrivileged =
          (a.isAdmin ||
           (Array.isArray(club?.superAdmins) &&
             club.superAdmins.some(
               (admin) => admin._id.toString() === a._id.toString()
             )) ||
           (Array.isArray(a.headCoordinatorClubs) &&
             a.headCoordinatorClubs.includes(club?._id)));
        const isBPrivileged =
          (b.isAdmin ||
           (Array.isArray(club?.superAdmins) &&
             club.superAdmins.some(
               (admin) => admin._id.toString() === b._id.toString()
             )) ||
           (Array.isArray(b.headCoordinatorClubs) &&
             a.headCoordinatorClubs.includes(club?._id)));
        if (isAPrivileged && !isBPrivileged) return -1;
        if (!isAPrivileged && isBPrivileged) return 1;
        return a.name.localeCompare(b.name);
      });
    setFilteredMembers(sortedMembers);
    setMembersPage(1);
  }, [searchQuery, members, club]);

  const handleJoinClub = async () => {
    setJoinLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/clubs/${club._id}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Membership request sent successfully");
      await fetchClubData();
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to send membership request"
      );
    }
    setJoinLoading(false);
  };

  const handleLeaveClub = async () => {
    if (!window.confirm("Are you sure you want to leave this club?")) {
      return;
    }
    setLeaveLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/clubs/${club._id}/leave`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("You have successfully left the club");
      await fetchClubData();
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to leave the club"
      );
    }
    setLeaveLoading(false);
  };

  const handleRemoveMember = async (email) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `http://localhost:5000/api/clubs/${club._id}/members`,
          {
            headers: { Authorization: `Bearer ${token}` },
            data: { email },
          }
        );
        toast.success("Member removed successfully");
        await fetchClubData();
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to remove member");
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Event deleted successfully");
        await fetchClubData();
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to delete event");
      }
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    setContactSending(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/clubs/${club._id}/contact`,
        { message: contactMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Message sent successfully");
      setContactMessage("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send message");
    }
    setContactSending(false);
  };

  const tabs = [
    { id: "about", label: "About", icon: FaUsers },
    { id: "events", label: "Events", icon: FaCalendar },
    { id: "members", label: "Members", icon: FaUsers },
    { id: "contact", label: "Contact", icon: FaEnvelope },
  ];

  const paginatedMembers = filteredMembers.slice(
    (membersPage - 1) * itemsPerPage,
    membersPage * itemsPerPage
  );

  const paginatedEvents = events.slice(
    (eventsPage - 1) * itemsPerPage,
    eventsPage * itemsPerPage
  );

  const particles = Array.from({ length: 12 }, (_, i) => ({
    delay: i * 1.5,
    duration: 12 + Math.random() * 8,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Navbar />
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200"></div>
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md mx-auto text-center">
          <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fetchClubData()}
            className="px-6 py-3 bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white rounded-xl hover:shadow-lg transition-all"
          >
            Retry
          </motion.button>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#456882] mb-2">
            Club not found
          </h2>
          <Link
            to="/clubs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white rounded-xl hover:from-[#334d5e] hover:to-[#456882] transition-all"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Clubs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 font-sans">
      <Navbar />
      <Toaster position="top-right" />
      {particles.map((particle, index) => (
        <FloatingParticle key={index} {...particle} />
      ))}
      <motion.div
        style={{ y: smoothY }}
        className="absolute inset-0 overflow-hidden"
      >
        <AnimatedGrid />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 right-20 w-32 h-32 bg-[#456882] opacity-5 rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 left-20 w-24 h-24 bg-[#456882] opacity-5 rounded-full"
        />
      </motion.div>
      {/* Enhanced Header Section */}
      <div className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#456882] to-[#5a7a95]">
          <img
            src={
              club.banner ||
              "https://via.placeholder.com/1200x400?text=Club+Banner"
            }
            alt={`${club.name} banner`}
            className="w-full h-full object-cover opacity-30"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/1200x400?text=Club+Banner";
            }}
          />
        </div>
        <div className="absolute inset-0 bg-black/20"></div>
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute top-6 left-6 z-20"
        >
          <Link
            to="/clubs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-[#456882] rounded-full hover:bg-white/90 transition-all shadow-lg"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Clubs
          </Link>
        </motion.div>
        {(isAdmin || isHeadCoordinator) && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute top-6 right-6 flex gap-2 z-20"
          >
            <Link
              to={`/clubs/${club._id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-[#456882] rounded-full hover:bg-white/90 transition-all shadow-lg"
            >
              <FaEdit className="w-4 h-4" />
              Edit Club
            </Link>
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (
                    window.confirm("Are you sure you want to delete this club?")
                  ) {
                    axios
                      .delete(`http://localhost:5000/api/clubs/${club._id}`, {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem(
                            "token"
                          )}`,
                        },
                      })
                      .then(() => {
                        toast.success("Club deleted successfully");
                        navigate("/clubs");
                      })
                      .catch(() => toast.error("Failed to delete club"));
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/80 backdrop-blur-sm text-white rounded-full hover:bg-red-700/80 transition-all shadow-lg"
              >
                <FaTrash className="w-4 h-4" />
                Delete Club
              </motion.button>
            )}
          </motion.div>
        )}
        <div className="absolute bottom-8 left-6 right-6">
          <div className="flex items-end gap-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <img
                src={
                  club.icon ||
                  "https://via.placeholder.com/120x120?text=Club+Icon"
                }
                alt={`${club.name} icon`}
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-2xl"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/120x120?text=Club+Icon";
                }}
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <FaCheckCircle className="text-white text-xs" />
              </motion.div>
            </motion.div>
            <div className="flex-1">
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold text-white mb-2"
              >
                {club.name}
              </motion.h1>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center gap-6 text-white/90 flex-wrap"
              >
                <div className="flex items-center gap-2">
                  <FaUsers className="w-5 h-5" />
                  <span>{members.length} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendar className="w-5 h-5" />
                  <span>{events.length} events</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaAward className="w-5 h-5" />
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {club.category || "General"}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Highlighted Coordinators Section */}
        {headCoordinators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="relative overflow-hidden bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 rounded-3xl shadow-2xl border border-gradient-to-r from-yellow-200 to-orange-200 p-8">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
             
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full shadow-lg">
                  <FaCrown className="w-5 h-5" />
                  <span>CLUB COORDINATORS</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-yellow-300 to-transparent"></div>
              </div>
             
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {headCoordinators.map((coordinator, index) => (
                  <CoordinatorCard
                    key={coordinator._id}
                    coordinator={coordinator}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        {/* Membership Action Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {isMember ? (
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 25px rgba(220, 38, 38, 0.2)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLeaveClub}
              disabled={leaveLoading}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl hover:from-red-600 hover:to-red-800 transition-all shadow-lg disabled:opacity-50"
            >
              {leaveLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FaSignOutAlt className="w-5 h-5" />
              )}
              <span className="font-medium">
                {leaveLoading ? "Leaving Club..." : "Leave this Club"}
              </span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 25px rgba(69, 104, 130, 0.2)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoinClub}
              disabled={joinLoading}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white rounded-xl hover:from-[#334d5e] hover:to-[#456882] transition-all shadow-lg disabled:opacity-50"
            >
              {joinLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FaUserPlus className="w-5 h-5" />
              )}
              <span className="font-medium">
                {joinLoading ? "Sending Request..." : "Request to Join Club"}
              </span>
            </motion.button>
          )}
        </motion.div>
        {/* Enhanced Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-gradient-to-r from-gray-100/50 to-gray-200/50 backdrop-blur-sm p-1 rounded-2xl shadow-lg">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === "members") setMembersPage(1);
                    if (tab.id === "events") setEventsPage(1);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white shadow-lg"
                      : "text-gray-600 hover:text-[#456882] hover:bg-white/50"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
        <AnimatePresence mode="wait">
          {activeTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
            >
              <h2 className="text-3xl font-bold text-[#456882] mb-6 flex items-center gap-3">
                <FaUsers className="w-8 h-8" />
                About {club.name}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {club.description ||
                  "Discover amazing opportunities and connect with like-minded students in this vibrant community."}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg border border-blue-200/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-500 rounded-xl">
                        <FaUsers className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-blue-900">Total Members</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-600 mb-1">
                      {members.length}
                    </p>
                    <p className="text-blue-700 text-sm">Active community members</p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-lg border border-green-200/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-500 rounded-xl">
                        <FaCalendar className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-green-900">Events Hosted</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-600 mb-1">
                      {events.length}
                    </p>
                    <p className="text-green-700 text-sm">Amazing experiences organized</p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl shadow-lg border border-purple-200/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-500 rounded-xl">
                        <FaAward className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-purple-900">Category</h3>
                    </div>
                    <p className="text-xl font-bold text-purple-600 mb-1">
                      {club.category || "General"}
                    </p>
                    <p className="text-purple-700 text-sm">Club specialization</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
          {activeTab === "events" && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-[#456882] flex items-center gap-3">
                  <FaCalendar className="w-8 h-8" />
                  Club Events
                </h2>
                {(isAdmin || isHeadCoordinator) && (
                  <Link
                    to={`/clubs/${club._id}/events/new`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white rounded-xl hover:from-[#334d5e] hover:to-[#456882] transition-all shadow-lg"
                  >
                    <FaCalendar className="w-5 h-5" />
                    Create New Event
                  </Link>
                )}
              </div>
              {events.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative mb-6">
                    <FaCalendar className="w-20 h-20 text-gray-300 mx-auto" />
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-2 right-1/2 transform translate-x-1/2 w-4 h-4 bg-[#456882] rounded-full opacity-20"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-600 mb-3">
                    No events scheduled yet
                  </h3>
                  <p className="text-gray-500 text-lg">
                    Stay tuned for exciting upcoming events!
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedEvents.map((event, index) => (
                      <motion.div
                        key={event._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#456882] to-[#5a7a95] rounded-2xl blur-sm opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <div className="relative bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-bold text-[#456882] flex-1 leading-tight">
                              {event.title}
                            </h3>
                            {(isAdmin || isHeadCoordinator) && (
                              <div className="flex gap-2">
                                <Link
                                  to={`/clubs/${club._id}/events/${event._id}/edit`}
                                  className="p-2 text-gray-400 hover:text-[#456882] hover:bg-gray-100 rounded-full transition-all"
                                >
                                  <FaEdit className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => handleDeleteEvent(event._id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-3 text-gray-600">
                              <div className="p-1 bg-[#456882]/10 rounded-lg">
                                <FaClock className="w-4 h-4 text-[#456882]" />
                              </div>
                              <span className="text-sm font-medium">
                                {new Date(event.date).toLocaleDateString()} at{" "}
                                {event.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                              <div className="p-1 bg-[#456882]/10 rounded-lg">
                                <FaMapPin className="w-4 h-4 text-[#456882]" />
                              </div>
                              <span className="text-sm font-medium truncate">{event.location}</span>
                            </div>
                          </div>
                         
                          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                            {event.description}
                          </p>
                         
                          {isMember && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                axios
                                  .post(
                                    `http://localhost:5000/api/events/${event._id}/register`,
                                    {},
                                    {
                                      headers: {
                                        Authorization: `Bearer ${localStorage.getItem(
                                          "token"
                                        )}`,
                                      },
                                    }
                                  )
                                  .then(() =>
                                    toast.success(
                                      "Registered for event successfully"
                                    )
                                  )
                                  .catch((err) =>
                                    toast.error(
                                      err.response?.data?.error ||
                                        "Failed to register"
                                    )
                                  );
                              }}
                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white rounded-xl hover:from-[#334d5e] hover:to-[#456882] transition-all shadow-lg"
                            >
                              <FaUserPlus className="w-4 h-4" />
                              Register for Event
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                 
                  {/* Enhanced Pagination */}
                  <div className="flex items-center justify-between mt-8 px-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setEventsPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={eventsPage === 1}
                      className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-xl disabled:opacity-50 font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                      Previous
                    </motion.button>
                    <div className="flex items-center gap-2">
                      <span className="px-4 py-2 bg-[#456882]/10 text-[#456882] rounded-xl font-medium">
                        Page {eventsPage} of{" "}
                        {Math.ceil(events.length / itemsPerPage)}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setEventsPage((prev) =>
                          Math.min(
                            prev + 1,
                            Math.ceil(events.length / itemsPerPage)
                          )
                        )
                      }
                      disabled={
                        eventsPage === Math.ceil(events.length / itemsPerPage)
                      }
                      className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-xl disabled:opacity-50 font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                      Next
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          )}
          {activeTab === "members" && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <h2 className="text-3xl font-bold text-[#456882] flex items-center gap-3">
                  <FaUsers className="w-8 h-8" />
                  Club Members ({filteredMembers.length})
                </h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#456882] focus:border-transparent bg-gray-50/50 w-64 shadow-lg"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowMembers(!showMembers)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white rounded-xl hover:from-[#334d5e] hover:to-[#456882] transition-all shadow-lg"
                  >
                    {showMembers ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                    {showMembers ? "Hide Members" : "Show Members"}
                  </motion.button>
                </div>
              </div>
              <AnimatePresence>
                {showMembers && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {filteredMembers.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="relative mb-6">
                          <FaUsers className="w-20 h-20 text-gray-300 mx-auto" />
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute top-2 right-1/2 transform translate-x-1/2 w-4 h-4 bg-[#456882] rounded-full opacity-20"
                          />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-600 mb-3">
                          {searchQuery ? "No members found" : "No members yet"}
                        </h3>
                        <p className="text-gray-500 text-lg">
                          {searchQuery
                            ? "Try adjusting your search terms"
                            : "Be the first to join this amazing club!"}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {paginatedMembers.map((member, index) => {
                            const isPrivileged =
                              member.isAdmin ||
                              (Array.isArray(club?.superAdmins) &&
                                club.superAdmins.some(
                                  (admin) =>
                                    admin._id.toString() ===
                                    member._id.toString()
                                )) ||
                              (Array.isArray(member.headCoordinatorClubs) &&
                                member.headCoordinatorClubs.includes(club?._id));
                            return (
                              <motion.div
                                key={member.email}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                  duration: 0.3,
                                  delay: index * 0.05,
                                }}
                                className="relative group"
                              >
                                <div className={`absolute inset-0 rounded-2xl blur-sm opacity-20 transition-opacity ${
                                  isPrivileged
                                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 group-hover:opacity-30"
                                    : "bg-gradient-to-r from-[#456882] to-[#5a7a95] group-hover:opacity-20"
                                }`}></div>
                                <div className="relative bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                      <div className="relative">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                                          isPrivileged
                                            ? "bg-gradient-to-br from-yellow-500 to-orange-600"
                                            : "bg-gradient-to-br from-[#456882] to-[#5a7a95]"
                                        }`}>
                                          {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        {isPrivileged && (
                                          <motion.div
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg"
                                          >
                                            <FaCrown className="text-white text-xs" />
                                          </motion.div>
                                        )}
                                      </div>
                                     
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className="font-bold text-gray-800 truncate">
                                            {member.name}
                                          </p>
                                          {isPrivileged && (
                                            <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                                              {member.isAdmin
                                                ? "ADMIN"
                                                : Array.isArray(club?.superAdmins) &&
                                                  club.superAdmins.some(
                                                    (admin) =>
                                                      admin._id.toString() ===
                                                      member._id.toString()
                                                  )
                                                ? "SUPER ADMIN"
                                                : "HEAD COORD"}
                                            </span>
                                          )}
                                        </div>
                                       
                                        <div className="space-y-1">
                                          <p className="text-sm text-gray-500 flex items-center gap-2 truncate">
                                            <FaEnvelope className="w-3 h-3 text-[#456882]" />
                                            {member.email}
                                          </p>
                                          {member.rollNo && (
                                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                              <FaIdCard className="w-3 h-3 text-[#456882]" />
                                              Roll: {member.rollNo}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    {(isAdmin || isHeadCoordinator) && (
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() =>
                                          handleRemoveMember(member.email)
                                        }
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all ml-2"
                                        title={`Remove ${member.name}`}
                                      >
                                        <FaTimes className="w-4 h-4" />
                                      </motion.button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                       
                        {/* Enhanced Members Pagination */}
                        <div className="flex items-center justify-between mt-8 px-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              setMembersPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={membersPage === 1}
                            className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-xl disabled:opacity-50 font-medium shadow-lg hover:shadow-xl transition-all"
                          >
                            Previous
                          </motion.button>
                          <div className="flex items-center gap-2">
                            <span className="px-4 py-2 bg-[#456882]/10 text-[#456882] rounded-xl font-medium">
                              Page {membersPage} of{" "}
                              {Math.ceil(filteredMembers.length / itemsPerPage)}
                            </span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              setMembersPage((prev) =>
                                Math.min(
                                  prev + 1,
                                  Math.ceil(
                                    filteredMembers.length / itemsPerPage
                                  )
                                )
                              )
                            }
                            disabled={
                              membersPage ===
                              Math.ceil(filteredMembers.length / itemsPerPage)
                            }
                            className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-xl disabled:opacity-50 font-medium shadow-lg hover:shadow-xl transition-all"
                          >
                            Next
                          </motion.button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
          {activeTab === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
            >
              <h2 className="text-3xl font-bold text-[#456882] mb-6 flex items-center gap-3">
                <FaEnvelope className="w-8 h-8" />
                Contact {club.name}
              </h2>
             
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="message"
                    className="block text-lg font-semibold text-gray-700 mb-3"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    rows={6}
                    className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#456882] focus:border-transparent bg-gray-50/50 text-lg shadow-lg resize-none"
                    placeholder="Share your thoughts, questions, or ideas with the club coordinators..."
                  />
                </div>
               
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 15px 35px rgba(69, 104, 130, 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={contactSending}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white rounded-xl hover:from-[#334d5e] hover:to-[#456882] transition-all shadow-lg disabled:opacity-50 font-medium text-lg"
                >
                  {contactSending ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FaPaperPlane className="w-5 h-5" />
                  )}
                  <span>{contactSending ? "Sending Message..." : "Send Message"}</span>
                </motion.button>
              </form>
             
              {/* Quick Contact Info */}
              {headCoordinators.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Or reach out directly to our coordinators:
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {headCoordinators.map((coordinator) => (
                      <div key={coordinator._id} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                        <FaCrown className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-gray-700">{coordinator.name}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-sm text-gray-600">{coordinator.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClubDetailPage;