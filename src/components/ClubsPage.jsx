import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Users, Calendar, Award, ChevronRight, X } from "lucide-react";
import Navbar from "../components/Navbar";

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

const ClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState(["all"]);
  const [userClubs, setUserClubs] = useState([]);
  const [joinLoading, setJoinLoading] = useState({});
  const [searchFocused, setSearchFocused] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    isSuccess: false,
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Please log in to view clubs.");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        // Fetch user data for clubs and pending clubs
        const userResponse = await axios.get(
          "http://localhost:5000/api/auth/user",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const userData = userResponse.data;
        setUserClubs(userData.clubs?.map((club) => club._id || club) || []);
        const pendingClubs =
          userData.pendingClubs?.map((club) => club._id || club) || [];

        // Fetch all clubs
        const clubsResponse = await axios.get(
          "http://localhost:5000/api/clubs",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const clubData = clubsResponse.data || [];

        // Fetch all events
        const eventsResponse = await axios.get(
          "http://localhost:5000/api/events",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const eventsData = eventsResponse.data || [];

        // Process clubs with eventsCount, memberCount, and image fallbacks
        const processedClubs = clubData.map((club) => ({
          ...club,
          eventsCount: eventsData.filter(
            (event) => event.club?._id.toString() === club._id.toString()
          ).length,
          memberCount: club.members?.length || 0,
          category: club.category || "General",
          description: club.description || "No description available.",
          icon: club.icon || "https://via.placeholder.com/150?text=Club+Icon",
          banner:
            club.banner ||
            club.icon ||
            "https://via.placeholder.com/150?text=Club+Banner",
          isPending: pendingClubs.includes(club._id), // Check if club._id is in pendingClubs
        }));

        setClubs(processedClubs);
        setFilteredClubs(processedClubs);
        const uniqueCategories = [
          "all",
          ...new Set(processedClubs.map((club) => club.category.toLowerCase())),
        ];
        setCategories(uniqueCategories);
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to load clubs. Please try again."
        );
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          navigate("/login");
        }
      }
    };
    fetchData();
  }, [navigate, token]);

  const handleJoinClub = async (clubId) => {
    setJoinLoading((prev) => ({ ...prev, [clubId]: true }));
    try {
      await axios.post(
        `http://localhost:5000/api/clubs/${clubId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Update club to show pending status
      setClubs((prev) =>
        prev.map((club) =>
          club._id === clubId ? { ...club, isPending: true } : club
        )
      );
      setFilteredClubs((prev) =>
        prev.map((club) =>
          club._id === clubId ? { ...club, isPending: true } : club
        )
      );
      setModal({
        isOpen: true,
        message: "Membership request submitted! Awaiting approval.",
        isSuccess: true,
      });
    } catch (err) {
      setModal({
        isOpen: true,
        message:
          err.response?.data?.error || "Failed to submit membership request.",
        isSuccess: false,
      });
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
      }
    }
    setJoinLoading((prev) => ({ ...prev, [clubId]: false }));
  };

  const closeModal = () => {
    setModal({ isOpen: false, message: "", isSuccess: false });
  };

  useEffect(() => {
    let filtered = clubs.filter((club) =>
      (club.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (club) =>
          club.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    setFilteredClubs(filtered);
  }, [searchTerm, clubs, selectedCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
  };

  const labelVariants = {
    resting: { y: 0, fontSize: "0.875rem", color: "#6B7280" },
    floating: { y: -20, fontSize: "0.75rem", color: "#456882" },
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        message={modal.message}
        isSuccess={modal.isSuccess}
      />
      <div className="relative overflow-hidden bg-gradient-to-r from-[#456882] to-[#5a7a98] py-16">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Explore Our <span className="text-yellow-300">Clubs</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Discover vibrant communities and unlock your potential at ACEM!
          </p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <motion.label
              htmlFor="search"
              className="absolute left-12 top-5 text-gray-500 font-medium transition-all"
              animate={searchFocused || searchTerm ? "floating" : "resting"}
              variants={labelVariants}
              transition={{ duration: 0.2 }}
            >
              Search clubs
            </motion.label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(!!searchTerm)}
              className="w-full p-3 pt-6 pl-12 bg-white/90 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#456882] text-gray-700 placeholder-gray-500 shadow-sm"
              aria-label="Search clubs"
            />
          </div>
        </motion.div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          <motion.label
            htmlFor="category-filter"
            className="text-gray-700 font-medium text-sm"
            animate={selectedCategory ? "floating" : "resting"}
            variants={{ resting: { opacity: 1 }, floating: { opacity: 1 } }}
          >
            Filter by Category
          </motion.label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 w-full sm:w-64 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] text-gray-700 shadow-sm"
            aria-label="Filter clubs by category"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </motion.div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
              <p className="text-red-600 text-lg font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredClubs.map((club) => (
                <motion.div
                  key={club._id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={club.banner}
                      alt={`${club.name} banner`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="bg-[#456882] text-white px-2 py-1 rounded-full text-xs font-medium">
                        {club.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <img
                          src={club.icon}
                          alt={`${club.name} icon`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-[#456882] group-hover:text-[#334d5e] transition-colors">
                        {club.name}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {club.description}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{club.memberCount} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{club.eventsCount} events</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        <span>Active</span>
                      </div>
                    </div>
                    {userClubs.includes(club._id) ? (
                      <Link
                        to={`/clubs/${club._id}`}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#456882] to-[#5a7a98] text-white rounded-lg hover:from-[#334d5e] hover:to-[#456882] transition-all duration-300 group-hover:shadow-md transform group-hover:scale-100"
                      >
                        <span className="font-medium">Explore Club</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ) : club.isPending ? (
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
              ))}
            </AnimatePresence>
          </motion.div>
        )}
        {!loading && !error && filteredClubs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No clubs found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search terms or category filter.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="px-4 py-2 bg-[#456882] text-white rounded-lg hover:bg-[#334d5e] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ClubsPage;
