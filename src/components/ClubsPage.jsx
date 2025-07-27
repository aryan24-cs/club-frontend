import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { Search, Users, Calendar, Award, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";

const ClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState(["all"]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch clubs
        const clubsResponse = await axios.get(
          "http://localhost:5000/api/clubs",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch activities to derive eventsCount
        const activitiesResponse = await axios.get(
          "http://localhost:5000/api/activities",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Process clubs with eventsCount
        const processedClubs = clubsResponse.data.map((club) => {
          const eventsCount = activitiesResponse.data.filter(
            (activity) =>
              activity.club.toLowerCase() === club.name.toLowerCase()
          ).length;
          return {
            ...club,
            eventsCount,
            memberCount: club.memberCount || 50, // Fallback if not in backend
          };
        });

        setClubs(processedClubs);
        setFilteredClubs(processedClubs);

        // Extract unique categories
        const uniqueCategories = [
          "all",
          ...new Set(
            clubsResponse.data.map((club) => club.category.toLowerCase())
          ),
        ];
        setCategories(uniqueCategories);

        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to load clubs. Please try again."
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = clubs.filter((club) =>
      club.name.toLowerCase().includes(searchTerm.toLowerCase())
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
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navbar />
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#456882] to-[#5a7a98] py-16">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-7xl mx-auto px-6 text-center"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Explore Our <span className="text-yellow-300">Clubs</span>
          </h1>
          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Discover vibrant communities, build connections, and unlock your
            potential at ACEM!
          </p>

          {/* Search Bar */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clubs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-12 py-3 bg-white/90 backdrop-blur-sm border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#456882] text-gray-700 placeholder-gray-500 shadow-lg"
              aria-label="Search clubs"
            />
          </div>
        </motion.div>
      </div>

      {/* Category Filter Dropdown */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <label
              htmlFor="category-filter"
              className="text-gray-700 font-medium text-sm"
            >
              Filter by Category
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 w-full sm:w-64 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#456882] text-gray-700 shadow-sm"
              aria-label="Filter clubs by category"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Clubs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <div className="h-10 bg-gray-200 rounded-full animate-pulse"></div>
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
                className="mt-4 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={club.icon || "https://via.placeholder.com/400x200"}
                      alt={club.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-[#456882] text-white px-3 py-1 rounded-full text-sm font-medium">
                        {club.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#456882] mb-2 group-hover:text-[#334d5e] transition-colors">
                      {club.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {club.description ||
                        "Discover amazing opportunities and connect with like-minded students."}
                    </p>

                    {/* Club Stats */}
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
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

                    <Link
                      to={`/clubs/${club._id}`}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#456882] to-[#5a7a98] text-white rounded-full hover:from-[#334d5e] hover:to-[#456882] transition-all duration-300 group-hover:shadow-lg transform group-hover:scale-105"
                    >
                      <span className="font-medium">Explore Club</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* No Results */}
        {!loading && !error && filteredClubs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-gray-100 rounded-2xl p-12 max-w-md mx-auto">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
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
                className="px-4 py-3 bg-[#456882] text-white rounded-full hover:bg-[#334d5e] transition-colors"
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
