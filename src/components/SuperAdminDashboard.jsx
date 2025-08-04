import React, { memo, useEffect, useState, useMemo, useCallback } from "react";
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
  FileText,
} from "lucide-react";
import Navbar from "./Navbar";
import NotificationCard from "./NotificationCard";

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
          {typeof value === "number" ? value : "N/A"}
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
        src={
          club.icon ||
          "https://content3.jdmagicbox.com/v2/comp/faridabad/c2/011pxx11.xx11.180720042429.n1c2/catalogue/aravali-college-of-engineering-and-management-jasana-faridabad-colleges-5hhqg5d110.jpg"
        }
        alt={club.name || "Club Icon"}
        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        onError={(e) => {
          e.target.src =
            "https://content3.jdmagicbox.com/v2/comp/faridabad/c2/011pxx11.xx11.180720042429.n1c2/catalogue/aravali-college-of-engineering-and-management-jasana-faridabad-colleges-5hhqg5d110.jpg";
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
const MembershipRequestCard = memo(
  ({ request, onApprove, onReject, isLoading }) => (
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
            <p className="text-xs text-gray-500">
              {request.clubId?.name || "N/A"}
            </p>
            <p className="text-xs text-gray-500">
              {request.userId?.isACEMStudent
                ? "ACEM Student"
                : "Non-ACEM Student"}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            request.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : request.status === "approved"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {request.status}
        </span>
      </div>
      {request.status === "pending" && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onApprove(request._id)}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-1 rounded-lg text-xs text-white font-medium transition-colors ${
              isLoading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-3 h-3" />
                Approve
              </>
            )}
          </button>
          <button
            onClick={() => onReject(request._id)}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-1 rounded-lg text-xs text-white font-medium transition-colors ${
              isLoading
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <XCircle className="w-3 h-3" />
                Reject
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  )
);

// Request History Card Component
const RequestHistoryCard = memo(({ request }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
  >
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-sm font-semibold text-gray-900">
          {request.userId?.name || "Unknown"}
        </h4>
        <p className="text-xs text-gray-500">{request.clubId?.name || "N/A"}</p>
        <p className="text-xs text-gray-500">
          {new Date(request.updatedAt || request.createdAt).toLocaleString()}
        </p>
      </div>
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          request.status === "pending"
            ? "bg-yellow-100 text-yellow-700"
            : request.status === "approved"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {request.status}
      </span>
    </div>
  </motion.div>
));

// Attendance Card Component
const AttendanceCard = memo(({ attendance, onView, onDownload }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
  >
    <div className="flex items-center justify-between mb-2">
      <div>
        <h4 className="text-sm font-semibold text-gray-900">
          {attendance.event?.title || "Event"}
        </h4>
        <p className="text-xs text-gray-500">
          {attendance.club?.name || "Club"}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(attendance.date).toLocaleDateString()}
        </p>
        <p className="text-xs text-gray-500">
          Attendance Rate: {attendance.stats?.attendanceRate?.toFixed(2) || 0}%
        </p>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onView(attendance)}
          className="p-1 bg-[#456882]/20 rounded-full hover:bg-[#456882]/30"
        >
          <Eye className="w-4 h-4 text-[#456882]" />
        </button>
        <button
          onClick={() => onDownload(attendance)}
          className="p-1 bg-[#456882]/20 rounded-full hover:bg-[#456882]/30"
        >
          <FileText className="w-4 h-4 text-[#456882]" />
        </button>
      </div>
    </div>
  </motion.div>
));

// Practice Attendance Card Component
const PracticeAttendanceCard = memo(({ attendance, onView, onDownload }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
  >
    <div className="flex items-center justify-between mb-2">
      <div>
        <h4 className="text-sm font-semibold text-gray-900">
          {attendance.title || "Practice Session"}
        </h4>
        <p className="text-xs text-gray-500">
          {attendance.club?.name || "Club"}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(attendance.date).toLocaleDateString()}
        </p>
        <p className="text-xs text-gray-500">
          Room: {attendance.roomNo || "N/A"}
        </p>
        <p className="text-xs text-gray-500">
          Attendance Rate: {attendance.stats?.attendanceRate?.toFixed(2) || 0}%
        </p>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onView(attendance)}
          className="p-1 bg-[#456882]/20 rounded-full hover:bg-[#456882]/30"
        >
          <Eye className="w-4 h-4 text-[#456882]" />
        </button>
        <button
          onClick={() => onDownload(attendance)}
          className="p-1 bg-[#456882]/20 rounded-full hover:bg-[#456882]/30"
        >
          <FileText className="w-4 h-4 text-[#456882]" />
        </button>
      </div>
    </div>
  </motion.div>
));

const SuperAdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [allMembershipRequests, setAllMembershipRequests] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [practiceAttendanceRecords, setPracticeAttendanceRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [categories, setCategories] = useState(["all"]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [requestLoading, setRequestLoading] = useState({});
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get("https://club-manager-chi.vercel.app/api/notifications", config);
      const newNotifications = response.data.slice(0, 5); // Limit to 5 notifications
      const newUnreadCount = newNotifications.filter((n) => !n.read).length;
      if (newUnreadCount > unreadCount && unreadCount !== 0) {
        setToast(`You have ${newUnreadCount - unreadCount} new notification(s)`);
        setTimeout(() => setToast(null), 5000);
      }
      setNotifications(newNotifications);
      setUnreadCount(newUnreadCount);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.response?.data?.error || "Failed to load notifications.");
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [navigate, unreadCount]);

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

        // Fetch user data, clubs, requests, attendance, and notifications
        const [
          userResponse,
          clubsResponse,
          requestsResponse,
          attendanceResponse,
          practiceAttendanceResponse,
          notificationsResponse,
        ] = await Promise.all([
          axios.get("https://club-manager-chi.vercel.app/api/auth/user", config),
          axios.get("https://club-manager-chi.vercel.app/api/clubs", config),
          axios.get("https://club-manager-chi.vercel.app/api/membership-requests?all=true", config),
          axios.get("https://club-manager-chi.vercel.app/api/attendance", config),
          axios.get("https://club-manager-chi.vercel.app/api/practice-attendance", config),
          axios.get("https://club-manager-chi.vercel.app/api/notifications", config),
        ]);

        const userData = userResponse.data;
        if (!userData || !userData._id) {
          setError("Failed to load user data.");
          navigate("/login");
          return;
        }
        setUser(userData);

        // Process clubs
        const processedClubs = clubsResponse.data
          .filter(
            (club) =>
              club.creator?._id?.toString() === userData._id?.toString() ||
              club.superAdmins?.some(
                (admin) => admin?._id?.toString() === userData._id?.toString()
              ) ||
              userData.headCoordinatorClubs?.includes(club.name)
          )
          .map((club) => ({
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
          headCoordinatorClubs: userData.headCoordinatorClubs,
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
            creator: club.creator?._id,
            superAdmins: club.superAdmins?.map((admin) => ({
              id: admin._id,
              name: admin.name,
              email: admin.email,
            })),
          });
        });

        if (processedClubs.length === 0) {
          setError("You do not have access to manage any clubs.");
        }

        // Process membership requests
        const allRequests = requestsResponse.data;
        setAllMembershipRequests(allRequests);
        const filteredRequests = allRequests.filter(
          (request) =>
            request.status === "pending" &&
            processedClubs.some((club) => club._id === request.clubId?._id)
        );
        setMembershipRequests(filteredRequests);

        // Process attendance records
        setAttendanceRecords(attendanceResponse.data);
        setPracticeAttendanceRecords(practiceAttendanceResponse.data);

        // Process notifications
        const newNotifications = notificationsResponse.data.slice(0, 5); // Limit to 5
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter((n) => !n.read).length);

        // Set categories
        setCategories([
          "all",
          ...new Set(
            processedClubs
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

    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [navigate, fetchNotifications]);

  const handleApprove = async (requestId) => {
    setRequestLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `https://club-manager-chi.vercel.app/api/membership-requests/${requestId}`,
        { status: "approved" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const request = allMembershipRequests.find(
        (req) => req._id === requestId
      );
      if (request) {
        setClubs((prev) =>
          prev.map((club) =>
            club._id === request.clubId?._id
              ? { ...club, memberCount: (club.memberCount || 0) + 1 }
              : club
          )
        );
      }
      setMembershipRequests((prev) =>
        prev.filter((req) => req._id !== requestId)
      );
      setAllMembershipRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: "approved" } : req
        )
      );
      setSuccess("Membership request approved successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to approve request.";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
      if (errorMessage.includes("Club") && errorMessage.includes("not found")) {
        setMembershipRequests((prev) =>
          prev.filter((req) => req._id !== requestId)
        );
        setAllMembershipRequests((prev) =>
          prev.filter((req) => req._id !== requestId)
        );
      }
    } finally {
      setRequestLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleReject = async (requestId) => {
    setRequestLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `https://club-manager-chi.vercel.app/api/membership-requests/${requestId}`,
        { status: "rejected" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembershipRequests((prev) =>
        prev.filter((req) => req._id !== requestId)
      );
      setAllMembershipRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: "rejected" } : req
        )
      );
      setSuccess("Membership request rejected successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to reject request.";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
      if (errorMessage.includes("Club") && errorMessage.includes("not found")) {
        setMembershipRequests((prev) =>
          prev.filter((req) => req._id !== requestId)
        );
        setAllMembershipRequests((prev) =>
          prev.filter((req) => req._id !== requestId)
        );
      }
    } finally {
      setRequestLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleDeleteClub = async (club) => {
    if (!window.confirm(`Delete ${club.name}? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://club-manager-chi.vercel.app/api/clubs/${club._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClubs((prev) => prev.filter((c) => c._id !== club._id));
      setMembershipRequests((prev) =>
        prev.filter((req) => req.clubId?._id !== club._id)
      );
      setAllMembershipRequests((prev) =>
        prev.filter((req) => req.clubId?._id !== club._id)
      );
      setSuccess(`Club ${club.name} deleted successfully.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete club.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDownloadAttendance = async (attendance) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://club-manager-chi.vercel.app/api/attendance/${attendance._id}/report`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Attendance_Report_${attendance.event?.title || "Event"}.docx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccess("Attendance report downloaded successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to download attendance report."
      );
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDownloadPracticeAttendance = async (attendance) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://club-manager-chi.vercel.app/api/practice-attendance/${attendance._id}/report`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Practice_Attendance_Report_${attendance.title || "Session"}.docx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccess("Practice attendance report downloaded successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to download practice attendance report."
      );
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch(
        `https://club-manager-chi.vercel.app/api/notifications/${notificationId}/read`,
        {},
        config
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      setSuccess("Notification marked as read.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error marking notification as read:", err);
      const errorMessage =
        err.response?.status === 404
          ? "Notification not found."
          : err.response?.status === 403
          ? "You are not authorized to mark this notification as read."
          : err.response?.data?.error || "Failed to mark notification as read.";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch(
        "https://club-manager-chi.vercel.app/api/notifications/mark-all-read",
        {},
        config
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      setSuccess("All notifications marked as read.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError(
        err.response?.data?.error || "Failed to mark all notifications as read."
      );
      setTimeout(() => setError(""), 3000);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      }
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
          request.clubId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [membershipRequests, searchTerm]
  );

  const filteredAllRequests = useMemo(
    () =>
      allMembershipRequests
        .filter(
          (request) =>
            (request.userId?.name
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
              request.clubId?.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())) &&
            (selectedFilter === "all" ||
              clubs
                .find((club) => club._id === request.clubId?._id)
                ?.category?.toLowerCase() === selectedFilter.toLowerCase())
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt)
        ),
    [allMembershipRequests, searchTerm, selectedFilter, clubs]
  );

  const filteredAttendanceRecords = useMemo(
    () =>
      attendanceRecords.filter(
        (record) =>
          record.event?.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.club?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          new Date(record.date)
            .toLocaleDateString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      ),
    [attendanceRecords, searchTerm]
  );

  const filteredPracticeAttendanceRecords = useMemo(
    () =>
      practiceAttendanceRecords.filter(
        (record) =>
          record.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.club?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          new Date(record.date)
            .toLocaleDateString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.roomNo?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [practiceAttendanceRecords, searchTerm]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-white shadow-sm"></div>
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {[...Array(5)].map((_, i) => (
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
      <div className="min-h-screen bg-gray-50 font-[Poppins]">
        <Navbar
          user={user}
          role={user?.isAdmin ? "superadmin" : "user"}
          unreadCount={unreadCount}
        />
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
                  Welcome, {user?.name || "Super Admin"}! Manage clubs,
                  membership requests, attendance, and notifications.
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
                <Link
                  to="/manage-attendance"
                  className="flex items-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-lg hover:bg-[#334d5e]"
                >
                  <FileText className="w-4 h-4" />
                  Manage Attendance
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
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed top-4 right-4 bg-[#456882] text-white rounded-lg p-4 shadow-lg max-w-sm"
                role="alert"
                aria-live="polite"
              >
                <p className="text-sm">{toast}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white underline text-sm mt-2"
                  onClick={() => setToast(null)}
                  aria-label="Dismiss notification toast"
                >
                  Dismiss
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
            <StatsCard
              title="Attendance Records"
              value={
                attendanceRecords.length + practiceAttendanceRecords.length
              }
              icon={FileText}
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
                        placeholder="Search clubs, requests, or attendance..."
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
                        isLoading={requestLoading[request._id]}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Request History */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Membership Request History
                  {filteredAllRequests.length > 0 && (
                    <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {filteredAllRequests.length} total
                    </span>
                  )}
                </h2>
                {filteredAllRequests.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      No request history available.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredAllRequests.map((request) => (
                      <RequestHistoryCard key={request._id} request={request} />
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                        {unreadCount} unread
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {unreadCount > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleMarkAllAsRead}
                        className="px-4 py-2 bg-[#456882] text-white rounded-md text-sm font-medium hover:bg-[#334d5e]"
                        aria-label="Mark all notifications as read"
                      >
                        Mark All as Read
                      </motion.button>
                    )}
                    <Link
                      to="/notifications"
                      className="px-4 py-2 bg-[#456882] text-white rounded-md text-sm font-medium hover:bg-[#334d5e]"
                    >
                      View All Notifications
                    </Link>
                  </div>
                </div>
                {notifications.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      No notifications available.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {notifications.map((notification) => (
                      <NotificationCard
                        key={notification._id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
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
