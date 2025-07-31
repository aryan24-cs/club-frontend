import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Trophy,
  Medal,
  Star,
  Crown,
  TrendingUp,
  Users,
  Award,
  Filter,
  Search,
  Download,
  ChevronDown,
  AlertTriangle,
  ChevronUp,
  Minus,
  RefreshCw,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { debounce } from 'lodash';

// Backend base URL
const BASE_URL = "http://localhost:5000";

// Custom Axios instance for centralized token management
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", { error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Something went wrong
            </h2>
            <p className="text-red-600 mb-4">
              {this.state.error?.message || "Please try refreshing the page."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color = "text-[#456882]", bgColor = "bg-white" }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`${bgColor} rounded-xl shadow-sm p-4 border border-gray-100 transition-all duration-300 hover:shadow-md`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <h3 className="text-lg font-semibold text-gray-900">{value}</h3>
      </div>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
  </motion.div>
);

// Rank Change Indicator Component
const RankChangeIndicator = ({ current, previous }) => {
  if (!previous || current === previous) {
    return (
      <div className="flex items-center text-gray-500">
        <Minus className="w-4 h-4" />
        <span className="text-xs ml-1">No Change</span>
      </div>
    );
  }
  
  const isUp = current < previous;
  const change = Math.abs(current - previous);
  
  return (
    <div className={`flex items-center ${isUp ? 'text-green-500' : 'text-red-500'}`}>
      {isUp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      <span className="text-xs ml-1">{change}</span>
    </div>
  );
};

// Student Rank Card Component
const StudentRankCard = ({ student, index, onViewDetails }) => {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <Trophy className="w-5 h-5 text-[#456882]" />;
    }
  };

  const getRankBg = (rank) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200";
      case 2: return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200";
      case 3: return "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200";
      default: return "bg-white border-gray-200";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group hover:shadow-lg
        ${getRankBg(student.rank)}
      `}
      onClick={() => onViewDetails(student)}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {getRankIcon(student.rank)}
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">#{student.rank}</div>
            <RankChangeIndicator current={student.rank} previous={student.previousRank} />
          </div>
        </div>
        
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-[#456882] to-[#5a7a98] rounded-xl flex items-center justify-center text-white text-lg font-semibold shadow-md">
            {student.name?.charAt(0).toUpperCase() || "?"}
          </div>
          {student.rank <= 3 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
              <Star className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            {student.name || "Unknown"}
          </h3>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Clubs: {student.clubNames || "None"}
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-[#456882]" />
          <span className="text-lg font-bold text-[#456882]">{student.totalPoints || 0}</span>
          <span className="text-xs text-gray-500">pts</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Trophy className="w-3 h-3" />
            <span>{student.level || "Bronze"} Level</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Student Details Modal
const StudentDetailsModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-[#456882] to-[#5a7a98] rounded-xl flex items-center justify-center text-white text-2xl font-semibold">
              {student.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{student.name}</h2>
              <p className="text-sm text-gray-600">Rank #{student.rank}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Total Points</p>
              <p className="text-lg font-semibold text-[#456882]">{student.totalPoints || 0}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Level</p>
              <p className="text-lg font-semibold text-green-600">{student.level || "Bronze"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">User Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Roll No:</strong> {student.rollNo || "N/A"}</p>
              <p><strong>Email:</strong> {student.email || "N/A"}</p>
            </div>
          </div>

          {student.clubNames && student.clubNames !== "None" && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Club Memberships</h3>
              <div className="flex flex-wrap gap-2">
                {student.clubNames.split(", ").map((club, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#456882] text-white rounded-full text-xs"
                  >
                    {club}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Ranking System Component
const RankingSystem = () => {
  const [user, setUser] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("totalPoints");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoading, setIsLoading] = useState({ user: false, rankings: false });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const debouncedSetSearchQuery = useCallback(
    debounce((value) => setSearchQuery(value), 300),
    []
  );

  const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await api(url, options);
      } catch (err) {
        if (i === retries - 1 || err.response?.status === 401 || err.response?.status === 403) {
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  };

  const fetchUser = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, user: true }));
    setError("");
    try {
      const response = await fetchWithRetry("/api/auth/user");
      setUser(response.data);
    } catch (err) {
      setError("Failed to load user data.");
      console.error("fetchUser Error:", err);
    } finally {
      setIsLoading((prev) => ({ ...prev, user: false }));
    }
  }, []);

  const fetchPointsTable = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, rankings: true }));
    setError("");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetchWithRetry("/api/points-table", {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('Points table response:', response.data);

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from server');
      }

      if (response.data.length === 0) {
        setError('No members found in any club');
        setRankings([]);
        return;
      }

      // Process users (backend already filters member-only clubs)
      const processedRankings = response.data.map((user, index) => ({
        id: user.userId || user._id || 'unknown',
        name: user.name || 'Unknown',
        rollNo: user.rollNo || 'N/A',
        email: user.email || 'N/A',
        totalPoints: user.totalPoints || 0,
        clubNames: Array.isArray(user.clubName) ? user.clubName.join(', ') : user.clubName || 'None',
        rank: index + 1,
        avatar: user.avatar || 'https://via.placeholder.com/60/60',
        level: user.totalPoints >= 900 ? 'Platinum' :
               user.totalPoints >= 800 ? 'Gold' :
               user.totalPoints >= 700 ? 'Silver' : 'Bronze',
        previousRank: index + 1 // Mock previous rank for demonstration
      }));

      setRankings(processedRankings);
    } catch (err) {
      console.error('Error fetching points table:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again later.');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to load points table. Please try again later.');
      }
    } finally {
      setIsLoading((prev) => ({ ...prev, rankings: false }));
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchPointsTable();
  }, [fetchUser, fetchPointsTable]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleExportCSV = () => {
    if (!filteredRankings.length) {
      setError("No member data to export.");
      return;
    }

    const headers = [
      "Rank",
      "Name",
      "Roll No",
      "Email",
      "Club Names",
      "Total Points",
      "Level"
    ];

    const rows = filteredRankings.map((student) => [
      student.rank,
      `"${student.name || "Unknown"}"`,
      `"${student.rollNo || "N/A"}"`,
      `"${student.email || "N/A"}"`,
      `"${student.clubNames || "None"}"`,
      student.totalPoints || 0,
      student.level || "Bronze"
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `member_rankings_${new Date().toISOString().split("T")[0]}.csv`);
    setSuccess("Rankings exported as CSV!");
  };

  const filteredRankings = useMemo(() => {
    return rankings
      .filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.clubNames.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const multiplier = sortOrder === 'desc' ? -1 : 1;
        if (sortBy === 'name' || sortBy === 'rollNo' || sortBy === 'clubNames') {
          return a[sortBy].localeCompare(b[sortBy]) * multiplier;
        }
        return (a[sortBy] - b[sortBy]) * multiplier;
      });
  }, [rankings, searchQuery, sortBy, sortOrder]);

  const stats = useMemo(() => {
    return {
      totalMembers: rankings.length,
      avgPoints: rankings.length > 0 
        ? Math.round((rankings.reduce((sum, s) => sum + s.totalPoints, 0) / rankings.length) * 100) / 100
        : 0,
      platinumMembers: rankings.filter(s => s.level === 'Platinum').length,
      goldMembers: rankings.filter(s => s.level === 'Gold').length
    };
  }, [rankings]);

  if (isLoading.user || isLoading.rankings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#456882] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8 font-[Poppins]">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-8 h-8 text-[#456882]" />
              Member Rankings
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => fetchPointsTable()}
                className="px-4 py-2 bg-[#456882] text-white rounded-full hover:bg-[#5a7a98] transition-colors flex items-center gap-2"
                disabled={isLoading.rankings}
                aria-label="Refresh rankings"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading.rankings ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-[#456882] text-white rounded-full hover:bg-[#5a7a98] transition-colors flex items-center gap-2"
                disabled={isLoading.rankings || filteredRankings.length === 0}
                aria-label="Export rankings as CSV"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </motion.div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                {error}
                <button
                  onClick={() => setError("")}
                  className="ml-auto text-red-700 underline"
                  aria-label="Dismiss error"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                {success}
                <button
                  onClick={() => setSuccess("")}
                  className="ml-auto text-green-700 underline"
                  aria-label="Dismiss success"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Filters */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-[#456882]" />
                  Filters & Sorting
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882] appearance-none bg-white"
                        aria-label="Sort rankings by"
                      >
                        <option value="totalPoints">Total Points</option>
                        <option value="name">Name</option>
                        <option value="rollNo">Roll Number</option>
                        <option value="clubNames">Club Names</option>
                      </select>
                      <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                    <div className="relative">
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882] appearance-none bg-white"
                        aria-label="Sort order"
                      >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                      </select>
                      <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <StatsCard 
                  title="Total Members" 
                  value={stats.totalMembers} 
                  icon={Users} 
                />
                <StatsCard 
                  title="Average Points" 
                  value={`${stats.avgPoints}`} 
                  icon={Award}
                  color="text-green-500"
                  bgColor="bg-green-50"
                />
                <StatsCard 
                  title="Platinum Members" 
                  value={stats.platinumMembers} 
                  icon={Trophy}
                  color="text-yellow-500"
                  bgColor="bg-yellow-50"
                />
                <StatsCard 
                  title="Gold Members" 
                  value={stats.goldMembers} 
                  icon={Medal}
                  color="text-amber-500"
                  bgColor="bg-amber-50"
                />
              </motion.div>

              {/* Top 3 Quick View */}
              {rankings.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Top 3 Members
                  </h3>
                  <div className="space-y-3">
                    {rankings.slice(0, 3).map((student, index) => (
                      <div key={student.id} className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                          {index === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                          {index === 2 && <Award className="w-4 h-4 text-amber-600" />}
                          <span className="font-semibold text-sm">#{student.rank}</span>
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-br from-[#456882] to-[#5a7a98] rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                          {student.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.totalPoints} pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 min-h-[calc(100vh-120px)]"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#456882]" />
                    Member Rankings
                    {filteredRankings.length !== rankings.length && (
                      <span className="text-sm text-gray-500">({filteredRankings.length} of {rankings.length})</span>
                    )}
                  </h2>
                  
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name, roll number, or club..."
                      onChange={(e) => debouncedSetSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882] w-64"
                      disabled={isLoading.rankings}
                      aria-label="Search members"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {isLoading.rankings ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-[#456882] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading member rankings...</p>
                  </div>
                ) : filteredRankings.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      {searchQuery ? "No members match your search." : "No member data available."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin scrollbar-thumb-[#456882] scrollbar-track-gray-200">
                    {filteredRankings.map((student, index) => (
                      <StudentRankCard
                        key={student.id}
                        student={student}
                        index={index}
                        onViewDetails={setSelectedStudent}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Student Details Modal */}
        <StudentDetailsModal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          student={selectedStudent}
        />
      </div>
    </ErrorBoundary>
  );
};

export default RankingSystem;