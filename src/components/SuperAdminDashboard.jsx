import React, { memo, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  Calendar,
  Clock,
  Search,
  ChevronDown,
  Plus,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Edit3,
  Trash2,
  Eye,
  ChevronRight,
} from "lucide-react";
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Something went wrong
            </h2>
            <p className="text-red-600 mb-4">Please try refreshing the page.</p>
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
const StatsCard = memo(({ title, value, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <h3 className="text-lg font-semibold text-gray-900">
          {typeof value === 'number' ? value : 'N/A'}
        </h3>
      </div>
      <Icon className="w-6 h-6 text-[#456882]" />
    </div>
  </motion.div>
));

// Club Card Component
const ClubCard = memo(({ club, onEdit, onDelete, onView }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -8, transition: { duration: 0.3 } }}
    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
  >
    <div className="relative overflow-hidden">
      <img
        src={club.icon || "https://content3.jdmagicbox.com/v2/comp/faridabad/c2/011pxx11.xx11.180720042429.n1c2/catalogue/aravali-college-of-engineering-and-management-jasana-faridabad-colleges-5hhqg5d110.jpg"}
        alt={club.name || "Club Icon"}
        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        onError={(e) => {
          e.target.src = "https://content3.jdmagicbox.com/v2/comp/faridabad/c2/011pxx11.xx11.180720042429.n1c2/catalogue/aravali-college-of-engineering-and-management-jasana-faridabad-colleges-5hhqg5d110.jpg";
          console.warn(
            `Failed to load icon for club ${club.name}: ${club.icon}`
          );
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onView(club)}
          className="p-1 bg-white/20 rounded-full hover:bg-white/30"
        >
          <Eye className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => onEdit(club)}
          className="p-1 bg-white/20 rounded-full hover:bg-white/30"
        >
          <Edit3 className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => onDelete(club)}
          className="p-1 bg-white/20 rounded-full hover:bg-red-500/50"
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      </div>
      <div className="absolute top-4 left-4">
        <span className="bg-[#456882] text-white px-3 py-1 rounded-full text-sm font-medium">
          {club.category || "General"}
        </span>
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold text-[#456882] mb-2 group-hover:text-[#334d5e] transition-colors">
        {club.name || "Unnamed Club"}
      </h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {club.description || "No description available"}
      </p>
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{club.memberCount || 0} members</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{club.eventsCount || 0} events</span>
        </div>
      </div>
      <Link
        to={`/clubs/${club._id}`}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#456882] to-[#5a7a98] text-white rounded-full hover:from-[#334d5e] hover:to-[#456882] transition-all duration-300 group-hover:shadow-lg transform group-hover:scale-105"
      >
        <span className="font-medium">View Club</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  </motion.div>
));

// Membership Request Card Component
const MembershipRequestCard = memo(({ request, onApprove, onReject }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#456882] rounded-lg flex items-center justify-center text-white text-sm font-semibold">
          {request.userId?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">
            {request.userId?.name || "Unknown"}
          </h4>
          <p className="text-xs text-gray-500">{request.clubName || "N/A"}</p>
        </div>
      </div>
      <span
        className={`px-2 py-1 rounded-full text-xs ${request.status === "pending"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-green-100 text-green-700"
          }`}
      >
        {request.status}
      </span>
    </div>
    {request.status === "pending" && (
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => onApprove(request._id)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs"
        >
          <CheckCircle className="w-3 h-3" />
          Approve
        </button>
        <button
          onClick={() => onReject(request._id)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs"
        >
          <XCircle className="w-3 h-3" />
          Reject
        </button>
      </div>
    )}
  </motion.div>
));

const SuperAdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [categories, setCategories] = useState(["all"]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          navigate("/login");
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch user data
        const userResponse = await axios.get(
          "http://localhost:5000/api/auth/user",
          config
        );
        const userData = userResponse.data;
        if (!userData || !userData._id) {
          setError("Failed to load user data.");
          navigate("/login");
          return;
        }
        setUser(userData);

        // Fetch clubs
        const clubsResponse = await axios.get(
          "http://localhost:5000/api/clubs",
          config
        );
        const processedClubs = clubsResponse.data.map((club) => ({
          ...club,
          memberCount: Number(club.memberCount) || 0,
          eventsCount: Number(club.eventsCount) || 0,
        }));
        setClubs(processedClubs);

        // Debug logging for clubs
        console.log("SuperAdminDashboard - User:", {
          id: userData._id,
          name: userData.name,
          email: userData.email,
          isAdmin: userData.isAdmin,
        });
        console.log("SuperAdminDashboard - Clubs:", processedClubs);
        processedClubs.forEach((club, index) => {
          console.log(`Club ${index + 1}:`, {
            id: club._id,
            name: club.name,
            icon: club.icon,
            category: club.category,
            memberCount: club.memberCount,
            eventsCount: club.eventsCount,
            superAdmins: club.superAdmins?.map((admin) => ({
              id: admin._id,
              name: admin.name,
              email: admin.email,
            })),
          });
        });

        // Check if user is a super admin
        const isSuperAdmin =
          userData.isAdmin ||
          clubsResponse.data.some((club) =>
            club.superAdmins?.some(
              (admin) => admin?._id?.toString() === userData._id?.toString()
            )
          );
        console.log("SuperAdminDashboard - Is super admin:", isSuperAdmin);

        if (!isSuperAdmin) {
          setError("You do not have super admin access.");
          navigate("/dashboard");
          return;
        }

        // Fetch membership requests
        const requestsResponse = await axios.get(
          "http://localhost:5000/api/membership-requests",
          config
        );
        setMembershipRequests(requestsResponse.data);

        // Set categories
        setCategories([
          "all",
          ...new Set(
            clubsResponse.data
              .map((club) => club.category?.toLowerCase())
              .filter(Boolean)
          ),
        ]);

        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", {
          message: err.message,
          stack: err.stack,
          status: err.response?.status,
          data: err.response?.data,
        });
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          setError("Session expired or unauthorized. Please log in again.");
          navigate("/login");
        } else {
          setError(err.response?.data?.error || "Failed to load data.");
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/membership-requests/${requestId}`,
        { status: "approved" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembershipRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: "approved" } : req
        )
      );
      setSuccess("Membership request approved successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to approve request.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/membership-requests/${requestId}`,
        { status: "rejected" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembershipRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: "rejected" } : req
        )
      );
      setSuccess("Membership request rejected successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reject request.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDeleteClub = async (club) => {
    if (!window.confirm(`Delete ${club.name}? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/clubs/${club._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClubs((prev) => prev.filter((c) => c._id !== club._id));
      setSuccess(`Club ${club.name} deleted successfully.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete club.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const filteredClubs = useMemo(
    () =>
      clubs.filter(
        (club) =>
          club.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (selectedFilter === "all" ||
            club.category?.toLowerCase() === selectedFilter.toLowerCase())
      ),
    [clubs, searchTerm, selectedFilter]
  );

  const filteredRequests = useMemo(
    () =>
      membershipRequests.filter(
        (request) =>
          request.userId?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.clubName?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [membershipRequests, searchTerm]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-white shadow-sm"></div>
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
                  ))}
                </div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-18">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-[#456882]">
                  Super Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome, {user?.name || "Super Admin"}! Manage clubs and
                  membership requests.
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/create-club"
                  className="flex items-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-lg hover:bg-[#334d5e]"
                >
                  <Plus className="w-4 h-4" />
                  Create Club
                </Link>
                <Link
                  to="/manage-events"
                  className="flex items-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-lg hover:bg-[#334d5e]"
                >
                  <Calendar className="w-4 h-4" />
                  Manage Events
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-700">{error}</p>
                  <button onClick={() => setError("")} className="ml-auto">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-700">{success}</p>
                  <button onClick={() => setSuccess("")} className="ml-auto">
                    <XCircle className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard title="Total Clubs" value={clubs.length} icon={Users} />
            <StatsCard
              title="Total Members"
              value={clubs.reduce(
                (sum, club) => sum + (Number(club.memberCount) || 0),
                0
              )}
              icon={Users}
            />
            <StatsCard
              title="Pending Requests"
              value={
                membershipRequests.filter((req) => req.status === "pending")
                  .length
              }
              icon={Clock}
            />
            <StatsCard
              title="Active Events"
              value={clubs.reduce(
                (sum, club) => sum + (Number(club.eventsCount) || 0),
                0
              )}
              icon={Calendar}
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Clubs */}
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Clubs</h2>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search clubs or requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#456882] focus:border-[#456882]"
                      />
                    </div>
                    <div className="relative">
                      <select
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value)}
                        className="w-full sm:w-48 pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-[#456882] focus:border-[#456882]"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category === "all"
                              ? "All Categories"
                              : category.charAt(0).toUpperCase() +
                              category.slice(1)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                  </div>
                </div>
                {filteredClubs.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {searchTerm
                        ? "No clubs found."
                        : "No clubs available. Create one to get started."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredClubs.map((club) => (
                      <ClubCard
                        key={club._id}
                        club={club}
                        onEdit={() => navigate(`/clubs/${club._id}/edit`)}
                        onDelete={handleDeleteClub}
                        onView={() => navigate(`/clubs/${club._id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Membership Requests */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Membership Requests
                  {filteredRequests.filter((req) => req.status === "pending")
                    .length > 0 && (
                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                        {
                          filteredRequests.filter(
                            (req) => req.status === "pending"
                          ).length
                        }{" "}
                        pending
                      </span>
                    )}
                </h2>
                {filteredRequests.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      No membership requests.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredRequests.map((request) => (
                      <MembershipRequestCard
                        key={request._id}
                        request={request}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SuperAdminDashboard;