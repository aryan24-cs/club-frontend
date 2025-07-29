import React, { memo, useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Users,
  Calendar,
  Search,
  ChevronDown,
  Save,
  CheckCircle2,
  XCircle,
  User,
  Hash,
  AlertTriangle,
  Eye,
  Download,
  Filter,
  UserCheck,
  UserX,
  BookOpen,
  UserPlus,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import PresentStudentsModal from "./PresentStudentsModal";

// Backend base URL (use environment variable in production)
const BASE_URL = "http://localhost:5000";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
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
const StatsCard = memo(
  ({ title, value, icon: Icon, color = "text-[#456882]", bgColor = "bg-white" }) => (
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
  )
);

// Member Card Component
const MemberCard = memo(({ member, attendance, onToggleAttendance, index }) => {
  const isPresent = attendance[member._id] === "present";
  const isAbsent = attendance[member._id] === "absent";
  const isMarked = isPresent || isAbsent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group
        ${isPresent
          ? "bg-green-50 border-green-200 shadow-green-100/50"
          : isAbsent
            ? "bg-red-50 border-red-200 shadow-red-100/50"
            : "bg-white border-gray-200 hover:border-[#456882]/30 hover:shadow-lg"
        }
      `}
      onClick={() => onToggleAttendance(member._id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-[#456882] to-[#5a7a98] rounded-xl flex items-center justify-center text-white text-lg font-semibold shadow-md">
            {member.name?.charAt(0).toUpperCase() || "?"}
          </div>
          {isMarked && (
            <div
              className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${isPresent ? "bg-green-500" : "bg-red-500"
                }`}
            >
              {isPresent ? (
                <CheckCircle2 className="w-3 h-3 text-white" />
              ) : (
                <XCircle className="w-3 h-3 text-white" />
              )}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            {member.name || "Unknown"}
          </h3>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Hash className="w-3 h-3" />
            {member.rollNo || "N/A"}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <User className="w-3 h-3" />
            {member.email || "N/A"}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <GraduationCap className="w-3 h-3" />
            {member.branch || "N/A"} • Sem {member.semester || "N/A"} • {member.course || "N/A"} • {member.specialization || "N/A"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleAttendance(member._id, "present");
          }}
          className={`p-2 rounded-full transition-colors ${isPresent
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-green-100"
            }`}
          title="Mark Present"
        >
          <UserCheck className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleAttendance(member._id, "absent");
          }}
          className={`p-2 rounded-full transition-colors ${isAbsent
              ? "bg-red-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-red-100"
            }`}
          title="Mark Absent"
        >
          <UserX className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
});

// Add Student Modal
const AddStudentModal = ({ isOpen, onClose, onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNo: "",
    branch: "",
    semester: "",
    course: "",
    specialization: "",
  });
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required.";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Valid email is required.";
    }
    if (!formData.rollNo.trim()) return "Roll number is required.";
    if (!formData.branch.trim()) return "Branch is required.";
    if (!formData.semester || isNaN(formData.semester) || formData.semester < 1 || formData.semester > 8) {
      return "Valid semester (1-8) is required.";
    }
    if (!formData.course.trim()) return "Course is required.";
    if (!formData.specialization.trim()) return "Specialization is required.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    await onSubmit(formData);
    setFormData({ name: "", email: "", rollNo: "", branch: "", semester: "", course: "", specialization: "" });
  };

  if (!isOpen) return null;

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
        className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Add New Student</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
              placeholder="Enter student name"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
              placeholder="Enter student email"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roll Number
            </label>
            <input
              type="text"
              name="rollNo"
              value={formData.rollNo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
              placeholder="Enter roll number"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
              placeholder="Enter branch (e.g., CSE)"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester
            </label>
            <input
              type="number"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
              placeholder="Enter semester (1-8)"
              min="1"
              max="8"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course
            </label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
              disabled={isLoading}
            >
              <option value="">Select a course</option>
              {["BTech", "BCA", "BBA", "MBA"].map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization
            </label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
              placeholder="Enter specialization (e.g., Computer Science)"
              disabled={isLoading}
            />
          </div>
          {formError && (
            <p className="text-red-600 text-sm flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {formError}
            </p>
          )}
          {error && (
            <p className="text-red-600 text-sm flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-xl hover:bg-[#5a7a98] transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              <UserPlus className="w-5 h-5" />
              Add Student
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Practice Attendance Modal
const PracticeAttendanceModal = ({ isOpen, onClose, onSubmit, isLoading, error, lectures, members, selectedClub }) => {
  const [lecture, setLecture] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [roomNo, setRoomNo] = useState("");
  const [practiceAttendance, setPracticeAttendance] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPracticeAttendance(
        members.reduce(
          (acc, member) => ({
            ...acc,
            [member._id]: null,
          }),
          {}
        )
      );
      setLecture("");
      setDate(new Date().toISOString().split("T")[0]);
      setRoomNo("");
      setFormError("");
    }
  }, [isOpen, members]);

  const validateForm = () => {
    if (!selectedClub) return "Please select a club first.";
    if (!lecture) return "Please select a lecture.";
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Please select a valid date.";
    if (!roomNo.trim()) return "Room number is required.";
    if (Object.values(practiceAttendance).every((status) => status === null)) {
      return "Please mark attendance for at least one member.";
    }
    return "";
  };

  const handleTogglePracticeAttendance = (memberId, status = null) => {
    setPracticeAttendance((prev) => {
      const current = prev[memberId];
      if (status) {
        return { ...prev, [memberId]: status };
      }
      if (current === "present") return { ...prev, [memberId]: "absent" };
      if (current === "absent") return { ...prev, [memberId]: null };
      return { ...prev, [memberId]: "present" };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    const attendanceData = Object.entries(practiceAttendance)
      .filter(([_, status]) => status !== null)
      .map(([userId, status]) => ({ userId, status }));
    await onSubmit({ club: selectedClub, lecture, date, roomNo, attendance: attendanceData });
  };

  if (!isOpen) return null;

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
        className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Practice Session Attendance</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Lecture
            </label>
            <div className="relative">
              <select
                value={lecture}
                onChange={(e) => setLecture(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882] appearance-none bg-white"
                disabled={isLoading || lectures.length === 0}
                aria-label="Select a lecture"
              >
                <option value="">Select a lecture</option>
                {lectures.map((lec) => (
                  <option key={lec._id} value={lec._id}>
                    {lec.title}
                  </option>
                ))}
              </select>
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
                disabled={isLoading}
                max={new Date().toISOString().split("T")[0]}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Number
            </label>
            <input
              type="text"
              value={roomNo}
              onChange={(e) => setRoomNo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
              placeholder="Enter room number (e.g., Room 101)"
              disabled={isLoading}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mark Attendance</h3>
            {members.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No members available.
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {members.map((member, index) => (
                  <MemberCard
                    key={member._id}
                    member={member}
                    attendance={practiceAttendance}
                    onToggleAttendance={handleTogglePracticeAttendance}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
          {formError && (
            <p className="text-red-600 text-sm flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {formError}
            </p>
          )}
          {error && (
            <p className="text-red-600 text-sm flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-xl hover:bg-[#5a7a98] transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              <Save className="w-5 h-5" />
              Save Attendance
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const AttendanceTracker = () => {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [lectures, setLectures] = useState([]);
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [showPresentModal, setShowPresentModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState({ id: null, type: null });
  const navigate = useNavigate();

  // Calculate stats
  const stats = useMemo(() => {
    const total = members.length;
    const presentCount = Object.values(attendance).filter((s) => s === "present").length;
    const absentCount = Object.values(attendance).filter((s) => s === "absent").length;
    const totalMarked = presentCount + absentCount;
    const attendanceRate = total > 0 ? ((presentCount / total) * 100).toFixed(1) : 0;
    return { presentCount, absentCount, totalMarked, attendanceRate };
  }, [attendance, members]);

  // Validate inputs for event attendance
  const validateEventInputs = () => {
    if (!selectedClub) return "Please select a club.";
    if (!selectedEvent) return "Please select an event.";
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Please select a valid date.";
    if (Object.values(attendance).every((status) => status === null)) {
      return "Please mark attendance for at least one member.";
    }
    return "";
  };

  // Fetch user and clubs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          navigate("/login");
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [userResponse, clubsResponse] = await Promise.all([
          axios.get(`${BASE_URL}/api/auth/user`, config).catch((err) => {
            throw new Error(`User fetch failed: ${err.response?.data?.error || err.message}`);
          }),
          axios.get(`${BASE_URL}/api/clubs`, config).catch((err) => {
            throw new Error(`Clubs fetch failed: ${err.response?.data?.error || err.message}`);
          }),
        ]);

        const userData = userResponse.data;
        if (!userData?._id) {
          setError("Invalid user data received.");
          navigate("/login");
          return;
        }
        setUser(userData);

        const isSuperAdmin = userData.isAdmin;
        const isHeadCoordinator = userData.isHeadCoordinator && Array.isArray(userData.headCoordinatorClubs) && userData.headCoordinatorClubs.length > 0;
        const allowedClubIds = userData.superAdminClubs || [];
        const allowedClubNames = userData.headCoordinatorClubs || [];

        if (!isSuperAdmin && !isHeadCoordinator) {
          setError("You are not authorized to access this page.");
          navigate("/dashboard");
          return;
        }

        let filteredClubs = Array.isArray(clubsResponse.data) ? clubsResponse.data : [];
        filteredClubs = filteredClubs.filter((club) => {
          if (isSuperAdmin && allowedClubIds.length > 0) {
            return allowedClubIds.includes(club._id);
          }
          if (isHeadCoordinator) {
            return allowedClubNames.includes(club.name);
          }
          return isSuperAdmin;
        });

        if (filteredClubs.length === 0) {
          setError("No clubs assigned to you.");
          navigate("/dashboard");
          return;
        }

        setClubs(filteredClubs);
        if (filteredClubs.length > 0 && filteredClubs[0]?._id) {
          setSelectedClub(filteredClubs[0]._id);
        } else {
          setError("No valid clubs found.");
        }
      } catch (err) {
        console.error("Fetch data error:", err);
        setError(err.message || "Failed to load data. Please try again.");
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Fetch events for selected club
  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedClub) {
        setEvents([]);
        setSelectedEvent("");
        return;
      }
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/api/events`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { club: selectedClub },
        }).catch((err) => {
          throw new Error(`Events fetch failed: ${err.response?.data?.error || err.message}`);
        });
        const formattedEvents = Array.isArray(response.data)
          ? response.data.map((event) => ({
            _id: event._id || `event-${Date.now()}`,
            title: event.title || "N/A",
            date: event.date ? new Date(event.date).toISOString().split("T")[0] : "N/A",
          }))
          : [];
        setEvents(formattedEvents);
        if (formattedEvents.length > 0 && formattedEvents[0]?._id) {
          setSelectedEvent(formattedEvents[0]._id);
        } else {
          setSelectedEvent("");
        }
      } catch (err) {
        console.error("Fetch events error:", err);
        setError(err.message || "Failed to load events.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [selectedClub]);

  // Fetch lectures for selected club
  useEffect(() => {
    const fetchLectures = async () => {
      if (!selectedClub) {
        setLectures([]);
        return;
      }
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/api/lectures`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { club: selectedClub },
        }).catch((err) => {
          throw new Error(`Lectures fetch failed: ${err.response?.data?.error || err.message}`);
        });
        const formattedLectures = Array.isArray(response.data)
          ? response.data.map((lecture) => ({
            _id: lecture._id || `lecture-${Date.now()}`,
            title: lecture.title || "N/A",
          }))
          : [];
        setLectures(formattedLectures);
      } catch (err) {
        console.error("Fetch lectures error:", err);
        setError(err.message || "Failed to load lectures.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLectures();
  }, [selectedClub]);

  // Fetch members for selected club
  const fetchMembers = useCallback(async () => {
    if (!selectedClub) {
      setMembers([]);
      setAttendance({});
      return;
    }
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/clubs/${selectedClub}/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch((err) => {
        throw new Error(`Members fetch failed: ${err.response?.data?.error || err.message}`);
      });
      const formattedMembers = Array.isArray(response.data)
        ? response.data.map((member) => ({
          _id: member._id || `member-${Date.now()}`,
          name: member.name || "N/A",
          email: member.email || "N/A",
          rollNo: member.rollNo || "N/A",
          branch: member.branch || "N/A",
          semester: member.semester || "N/A",
          course: member.course || "N/A",
          specialization: member.specialization || "N/A",
        }))
        : [];
      console.log("Fetched members:", formattedMembers); // Debug log
      setMembers(formattedMembers);
      setAttendance(
        formattedMembers.reduce(
          (acc, member) => ({
            ...acc,
            [member._id]: null,
          }),
          {}
        )
      );
    } catch (err) {
      console.error("Fetch members error:", err);
      setError(err.message || "Failed to load members.");
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedClub, navigate]);

  // Fetch attendance history
  const fetchAttendanceHistory = useCallback(async () => {
    if (!selectedClub) {
      setAttendanceHistory([]);
      return;
    }
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const [eventAttendanceResponse, practiceAttendanceResponse] = await Promise.all([
        axios.get(`${BASE_URL}/api/attendance`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { club: selectedClub },
        }).catch((err) => {
          throw new Error(`Event attendance history fetch failed: ${err.response?.data?.error || err.message}`);
        }),
        axios.get(`${BASE_URL}/api/practice-attendance`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { club: selectedClub },
        }).catch((err) => {
          throw new Error(`Practice attendance history fetch failed: ${err.response?.data?.error || err.message}`);
        }),
      ]);

      const formattedEventHistory = Array.isArray(eventAttendanceResponse.data)
        ? eventAttendanceResponse.data.map((record) => ({
          ...record,
          _id: record._id || `record-${Date.now()}`,
          date: record.date ? new Date(record.date).toISOString().split("T")[0] : "N/A",
          type: "event",
          title: record.event?.title || "N/A",
          idForPresent: record._id,
          docLink: `/api/attendance/${record._id}/report`,
        }))
        : [];

      const formattedPracticeHistory = Array.isArray(practiceAttendanceResponse.data)
        ? practiceAttendanceResponse.data.map((record) => ({
          ...record,
          _id: record._id || `practice-record-${Date.now()}`,
          date: record.date ? new Date(record.date).toISOString().split("T")[0] : "N/A",
          type: "practice",
          title: record.lecture?.title || "N/A",
          idForPresent: record._id,
          roomNo: record.roomNo || "N/A",
          docLink: `/api/practice-attendance/${record._id}/report`,
        }))
        : [];

      const combinedHistory = [...formattedEventHistory, ...formattedPracticeHistory].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setAttendanceHistory(combinedHistory);
    } catch (err) {
      console.error("Fetch history error:", err);
      setError(err.message || "Failed to load attendance history.");
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedClub, navigate]);

  useEffect(() => {
    if (showHistory) {
      fetchAttendanceHistory();
    }
  }, [showHistory, fetchAttendanceHistory]);

  // Handle attendance toggle for events
  const handleToggleAttendance = useCallback((memberId, status = null) => {
    setAttendance((prev) => {
      const current = prev[memberId];
      if (status) {
        return { ...prev, [memberId]: status };
      }
      if (current === "present") return { ...prev, [memberId]: "absent" };
      if (current === "absent") return { ...prev, [memberId]: null };
      return { ...prev, [memberId]: "present" };
    });
  }, []);

  // Handle adding new student
  const handleAddStudent = async (formData) => {
    if (!selectedClub) {
      setError("Please select a club first.");
      return;
    }
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/api/clubs/${selectedClub}/add-student`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch((err) => {
        throw new Error(`Add student failed: ${err.response?.data?.error || err.message}`);
      });
      setSuccess("Student added successfully!");
      setShowAddStudentModal(false);
      await fetchMembers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Add student error:", err);
      setError(err.message || "Failed to add student.");
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle event attendance submission
  const handleEventAttendanceSubmit = async () => {
    const validationError = validateEventInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const attendanceData = Object.entries(attendance)
        .filter(([_, status]) => status !== null)
        .map(([userId, status]) => ({ userId, status }));

      console.log("Submitting attendance data:", attendanceData); // Debug log

      // Validate user IDs before sending
      const validateResponse = await axios.post(
        `${BASE_URL}/api/users/validate`,
        { clubId: selectedClub, userIds: attendanceData.map((a) => a.userId) },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch((err) => {
        throw new Error(
          err.response?.data?.error || "Failed to validate user IDs. Please try again."
        );
      });

      const validUsers = validateResponse.data.validUsers || [];
      const invalidUserIds = validateResponse.data.invalidUserIds || [];

      if (validUsers.length === 0) {
        throw new Error(
          "No valid users found for attendance. Please ensure members exist in the system."
        );
      }

      if (invalidUserIds.length > 0) {
        console.warn("Invalid user IDs detected:", invalidUserIds);
        setError(
          `Some user IDs are invalid or not club members: ${invalidUserIds.join(", ")}`
        );
      }

      const validAttendance = attendanceData.filter((a) =>
        validUsers.map((user) => user._id.toString()).includes(a.userId)
      );

      if (validAttendance.length === 0) {
        throw new Error("No valid users found for attendance after validation.");
      }

      const response = await axios.post(
        `${BASE_URL}/api/attendance`,
        {
          club: selectedClub,
          event: selectedEvent,
          date,
          attendance: validAttendance,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch((err) => {
        throw new Error(
          `Save attendance failed: ${err.response?.data?.error || err.message}`
        );
      });

      setSuccess("Attendance recorded successfully!");
      setAttendance(
        members.reduce(
          (acc, member) => ({
            ...acc,
            [member._id]: null,
          }),
          {}
        )
      );
      setTimeout(() => setSuccess(""), 3000);
      if (showHistory) {
        fetchAttendanceHistory();
      }
    } catch (err) {
      console.error("Save attendance error:", err);
      setError(err.message || "Failed to save attendance.");
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle practice session attendance submission
  const handlePracticeAttendanceSubmit = async (data) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      // Validate user IDs before sending
      const validateResponse = await axios.post(
        `${BASE_URL}/api/users/validate`,
        { clubId: data.club, userIds: data.attendance.map((a) => a.userId) },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch((err) => {
        throw new Error(
          err.response?.data?.error || "Failed to validate user IDs. Please try again."
        );
      });

      const validUsers = validateResponse.data.validUsers || [];
      const invalidUserIds = validateResponse.data.invalidUserIds || [];

      if (validUsers.length === 0) {
        throw new Error(
          "No valid users found for practice attendance. Please ensure members exist in the system."
        );
      }

      if (invalidUserIds.length > 0) {
        console.warn("Invalid user IDs detected:", invalidUserIds);
        setError(
          `Some user IDs are invalid or not club members: ${invalidUserIds.join(", ")}`
        );
      }

      const validAttendance = data.attendance.filter((a) =>
        validUsers.map((user) => user._id.toString()).includes(a.userId)
      );

      if (validAttendance.length === 0) {
        throw new Error("No valid users found for practice attendance after validation.");
      }

      const response = await axios.post(
        `${BASE_URL}/api/practice-attendance`,
        { ...data, attendance: validAttendance },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch((err) => {
        throw new Error(
          `Save practice attendance failed: ${err.response?.data?.error || err.message}`
        );
      });

      setSuccess("Practice session attendance recorded successfully!");
      setShowPracticeModal(false);
      setTimeout(() => setSuccess(""), 3000);
      if (showHistory) {
        fetchAttendanceHistory();
      }
    } catch (err) {
      console.error("Save practice attendance error:", err);
      setError(err.message || "Failed to save practice attendance.");
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Download attendance as CSV
  const downloadCSV = () => {
    const headers = ["Name", "Roll No", "Email", "Branch", "Semester", "Course", "Specialization", "Attendance"];
    const rows = filteredMembers.map((member) => [
      `"${member.name || "N/A"}"`,
      `"${member.rollNo || "N/A"}"`,
      `"${member.email || "N/A"}"`,
      `"${member.branch || "N/A"}"`,
      `"${member.semester || "N/A"}"`,
      `"${member.course || "N/A"}"`,
      `"${member.specialization || "N/A"}"`,
      attendance[member._id] || "Not Marked",
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `attendance_${selectedClub}_${selectedEvent}_${date}.csv`
    );
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(
      (member) =>
        member.name?.toLowerCase().includes(query) ||
        member.rollNo?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.branch?.toLowerCase().includes(query) ||
        member.semester?.toString().includes(query) ||
        member.course?.toLowerCase().includes(query) ||
        member.specialization?.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#456882] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-[#456882]" />
              Attendance Tracker
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPracticeModal(true)}
                className="px-4 py-2 bg-[#456882] text-white rounded-full hover:bg-[#5a7a98] transition-colors flex items-center gap-2"
                disabled={isLoading || !selectedClub}
                title={selectedClub ? "Take Practice Session Attendance" : "Select a club first"}
              >
                <BookOpen className="w-5 h-5" />
                Practice Session
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 bg-[#456882] text-white rounded-full hover:bg-[#5a7a98] transition-colors flex items-center gap-2"
              >
                <Eye className="w-5 h-5" />
                {showHistory ? "Hide History" : "View History"}
              </button>
            </div>
          </motion.div>

          {/* Error and Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modals */}
          <AddStudentModal
            isOpen={showAddStudentModal}
            onClose={() => setShowAddStudentModal(false)}
            onSubmit={handleAddStudent}
            isLoading={isLoading}
            error={error}
          />
          <PracticeAttendanceModal
            isOpen={showPracticeModal}
            onClose={() => setShowPracticeModal(false)}
            onSubmit={handlePracticeAttendanceSubmit}
            isLoading={isLoading}
            error={error}
            lectures={lectures}
            members={filteredMembers}
            selectedClub={selectedClub}
          />
          <PresentStudentsModal
            isOpen={showPresentModal}
            onClose={() => setShowPresentModal(false)}
            recordId={selectedRecord.id}
            type={selectedRecord.type}
          />

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form and Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-[#456882]" />
                  Event Attendance
                </h2>
                {clubs.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    No clubs available.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Club
                      </label>
                      <div className="relative">
                        <select
                          value={selectedClub}
                          onChange={(e) => {
                            setSelectedClub(e.target.value);
                            setSelectedEvent("");
                          }}
                          className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882] appearance-none bg-white"
                          disabled={isLoading}
                          aria-label="Select a club"
                        >
                          <option value="">Select a club</option>
                          {clubs.map((club) => (
                            <option
                              key={club._id || `club-${Date.now()}`}
                              value={club._id}
                            >
                              {club.name || "N/A"}
                            </option>
                          ))}
                        </select>
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Event
                      </label>
                      <div className="relative">
                        <select
                          value={selectedEvent}
                          onChange={(e) => setSelectedEvent(e.target.value)}
                          className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882] appearance-none bg-white"
                          disabled={isLoading || events.length === 0}
                          aria-label="Select an event"
                        >
                          <option value="">Select an event</option>
                          {events.map((event) => (
                            <option
                              key={event._id || `event-${Date.now()}`}
                              value={event._id}
                            >
                              {event.title} ({event.date})
                            </option>
                          ))}
                        </select>
                        <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={date || ""}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full pl-10 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
                          disabled={isLoading}
                          max={new Date().toISOString().split("T")[0]}
                        />
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <button
                      onClick={handleEventAttendanceSubmit}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-xl hover:bg-[#5a7a98] transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      <Save className="w-5 h-5" />
                      Save Event Attendance
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Event Attendance Stats
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <StatsCard
                    title="Total Members"
                    value={members.length}
                    icon={Users}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                  />
                  <StatsCard
                    title="Present"
                    value={stats.presentCount}
                    icon={UserCheck}
                    color="text-green-600"
                    bgColor="bg-green-50"
                  />
                  <StatsCard
                    title="Absent"
                    value={stats.absentCount}
                    icon={UserX}
                    color="text-red-600"
                    bgColor="bg-red-50"
                  />
                  <StatsCard
                    title="Attendance Rate"
                    value={`${stats.attendanceRate}%`}
                    icon={BookOpen}
                    color="text-[#456882]"
                    bgColor="bg-gray-50"
                  />
                </div>
              </motion.div>
            </div>

            {/* Members and History */}
            <div className="lg:col-span-2 space-y-6">
              {!showHistory ? (
                <>
                  {/* Search Bar */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                  >
                    <input
                      type="text"
                      placeholder="Search by name, roll no, email, branch, etc..."
                      value={searchQuery || ""}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
                      disabled={isLoading}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </motion.div>

                  {/* Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-end gap-2"
                  >
                    <button
                      onClick={() => setShowAddStudentModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-xl hover:bg-[#5a7a98] transition-colors"
                      disabled={isLoading || !selectedClub}
                      title={selectedClub ? "Add new student" : "Select a club first"}
                    >
                      <UserPlus className="w-5 h-5" />
                      Add Student
                    </button>
                    <button
                      onClick={downloadCSV}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                      disabled={isLoading || filteredMembers.length === 0}
                    >
                      <Download className="w-5 h-5" />
                      Download CSV
                    </button>
                  </motion.div>

                  {/* Members List */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Members ({filteredMembers.length})
                    </h2>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-[#456882] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : filteredMembers.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No members found.
                      </p>
                    ) : (
                      <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                        {filteredMembers.map((member, index) => (
                          <MemberCard
                            key={member._id}
                            member={member}
                            attendance={attendance}
                            onToggleAttendance={handleToggleAttendance}
                            index={index}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Attendance History
                  </h2>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-4 border-[#456882] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : attendanceHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No attendance records found.
                    </p>
                  ) : (
                    <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                      {attendanceHistory.map((record) => (
                        <motion.div
                          key={record._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-xl border border-gray-200 bg-gray-50"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {record.club?.name || "N/A"} - {record.title}
                              {record.type === "practice" && ` (Room: ${record.roomNo})`}
                            </h3>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-500">
                                {record.date}
                              </p>
                              <button
                                onClick={() => {
                                  setSelectedRecord({
                                    id: record.idForPresent,
                                    type: record.type,
                                  });
                                  setShowPresentModal(true);
                                }}
                                className="px-3 py-1 bg-[#456882] text-white rounded-full hover:bg-[#5a7a98] transition-colors text-sm flex items-center gap-1"
                                disabled={isLoading}
                              >
                                <UserCheck className="w-4 h-4" />
                                Present
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <p>
                              <span className="font-medium">Type:</span>{" "}
                              {record.type === "event" ? "Event" : "Practice Session"}
                            </p>
                            <p>
                              <span className="font-medium">Present:</span>{" "}
                              {record.stats?.presentCount || 0}
                            </p>
                            <p>
                              <span className="font-medium">Absent:</span>{" "}
                              {record.stats?.absentCount || 0}
                            </p>
                            <p>
                              <span className="font-medium">
                                Attendance Rate:
                              </span>{" "}
                              {record.stats?.attendanceRate || 0}%
                            </p>
                            <p>
                              <span className="font-medium">Marked By:</span>{" "}
                              {record.createdBy?.name || "N/A"}
                            </p>
                            {record.docLink && (
                              <p>
                                <a
                                  href={`${BASE_URL}${record.docLink}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#456882] hover:underline flex items-center gap-1"
                                >
                                  <Download className="w-4 h-4" />
                                  Download Report
                                </a>
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AttendanceTracker;