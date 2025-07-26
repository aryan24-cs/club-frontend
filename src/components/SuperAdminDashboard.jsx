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
        <h3 className="text-lg font-semibold text-gray-900">{value}</h3>
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
    whileHover={{ y: -4 }}
    className="bg-white rounded-xl shadow-sm border border-gray-100 group"
  >
    <div className="relative h-24 bg-gradient-to-r from-[#456882] to-[#5a7a98]">
      <img
        src={
          club.banner
            ? `http://localhost:5000${club.banner}`
            : "https://via.placeholder.com/400x96"
        }
        alt={club.name || "Club Banner"}
        className="w-full h-full object-cover opacity-30"
      />
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
    </div>
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <img
          src={
            club.icon
              ? `http://localhost:5000${club.icon}`
              : "https://via.placeholder.com/40x40"
          }
          alt={club.name || "Club Icon"}
          className="w-10 h-10 rounded-lg object-cover border border-[#456882]"
        />
        <div>
          <h3 className="text-base font-semibold text-[#456882]">
            {club.name || "Unnamed Club"}
          </h3>
          <p className="text-xs text-gray-500">{club.category || "General"}</p>
        </div>
      </div>
      <p className="text-xs text-gray-600 line-clamp-2 mb-3">
        {club.description || "No description available"}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{club.memberCount || 0} members</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{club.eventsCount || 0} events</span>
        </div>
      </div>
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
            {request.userId?.name}
          </h4>
          <p className="text-xs text-gray-500">{request.clubName}</p>
        </div>
      </div>
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          request.status === "pending"
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

// Host Event Form Component
const HostEventForm = memo(({ user, clubs, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    club: "",
    banner: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const eligibleClubs = clubs.filter((club) =>
    club.superAdmins?.some((admin) => admin?._id === user._id)
  );

  console.log("Clubs in HostEventForm:", clubs);
  console.log("Eligible clubs:", eligibleClubs);
  console.log("User ID:", user._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "banner" && value) {
          formPayload.append(key, value);
        } else if (value) {
          formPayload.append(key, value);
        }
      });

      const response = await axios.post(
        "http://localhost:5000/api/events",
        formPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        club: "",
        banner: null,
      });
      onSuccess("Event created successfully!");
    } catch (err) {
      onError(err.response?.data?.error || "Failed to create event.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-4"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Host an Event
      </h3>
      {eligibleClubs.length === 0 ? (
        <p className="text-sm text-gray-500">
          You are not a super admin for any club.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#456882] focus:border-[#456882]"
              placeholder="Enter event title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#456882] focus:border-[#456882]"
              placeholder="Describe the event"
              rows="3"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#456882] focus:border-[#456882]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#456882] focus:border-[#456882]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#456882] focus:border-[#456882]"
              placeholder="Enter event location"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Club
            </label>
            <select
              name="club"
              value={formData.club}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#456882] focus:border-[#456882]"
            >
              <option value="">Select a club</option>
              {eligibleClubs.map((club) => (
                <option key={club._id} value={club._id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Banner Image
            </label>
            <input
              type="file"
              name="banner"
              onChange={handleInputChange}
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#456882] focus:border-[#456882]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-[#456882] text-white rounded-lg hover:bg-[#334d5e] disabled:bg-gray-400 transition-colors"
          >
            {submitting ? "Creating..." : "Create Event"}
          </button>
        </form>
      )}
    </motion.div>
  );
});

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
        setUser(userResponse.data);

        // Fetch clubs
        const clubsResponse = await axios.get(
          "http://localhost:5000/api/clubs",
          config
        );
        setClubs(clubsResponse.data);
        console.log("User data:", userResponse.data);
        console.log("Clubs data:", clubsResponse.data);

        // Check if user is a super admin
        const isSuperAdmin =
          userResponse.data.isAdmin ||
          clubsResponse.data.some((club) =>
            club.superAdmins?.some(
              (admin) => admin?._id === userResponse.data._id
            )
          );
        console.log("Is super admin:", isSuperAdmin);

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
            clubsResponse.data.map((club) => club.category.toLowerCase())
          ),
        ]);

        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
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
    } catch (err) {
      setError(err.response?.data?.error || "Failed to approve request.");
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
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reject request.");
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
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete club.");
    }
  };

  const filteredClubs = useMemo(
    () =>
      clubs.filter(
        (club) =>
          club.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
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
          request.clubName.toLowerCase().includes(searchTerm.toLowerCase())
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
              <div className="space-y-6">
                <div className="h-48 bg-gray-200 rounded-xl"></div>
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
                  events.
                </p>
              </div>
              <Link
                to="/create-club"
                className="flex items-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-lg hover:bg-[#334d5e]"
              >
                <Plus className="w-4 h-4" />
                Create Club
              </Link>
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
                (sum, club) => sum + (club.memberCount || 0),
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
                (sum, club) => sum + (club.eventsCount || 0),
                0
              )}
              icon={Calendar}
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Host Event */}
              <HostEventForm
                user={user}
                clubs={clubs}
                onSuccess={setSuccess}
                onError={setError}
              />

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
