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
  UserPlus,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { debounce } from "lodash";
import Navbar from "../Navbar";

// Backend base URL
const BASE_URL = "https://club-manager-3k6y.vercel.app";

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
const StatsCard = memo(
  ({
    title,
    value,
    icon: Icon,
    color = "text-[#456882]",
    bgColor = "bg-white",
  }) => (
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

  const handleToggle = (e, status) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`MemberCard - Toggling attendance for ${member.name} to ${status}`);
    onToggleAttendance(member._id, status);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 cursor-default group
        ${isPresent
          ? "bg-green-50 border-green-200 shadow-green-100/50"
          : isAbsent
            ? "bg-red-50 border-red-200 shadow-red-100/50"
            : "bg-white border-gray-200 hover:border-[#456882]/30 hover:shadow-lg"
        }
      `}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-[#456882] to-[#5a7a98] rounded-xl flex items-center justify-center text-white text-lg font-semibold shadow-md">
            {member.name?.charAt(0).toUpperCase() || "?"}
          </div>
          {isMarked && (
            <div
              className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${isPresent ? "bg-green-500" : "bg-red-500"}`}
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
            Roll No: {member.rollNo || "N/A"}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <User className="w-3 h-3" />
            {member.email || "N/A"}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <GraduationCap className="w-3 h-3" />
            {member.isACEMStudent ? "ACEM Student" : "Non-ACEM Student"} • {member.branch || "N/A"} • Sem {member.semester || "N/A"} • {member.course || "N/A"} • {member.specialization || "N/A"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => handleToggle(e, "present")}
          className={`p-2 rounded-full transition-colors ${isPresent ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-green-100"}`}
          title="Mark Present"
          aria-label={`Mark ${member.name || "student"} as present`}
        >
          <UserCheck className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => handleToggle(e, "absent")}
          className={`p-2 rounded-full transition-colors ${isAbsent ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-red-100"}`}
          title="Mark Absent"
          aria-label={`Mark ${member.name || "student"} as absent`}
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
    isACEMStudent: true,
  });
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFormError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required.";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Valid email is required.";
    }
    if (formData.isACEMStudent && !formData.rollNo.trim()) return "Roll number is required for ACEM students.";
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
    console.log("AddStudentModal - Submitting form:", formData);
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      console.log("AddStudentModal - Validation failed:", validationError);
      return;
    }
    await onSubmit(formData);
    setFormData({
      name: "",
      email: "",
      rollNo: "",
      branch: "",
      semester: "",
      course: "",
      specialization: "",
      isACEMStudent: true,
    });
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
            aria-label="Close modal"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}
        {formError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
              placeholder="Enter student name"
              disabled={isLoading}
              aria-label="Student name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
              placeholder="Enter student email"
              disabled={isLoading}
              aria-label="Student email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ACEM Student</label>
            <input
              type="checkbox"
              name="isACEMStudent"
              checked={formData.isACEMStudent}
              onChange={handleChange}
              className="h-4 w-4 text-[#456882] focus:ring-[#456882] border-gray-300 rounded"
              disabled={isLoading}
              aria-label="ACEM student status"
            />
          </div>
          {formData.isACEMStudent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
              <input
                type="text"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
                placeholder="Enter roll number"
                disabled={isLoading}
                aria-label="Student roll number"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
              placeholder="Enter branch (e.g., CSE)"
              disabled={isLoading}
              aria-label="Student branch"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
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
              aria-label="Student semester"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
              disabled={isLoading}
              aria-label="Student course"
            >
              <option value="">Select a course</option>
              {["BTech", "BCA", "BBA", "MBA"].map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
              placeholder="Enter specialization (e.g., AI)"
              disabled={isLoading}
              aria-label="Student specialization"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
              disabled={isLoading}
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#456882] text-white rounded-full hover:bg-[#5a7a98] transition-colors flex items-center gap-2"
              disabled={isLoading}
              aria-label="Add student"
            >
              {isLoading ? "Adding..." : "Add Student"}
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Practice Attendance Modal
const PracticeAttendanceModal = ({
  isOpen,
  onClose,
  onSubmit,
  onAddStudent,
  isLoading,
  error,
  members,
  selectedClub,
  attendance,
  setAttendance,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    roomNo: "",
  });
  const [formError, setFormError] = useState("");
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log("PracticeAttendanceModal - Opened, resetting state");
      setFormData({
        title: "",
        date: new Date().toISOString().split("T")[0],
        roomNo: "",
      });
      setFormError("");
      setAttendance(
        members.reduce(
          (acc, member) => ({
            ...acc,
            [member._id]: null,
          }),
          {}
        )
      );
    }
  }, [isOpen, members, setAttendance]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError("");
  };

  const validateForm = () => {
    if (!selectedClub) return "Please select a club first.";
    if (!formData.title.trim()) return "Title is required.";
    if (!formData.date || !/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
      return "Valid date (YYYY-MM-DD) is required.";
    }
    const selectedDate = new Date(formData.date);
    if (selectedDate > new Date()) return "Date cannot be in the future.";
    if (!formData.roomNo.trim()) return "Room number is required.";
    if (Object.values(attendance).every((status) => status === null)) {
      return "Please mark attendance for at least one member.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("PracticeAttendanceModal - Save button clicked, validating form...");
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      console.log("PracticeAttendanceModal - Validation failed:", validationError);
      return;
    }
    console.log("PracticeAttendanceModal - Form validated, submitting data:", {
      club: selectedClub,
      title: formData.title,
      date: formData.date,
      roomNo: formData.roomNo,
      attendance: Object.entries(attendance).filter(([_, status]) => status),
    });
    await onSubmit(formData);
  };

  const handleToggleAttendance = (memberId, status) => {
    console.log(`PracticeAttendanceModal - Updating attendance for member ${memberId} to ${status}`);
    setAttendance((prev) => ({
      ...prev,
      [memberId]: status,
    }));
  };

  const handleAddStudentSubmit = async (formData) => {
    await onAddStudent(formData);
    setIsAddStudentModalOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
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
          className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#456882] scrollbar-track-gray-100"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Practice Session Attendance</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          )}
          {formError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
                placeholder="Enter session title (e.g., Weekly Practice)"
                disabled={isLoading}
                aria-label="Session title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full pl-10 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
                  disabled={isLoading}
                  max={new Date().toISOString().split("T")[0]}
                  aria-label="Session date"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
              <input
                type="text"
                name="roomNo"
                value={formData.roomNo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
                placeholder="Enter room number (e.g., Room 101)"
                disabled={isLoading}
                aria-label="Room number"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Mark Attendance</h3>
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(true)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors flex items-center gap-2"
                  disabled={isLoading || !selectedClub}
                  title={selectedClub ? "Add Student" : "Select a club first"}
                  aria-label="Add student"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Student
                </button>
              </div>
              {members.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No members available.</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#456882] scrollbar-track-gray-100">
                  {members.map((member, index) => (
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
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                disabled={isLoading}
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#456882] text-white rounded-full hover:bg-[#5a7a98] transition-colors flex items-center gap-2"
                disabled={isLoading}
                aria-label="Save practice attendance"
              >
                {isLoading ? "Saving..." : "Save Attendance"}
                <Save className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onSubmit={handleAddStudentSubmit}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
};

// Present Students Modal
// Present Students Modal
const PresentStudentsModal = ({ isOpen, onClose, recordId, type }) => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timestamp, setTimestamp] = useState("");

  const fetchPresentStudents = useCallback(async () => {
    if (!recordId) {
      setError("Invalid record ID.");
      setIsLoading(false);
      console.error("fetchPresentStudents: Invalid recordId provided", { recordId, type });
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      console.log(`Fetching present students for recordId: ${recordId}, type: ${type}`);
      const endpoint = type === "practice" 
        ? `/api/practice-attendance/${recordId}/present`
        : `/api/attendance/${recordId}/present`;
      const response = await api.get(endpoint);
      console.log("fetchPresentStudents Response:", response.data);
      if (!response.data.presentStudents) {
        throw new Error("No present students data returned from the server.");
      }
      setStudents(response.data.presentStudents || []);
      setTimestamp(response.data.date ? new Date(response.data.date).toLocaleString() : "N/A");
    } catch (err) {
      let errorMessage;
      if (err.response?.status === 404) {
        errorMessage = `Record not found for ID ${recordId}. It may have been deleted or does not exist.`;
      } else if (err.response?.status === 500) {
        errorMessage = `Server error while fetching present students for ${type} record. Please contact support or try again later.`;
      } else {
        errorMessage = err.response?.data?.error || "Failed to load present students. Please try again later.";
      }
      setError(errorMessage);
      console.error("PresentStudentsModal Error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        endpoint: type === "practice" 
          ? `/api/practice-attendance/${recordId}/present`
          : `/api/attendance/${recordId}/present`,
      });
    } finally {
      setIsLoading(false);
    }
  }, [recordId, type]);

  useEffect(() => {
    if (isOpen && recordId) {
      fetchPresentStudents();
    }
  }, [isOpen, recordId, fetchPresentStudents]);

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
        className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Present Students</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <div className="mb-4 text-sm text-gray-600 flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          Recorded at: {timestamp}
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : students.length === 0 ? (
          <div className="text-center text-gray-600">No students marked present for this record.</div>
        ) : (
          <div className="space-y-3">
            {students.map((student, index) => (
              <div
                key={student._id || `student-${index}`}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#456882] to-[#5a7a98] rounded-xl flex items-center justify-center text-white text-lg font-semibold">
                  {student.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{student.name || "Unknown"}</p>
                  <p className="text-xs text-gray-500">Roll No: {student.rollNo || "N/A"}</p>
                  <p className="text-xs text-gray-500">{student.email || "N/A"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
            aria-label="Close"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
// Main Attendance Tracker Component
const AttendanceTracker = () => {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [practiceAttendanceHistory, setPracticeAttendanceHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [isPresentStudentsModalOpen, setIsPresentStudentsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState({ id: null, type: null });
  const [isLoading, setIsLoading] = useState({
    user: false,
    clubs: false,
    events: false,
    members: false,
    attendance: false,
    practice: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const debouncedSetSearchQuery = useCallback(
    debounce((value) => setSearchQuery(value), 300),
    []
  );

  const errorMessages = {
    "Club not found": "The selected club no longer exists. Please select another.",
    "Event not found": "The selected event is unavailable. Please try again.",
    "Access denied": "You do not have permission to access this club.",
    "Record not found": "The attendance record does not exist.",
    "Invalid record ID": "Cannot process request: Invalid attendance record ID.",
  };

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
      const userData = response.data;
      setUser({
        ...userData,
        isACEMStudent: userData.isACEMStudent || false,
        rollNo: userData.rollNo || "N/A",
        superAdminClubs: Array.isArray(userData.superAdminClubs) ? userData.superAdminClubs : [],
        headCoordinatorClubs: Array.isArray(userData.headCoordinatorClubs) ? userData.headCoordinatorClubs : [],
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load user data.");
      console.error("fetchUser Error:", err);
    } finally {
      setIsLoading((prev) => ({ ...prev, user: false }));
    }
  }, []);

  const fetchClubs = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, clubs: true }));
    setError("");
    try {
      const [clubsResponse, userResponse] = await Promise.all([
        fetchWithRetry("/api/clubs"),
        fetchWithRetry("/api/auth/user"),
      ]);
      const userData = userResponse.data;
      console.log("AttendanceTracker - User Data:", {
        _id: userData._id || "undefined",
        name: userData.name || "undefined",
        email: userData.email || "undefined",
        isAdmin: userData.isAdmin || false,
        headCoordinatorClubs: userData.headCoordinatorClubs || [],
        isACEMStudent: userData.isACEMStudent || false,
        rollNo: userData.rollNo || "N/A",
      });
      console.log("AttendanceTracker - Raw Clubs Response:", clubsResponse.data);

      if (!userData._id || !userData.email) {
        throw new Error("Invalid user data: missing _id or email.");
      }

      const isHeadCoordinator = Array.isArray(userData.headCoordinatorClubs) && userData.headCoordinatorClubs.length > 0;

      console.log("AttendanceTracker - Roles:", {
        isHeadCoordinator,
        userId: userData._id,
        userEmail: userData.email,
      });

      let filteredClubs = clubsResponse.data.filter((club) => {
        const isSuperAdmin = club.superAdmins?.some(
          (admin) => admin._id && admin._id.toString() === userData._id.toString()
        );
        const isHeadCoordinatorForClub = isHeadCoordinator && userData.headCoordinatorClubs.includes(club.name);
        const isCreator = club.creator && club.creator._id && club.creator._id.toString() === userData._id.toString();
        return isSuperAdmin || isHeadCoordinatorForClub || isCreator;
      });

      console.log("AttendanceTracker - Filtered Clubs:", filteredClubs);

      console.log("AttendanceTracker - Filtering Details:", {
        totalClubs: clubsResponse.data.length,
        filteredClubCount: filteredClubs.length,
        filteredClubNames: filteredClubs.map((club) => club.name),
      });

      const formattedClubs = Array.isArray(filteredClubs)
        ? filteredClubs.map((club) => ({
          ...club,
          _id: club._id || `club-${Date.now()}`,
          name: club.name || "Unknown",
          creator: club.creator || { _id: "unknown" },
          superAdmins: club.superAdmins || [],
          headCoordinators: club.headCoordinators || [],
        }))
        : [];
      setClubs(formattedClubs);

      if (formattedClubs.length > 0) {
        setSelectedClub(formattedClubs[0]._id);
        console.log("AttendanceTracker - Selected first club:", formattedClubs[0].name);
      } else {
        let errorMessage = "You do not have permission to access any clubs.";
        if (clubsResponse.data.length > 0) {
          errorMessage = "You are not a creator, super admin, or head coordinator for any clubs.";
        } else {
          errorMessage = "No clubs exist in the system. Please create a club.";
        }
        setError(errorMessage);
        console.log("AttendanceTracker - No clubs available:", errorMessage);
      }
    } catch (err) {
      const errorMsg = errorMessages[err.response?.data?.error] || `Failed to load clubs: ${err.message}`;
      setError(errorMsg);
      console.error("AttendanceTracker - fetchClubs Error:", err);
    } finally {
      setIsLoading((prev) => ({ ...prev, clubs: false }));
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!selectedClub) return;
    setIsLoading((prev) => ({ ...prev, events: true }));
    setError("");
    try {
      const response = await fetchWithRetry(`/api/events?club=${selectedClub}`);
      const formattedEvents = Array.isArray(response.data)
        ? response.data.map((event) => ({
          _id: event._id || `event-${Date.now()}`,
          title: event.title || "Untitled Event",
          date: event.date ? new Date(event.date).toISOString().split("T")[0] : "N/A",
          type: event.type || "event",
        }))
        : [];
      setEvents(formattedEvents);
      if (formattedEvents.length > 0) {
        setSelectedEvent(formattedEvents[0]._id);
      } else {
        setSelectedEvent("");
      }
    } catch (err) {
      setError(errorMessages[err.response?.data?.error] || "Failed to load events.");
      console.error("fetchEvents Error:", err);
    } finally {
      setIsLoading((prev) => ({ ...prev, events: false }));
    }
  }, [selectedClub]);

  const fetchMembers = useCallback(async () => {
    if (!selectedClub) {
      setMembers([]);
      setAttendance({});
      return;
    }
    setIsLoading((prev) => ({ ...prev, members: true }));
    setError("");
    try {
      const [membersResponse, clubResponse] = await Promise.all([
        fetchWithRetry(`/api/clubs/${selectedClub}/members`),
        fetchWithRetry(`/api/clubs/${selectedClub}`),
      ]);
      const club = clubResponse.data;
      const superAdmins = club.superAdmins?.map((admin) => admin._id) || [];
      const headCoordinators = club.headCoordinators?.map((hc) => hc._id) || [];
      const filteredMembers = Array.isArray(membersResponse.data)
        ? membersResponse.data
          .filter(
            (member) =>
              !superAdmins.includes(member._id) &&
              !headCoordinators.includes(member._id)
          )
          .map((member) => ({
            _id: member._id || `member-${Date.now()}`,
            name: member.name || "Unknown",
            email: member.email || "N/A",
            rollNo: member.rollNo || "N/A",
            branch: member.branch || "N/A",
            semester: member.semester || "N/A",
            course: member.course || "N/A",
            specialization: member.specialization || "N/A",
            isACEMStudent: member.isACEMStudent || false,
          }))
        : [];
      setMembers(filteredMembers);
      setAttendance((prev) =>
        filteredMembers.reduce(
          (acc, member) => ({
            ...acc,
            [member._id]: prev[member._id] || null,
          }),
          {}
        )
      );
    } catch (err) {
      setError(errorMessages[err.response?.data?.error] || "Failed to load members.");
      console.error("fetchMembers Error:", err);
    } finally {
      setIsLoading((prev) => ({ ...prev, members: false }));
    }
  }, [selectedClub]);

  const fetchAttendanceHistory = useCallback(async () => {
    if (!selectedClub) {
      setAttendanceHistory([]);
      setPracticeAttendanceHistory([]);
      return;
    }
    setIsLoading((prev) => ({ ...prev, attendance: true }));
    setError("");
    try {
      const [eventResponse, practiceResponse] = await Promise.all([
        fetchWithRetry(`/api/attendance?club=${selectedClub}`),
        fetchWithRetry(`/api/practice-attendance?club=${selectedClub}`),
      ]);
      const formattedEventHistory = Array.isArray(eventResponse.data)
        ? eventResponse.data
          .filter((record) => record._id && record.event)
          .map((record, index) => ({
            ...record,
            _id: record._id || `event-record-${index}-${Date.now()}`,
            date: record.date ? new Date(record.date).toISOString().split("T")[0] : "N/A",
            type: "event",
            eventType: (record.event?.type || "event").toLowerCase(),
            title: record.event?.title || "Untitled Event",
            totalPresent: record.attendance?.filter((a) => a.status === "present").length || 0,
            totalAbsent: record.attendance?.filter((a) => a.status === "absent").length || 0,
            attendanceRate:
              record.attendance?.length > 0
                ? (
                  (record.attendance.filter((a) => a.status === "present").length /
                    record.attendance.length) *
                  100
                ).toFixed(2)
                : 0,
          }))
        : [];
      const formattedPracticeHistory = Array.isArray(practiceResponse.data)
        ? practiceResponse.data
          .filter((record) => record._id)
          .map((record, index) => ({
            ...record,
            _id: record._id || `practice-record-${index}-${Date.now()}`,
            date: record.date ? new Date(record.date).toISOString().split("T")[0] : "N/A",
            type: "practice",
            eventType: "practice",
            title: record.title || "Untitled Practice",
            roomNo: record.roomNo || "N/A",
            totalPresent: record.attendance?.filter((a) => a.status === "present").length || 0,
            totalAbsent: record.attendance?.filter((a) => a.status === "absent").length || 0,
            attendanceRate:
              record.attendance?.length > 0
                ? (
                  (record.attendance.filter((a) => a.status === "present").length /
                    record.attendance.length) *
                  100
                ).toFixed(2)
                : 0,
          }))
        : [];
      setAttendanceHistory(formattedEventHistory);
      setPracticeAttendanceHistory(formattedPracticeHistory);
    } catch (err) {
      setError(errorMessages[err.response?.data?.error] || "Failed to load attendance history.");
      console.error("fetchAttendanceHistory Error:", err);
    } finally {
      setIsLoading((prev) => ({ ...prev, attendance: false }));
    }
  }, [selectedClub]);

  useEffect(() => {
    fetchUser();
    fetchClubs();
  }, [fetchUser, fetchClubs]);

  useEffect(() => {
    if (selectedClub && !clubs.find((c) => c._id === selectedClub)) {
      setSelectedClub(clubs[0]?._id || "");
    }
  }, [clubs, selectedClub]);

  useEffect(() => {
    setSearchQuery("");
    fetchEvents();
    fetchMembers();
    fetchAttendanceHistory();
  }, [selectedClub, fetchEvents, fetchMembers, fetchAttendanceHistory]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleToggleAttendance = useCallback((memberId, status = null) => {
    setAttendance((prev) => {
      const currentStatus = prev[memberId];
      if (status) {
        return { ...prev, [memberId]: status };
      }
      if (currentStatus === "present") {
        return { ...prev, [memberId]: "absent" };
      }
      if (currentStatus === "absent") {
        return { ...prev, [memberId]: null };
      }
      return { ...prev, [memberId]: "present" };
    });
  }, []);

  const handleSaveAttendance = async () => {
    if (!selectedClub || !selectedEvent) {
      setError("Please select a club and event.");
      return;
    }
    const attendanceData = Object.entries(attendance)
      .filter(([_, status]) => status)
      .map(([userId, status]) => ({ userId, status }));
    if (attendanceData.length === 0) {
      setError("No attendance data to save.");
      return;
    }
    setIsLoading((prev) => ({ ...prev, attendance: true }));
    setError("");
    try {
      const event = events.find((e) => e._id === selectedEvent);
      if (!event) {
        throw new Error("Selected event not found.");
      }
      console.log("handleSaveAttendance Request Data:", {
        club: selectedClub,
        event: selectedEvent,
        date: event.date,
        attendance: attendanceData,
      });
      const response = await fetchWithRetry("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: {
          club: selectedClub,
          event: selectedEvent,
          date: event.date,
          attendance: attendanceData,
        },
      });
      console.log("handleSaveAttendance Response:", JSON.stringify(response, null, 2));
      if (!response.data || !response.data.data || !response.data.data._id) {
        throw new Error(
          `Invalid response: Attendance record ID missing. Response: ${JSON.stringify(
            response.data
          )}`
        );
      }
      setSuccess("Attendance saved successfully!");
      setAttendance(
        members.reduce(
          (acc, member) => ({
            ...acc,
            [member._id]: null,
          }),
          {}
        )
      );
      await fetchAttendanceHistory();
      await generateDocxReport(
        { ...response.data.data, title: event.title, date: event.date },
        "event"
      );
    } catch (err) {
      const errorMsg =
        errorMessages[err.response?.data?.error] ||
        `Failed to save attendance: ${err.message}`;
      setError(errorMsg);
      console.error("handleSaveAttendance Error:", err, {
        responseData: err.response?.data,
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, attendance: false }));
    }
  };

  const handleAddStudent = async (formData) => {
    if (!selectedClub) {
      setError("Please select a club first.");
      return;
    }
    setIsLoading((prev) => ({ ...prev, members: true }));
    setError("");
    try {
      console.log("AttendanceTracker - Adding student:", formData);
      const response = await fetchWithRetry(`/api/clubs/${selectedClub}/add-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: formData,
      });
      console.log("AttendanceTracker - Student added successfully:", response.data);
      const newMember = {
        _id: response.data.user._id,
        name: response.data.user.name,
        email: response.data.user.email,
        rollNo: response.data.user.rollNo || "N/A",
        branch: response.data.user.branch || "N/A",
        semester: response.data.user.semester || "N/A",
        course: response.data.user.course || "N/A",
        specialization: response.data.user.specialization || "N/A",
        isACEMStudent: response.data.user.isACEMStudent || false,
      };
      setMembers((prev) => [...prev, newMember]);
      setAttendance((prev) => ({
        ...prev,
        [newMember._id]: null,
      }));
      setSuccess("Student added successfully!");
      setIsAddStudentModalOpen(false);
    } catch (err) {
      setError(errorMessages[err.response?.data?.error] || "Failed to add student.");
      console.error("handleAddStudent Error:", {
        message: err.message,
        response: err.response?.data,
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, members: false }));
    }
  };

  const handleSavePracticeAttendance = async (formData) => {
    if (!selectedClub) {
      setError("Please select a club.");
      return;
    }
    const attendanceData = Object.entries(attendance)
      .filter(([_, status]) => status)
      .map(([userId, status]) => ({ userId, status }));
    if (attendanceData.length === 0) {
      setError("No attendance data to save.");
      return;
    }
    setIsLoading((prev) => ({ ...prev, practice: true }));
    setError("");
    try {
      console.log("handleSavePracticeAttendance - Sending request:", {
        club: selectedClub,
        title: formData.title,
        date: formData.date,
        roomNo: formData.roomNo,
        attendance: attendanceData,
      });
      const response = await fetchWithRetry("/api/practice-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: {
          club: selectedClub,
          title: formData.title,
          date: formData.date,
          roomNo: formData.roomNo,
          attendance: attendanceData,
        },
      });
      console.log("handleSavePracticeAttendance - Response:", JSON.stringify(response.data, null, 2));
      if (!response.data.attendance?._id) {
        throw new Error(
          `Invalid response: Practice attendance record ID missing. Response: ${JSON.stringify(
            response.data
          )}`
        );
      }
      setSuccess("Practice attendance saved successfully!");
      setIsPracticeModalOpen(false);
      setAttendance(
        members.reduce(
          (acc, member) => ({
            ...acc,
            [member._id]: null,
          }),
          {}
        )
      );
      await fetchAttendanceHistory();
      await generateDocxReport(
        { ...response.data.attendance, title: formData.title, date: formData.date, roomNo: formData.roomNo },
        "practice"
      );
    } catch (err) {
      setError(
        errorMessages[err.response?.data?.error] ||
        `Failed to save practice attendance: ${err.message}`
      );
      console.error("handleSavePracticeAttendance Error:", err, {
        responseData: err.response?.data,
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, practice: false }));
    }
  };

  const handleExportCSV = () => {
    if (!members.length || Object.keys(attendance).length === 0) {
      setError("No attendance data to export.");
      return;
    }
    const headers = [
      "Name",
      "Roll No",
      "Email",
      "Branch",
      "Semester",
      "Course",
      "Specialization",
      "ACEM Student",
      "Attendance",
    ];
    const rows = members.map((member) => [
      `"${member.name || "Unknown"}"`,
      `"${member.rollNo || "N/A"}"`,
      `"${member.email || "N/A"}"`,
      `"${member.branch || "N/A"}"`,
      `"${member.semester || "N/A"}"`,
      `"${member.course || "N/A"}"`,
      `"${member.specialization || "N/A"}"`,
      member.isACEMStudent ? "Yes" : "No",
      attendance[member._id] || "Not Marked",
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `attendance_${selectedClub}_${new Date().toISOString().split("T")[0]}.csv`);
    setSuccess("Attendance exported as CSV!");
  };

  const generateDocxReport = async (record, type) => {
    if (!record._id) {
      setError("Cannot generate report: Invalid attendance record ID.");
      console.error("generateDocxReport Error: Invalid record ID", record);
      return;
    }
    try {
      console.log(`Generating ${type} report for record ID: ${record._id}`);
      const endpoint = type === "event" ? `/api/attendance/${record._id}/report` : `/api/practice-attendance/${record._id}/report`;
      const response = await fetchWithRetry(endpoint, {
        method: "GET",
        responseType: "arraybuffer",
        headers: {
          Accept: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
      });

      // Log response details for debugging
      console.log("generateDocxReport Response:", {
        status: response.status,
        headers: response.headers,
        dataLength: response.data?.byteLength || "unknown",
      });

      // Verify response data
      if (!response.data || response.data.byteLength === 0) {
        throw new Error("Empty or invalid response data received from server.");
      }

      // Create Blob with fallback content type
      const contentType =
        response.headers["content-type"] ||
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const blob = new Blob([response.data], { type: contentType });

      // Generate safe filename
      const safeTitle = (record.title || "Untitled").replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `${type === "event" ? "Event" : "Practice"}_Attendance_${safeTitle}_${record.date || "Unknown"}.docx`;

      // Trigger download
      saveAs(blob, filename);
      setSuccess("Report downloaded successfully!");
    } catch (err) {
      // Parse error response if available (e.g., JSON error from server)
      let errorMsg = errorMessages[err.response?.data?.error] || `Failed to generate report: ${err.message}`;
      if (err.response?.data instanceof ArrayBuffer) {
        try {
          const textDecoder = new TextDecoder("utf-8");
          const errorText = textDecoder.decode(err.response.data);
          const errorJson = JSON.parse(errorText);
          errorMsg = errorMessages[errorJson.error] || `Failed to generate report: ${errorJson.error || err.message}`;
        } catch (decodeErr) {
          console.error("Failed to decode error response:", decodeErr);
        }
      }
      setError(errorMsg);
      console.error("generateDocxReport Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
      });
    }
  };

  const handleViewPresentStudents = async (recordId, type) => {
    if (!recordId) {
      setError("Invalid record ID for viewing present students.");
      console.error("handleViewPresentStudents Error: Invalid recordId", recordId);
      return;
    }
    setSelectedRecord({ id: recordId, type });
    await fetchAttendanceHistory();
    setIsPresentStudentsModalOpen(true);
  };

  const stats = useMemo(() => {
    const totalMembers = members.length;
    const totalPresent = Object.values(attendance).filter((s) => s === "present").length;
    const totalAbsent = Object.values(attendance).filter((s) => s === "absent").length;
    const attendanceRate =
      totalMembers > 0 ? ((totalPresent / totalMembers) * 100).toFixed(2) : 0;
    return { totalMembers, totalPresent, totalAbsent, attendanceRate };
  }, [members, attendance]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(
      (member) =>
        member.name?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.rollNo?.toLowerCase().includes(query) ||
        member.branch?.toLowerCase().includes(query) ||
        member.semester?.toString().includes(query) ||
        member.course?.toLowerCase().includes(query) ||
        member.specialization?.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  if (isLoading.user || isLoading.clubs) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#456882] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || clubs.length === 0) {
    return (
      <ErrorBoundary>
        <Navbar user={user} role="superAdmin" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-md mx-auto text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Access
            </h2>
            <p className="text-gray-600 mb-4">
              You do not have permission to access any clubs. Please contact an administrator or create a club.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 bg-[#456882] text-white rounded-full hover:bg-[#5a7a98] transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Navbar user={user} role={user?.isAdmin ? "admin" : user?.headCoordinatorClubs?.length > 0 ? "admin" : "superAdmin"} />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-8 h-8 text-[#456882]" />
              Attendance Tracker
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setIsPracticeModalOpen(true)}
                className="px-4 py-2 bg-[#456882] text-white rounded-full hover:bg-[#5a7a98] transition-colors flex items-center gap-2"
                disabled={isLoading.members || !selectedClub}
                title={selectedClub ? "Take Practice Session Attendance" : "Select a club first"}
                aria-label="Record practice session attendance"
              >
                <Users className="w-5 h-5" />
                Practice Session
              </button>
              <button
                onClick={() => {
                  setAttendanceHistory([]);
                  setPracticeAttendanceHistory([]);
                  fetchAttendanceHistory();
                }}
                className="px-4 py-2 bg-[#456882] text-white rounded-full hover:bg-[#5a7a98] transition-colors flex items-center gap-2"
                disabled={isLoading.attendance || !selectedClub}
                title={selectedClub ? "Refresh History" : "Select a club first"}
                aria-label="Refresh attendance history"
              >
                <Eye className="w-5 h-5" />
                Refresh History
              </button>
            </div>
          </motion.div>

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
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
                  <p className="text-sm text-gray-600">No clubs available. You must be a creator, super admin, or head coordinator to access this page.</p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Club</label>
                      <div className="relative">
                        <select
                          value={selectedClub}
                          onChange={(e) => {
                            setSelectedClub(e.target.value);
                            setSelectedEvent("");
                          }}
                          className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882] appearance-none bg-white"
                          disabled={isLoading.clubs}
                          aria-label="Select a club"
                        >
                          <option value="">Select a club</option>
                          {clubs.map((club) => (
                            <option key={club._id} value={club._id}>
                              {club.name}
                            </option>
                          ))}
                        </select>
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Event</label>
                      <div className="relative">
                        <select
                          value={selectedEvent}
                          onChange={(e) => setSelectedEvent(e.target.value)}
                          className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882] appearance-none bg-white"
                          disabled={isLoading.events || events.length === 0}
                          aria-label="Select an event"
                        >
                          <option value="">Select an event</option>
                          {events.map((event) => (
                            <option key={event._id} value={event._id}>
                              {event.title} ({event.date}) {event.type && `(${event.type.charAt(0).toUpperCase() + event.type.slice(1)})`}
                            </option>
                          ))}
                        </select>
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveAttendance}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-xl hover:bg-[#5a7a98] transition-colors disabled:opacity-50"
                        disabled={isLoading.attendance || !selectedClub || !selectedEvent}
                        title={selectedClub && selectedEvent ? "Save Attendance" : "Select a club and event first"}
                        aria-label="Save event attendance"
                      >
                        <Save className="w-5 h-5" />
                        Save Attendance
                      </button>
                      <button
                        onClick={() => setIsAddStudentModalOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
                        disabled={isLoading.members || !selectedClub}
                        title={selectedClub ? "Add Student" : "Select a club first"}
                        aria-label="Add student"
                      >
                        <UserPlus className="w-5 h-5" />
                        Add Student
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <StatsCard title="Total Members" value={stats.totalMembers} icon={Users} />
                <StatsCard
                  title="Present"
                  value={stats.totalPresent}
                  icon={CheckCircle2}
                  color="text-green-500"
                  bgColor="bg-green-50"
                />
                <StatsCard
                  title="Absent"
                  value={stats.totalAbsent}
                  icon={XCircle}
                  color="text-red-500"
                  bgColor="bg-red-50"
                />
                <StatsCard
                  title="Attendance Rate"
                  value={`${stats.attendanceRate}%`}
                  icon={Calendar}
                  color="text-[#456882]"
                  bgColor="bg-[#456882]/5"
                />
              </motion.div>
            </div>

            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#456882]" />
                    Members
                  </h2>
                  <div className="flex gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search members by name, roll no, email..."
                        onChange={(e) => debouncedSetSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882] w-64"
                        disabled={isLoading.members}
                        aria-label="Search members"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-xl hover:bg-[#5a7a98] transition-colors disabled:opacity-50"
                      disabled={isLoading.members || filteredMembers.length === 0 || stats.totalPresent + stats.totalAbsent === 0}
                      title={
                        filteredMembers.length === 0
                          ? "No members to export"
                          : stats.totalPresent + stats.totalAbsent === 0
                            ? "Mark attendance first"
                            : "Download CSV"
                      }
                      aria-label="Export attendance as CSV"
                    >
                      <Download className="w-5 h-5" />
                      Export CSV
                    </button>
                  </div>
                </div>
                {isLoading.members ? (
                  <div className="text-center text-gray-600">Loading members...</div>
                ) : filteredMembers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {searchQuery ? "No members match your search." : "No members found for the selected club."}
                  </p>
                ) : (
                  <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto scrollbar-thin scrollbar-thumb-[#456882] scrollbar-track-gray-100">
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

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mt-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#456882]" />
                  Attendance History
                </h2>
                {isLoading.attendance ? (
                  <div className="text-center text-gray-600">Loading history...</div>
                ) : [...attendanceHistory, ...practiceAttendanceHistory].length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No attendance records found for the selected club.
                  </p>
                ) : (
                  <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto scrollbar-thin scrollbar-thumb-[#456882] scrollbar-track-gray-100">
                    {[...attendanceHistory, ...practiceAttendanceHistory]
                      .sort((a, b) => {
                        const dateA = a.date === "N/A" ? new Date(0) : new Date(a.date);
                        const dateB = b.date === "N/A" ? new Date(0) : new Date(b.date);
                        return dateB - dateA;
                      })
                      .map((record, index) => (
                        <motion.div
                          key={record._id || `${record.type}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              {record.title}
                            </h3>
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {record.date}
                            </p>
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <span
                                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${record.eventType === "seminar"
                                  ? "bg-blue-100 text-blue-600"
                                  : record.eventType === "competition"
                                    ? "bg-red-100 text-red-600"
                                    : record.eventType === "workshop"
                                      ? "bg-yellow-100 text-yellow-600"
                                      : "bg-green-100 text-green-600"
                                  }`}
                              >
                                {record.eventType.charAt(0).toUpperCase() + record.eventType.slice(1)}
                              </span>
                              {record.roomNo && (
                                <>
                                 • Room: {record.roomNo}
                                </>
                              )}
                            </p>
                            <p className="text-xs text-gray-600">
                              Present: {record.totalPresent} • Absent: {record.totalAbsent} • Rate: {record.attendanceRate}%
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewPresentStudents(record._id, record.type)}
                              className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                              title="View present students"
                              aria-label={`View present students for ${record.title}`}
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => generateDocxReport(record, record.type)}
                              className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                              title="Download report"
                              aria-label={`Download report for ${record.title}`}
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onSubmit={handleAddStudent}
        isLoading={isLoading.members}
        error={error}
      />

      <PracticeAttendanceModal
        isOpen={isPracticeModalOpen}
        onClose={() => setIsPracticeModalOpen(false)}
        onSubmit={handleSavePracticeAttendance}
        onAddStudent={handleAddStudent}
        isLoading={isLoading.practice}
        error={error}
        members={members}
        selectedClub={selectedClub}
        attendance={attendance}
        setAttendance={setAttendance}
      />

      <PresentStudentsModal
        isOpen={isPresentStudentsModalOpen}
        onClose={() => setIsPresentStudentsModalOpen(false)}
        recordId={selectedRecord.id}
        type={selectedRecord.type}
      />
    </ErrorBoundary>
  );
};

export default AttendanceTracker;