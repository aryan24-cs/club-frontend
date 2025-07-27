import React, { memo, useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Users,
  Calendar,
  Clock,
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";

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
  const isPresent = attendance[member.id] === "present";
  const isAbsent = attendance[member.id] === "absent";
  const isMarked = isPresent || isAbsent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group
        ${
          isPresent
            ? "bg-green-50 border-green-200 shadow-green-100/50"
            : isAbsent
            ? "bg-red-50 border-red-200 shadow-red-100/50"
            : "bg-white border-gray-200 hover:border-[#456882]/30 hover:shadow-lg"
        }
      `}
      onClick={() => onToggleAttendance(member.id)}
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
              className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                isPresent ? "bg-green-500" : "bg-red-500"
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
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleAttendance(member.id, "present");
          }}
          className={`p-2 rounded-full transition-colors ${
            isPresent
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
            onToggleAttendance(member.id, "absent");
          }}
          className={`p-2 rounded-full transition-colors ${
            isAbsent
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

const AttendanceTracker = () => {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [lectureNumber, setLectureNumber] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const navigate = useNavigate();

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
          axios
            .get("http://localhost:5000/api/auth/user", config)
            .catch(() => ({ data: null })),
          axios
            .get("http://localhost:5000/api/clubs", config)
            .catch(() => ({ data: [] })),
        ]);

        const userData = userResponse.data;
        if (!userData || !userData._id) {
          setError("Failed to load user data.");
          navigate("/login");
          return;
        }
        setUser(userData);

        // Debug logging
        console.log("AttendanceTracker - User:", {
          _id: userData._id || "null",
          name: userData.name || "null",
          isAdmin: userData.isAdmin || false,
          headCoordinatorClubs: userData.headCoordinatorClubs || [],
        });

        // Filter clubs based on role
        const isGlobalAdmin = userData.isAdmin === true;
        const isSuperAdmin = clubsResponse.data.some((club) =>
          club?.superAdmins?.some(
            (admin) => admin?._id?.toString() === userData._id?.toString()
          )
        );
        const isAdmin = (userData.headCoordinatorClubs || []).length > 0;

        console.log("AttendanceTracker - Roles:", {
          isGlobalAdmin,
          isSuperAdmin,
          isAdmin,
        });

        let filteredClubs = [];
        if (isGlobalAdmin) {
          filteredClubs = clubsResponse.data || [];
          console.log("AttendanceTracker - Showing all clubs for global admin");
        } else if (isSuperAdmin) {
          filteredClubs = (clubsResponse.data || []).filter((club) =>
            club?.superAdmins?.some(
              (admin) => admin?._id?.toString() === userData._id?.toString()
            )
          );
          console.log(
            "AttendanceTracker - Filtered clubs for SuperAdmin:",
            filteredClubs
          );
        } else if (isAdmin) {
          filteredClubs = (clubsResponse.data || []).filter((club) =>
            (userData.headCoordinatorClubs || []).includes(club?.name)
          );
          console.log(
            "AttendanceTracker - Filtered clubs for Admin:",
            filteredClubs
          );
        } else {
          setError("You are not authorized to mark attendance.");
          console.log("AttendanceTracker - No clubs for user");
          navigate("/dashboard");
          return;
        }

        setClubs(filteredClubs);
        if (filteredClubs.length > 0) {
          setSelectedClub(filteredClubs[0]._id || "");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err.response?.data?.error || err.message || "Failed to load data."
        );
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

  // Fetch members for selected club
  useEffect(() => {
    const fetchMembers = async () => {
      if (!selectedClub) return;
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/clubs/${selectedClub}/members`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const formattedMembers = (response.data || []).map((member) => ({
          id: member._id || `member-${Math.random()}`, // Fallback ID
          name: member.name || "Unknown",
          email: member.email || "N/A",
          rollNo: member.rollNo || "N/A",
        }));
        setMembers(formattedMembers);
        setAttendance(
          formattedMembers.reduce(
            (acc, member) => ({
              ...acc,
              [member.id]: null,
            }),
            {}
          )
        );
        console.log("AttendanceTracker - Members:", formattedMembers);
      } catch (err) {
        console.error("Error fetching members:", err);
        setError("Failed to load members. Please try again.");
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, [selectedClub, navigate]);

  // Fetch attendance history
  const fetchAttendanceHistory = useCallback(async () => {
    if (!selectedClub) return;
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/attendance", {
        headers: { Authorization: `Bearer ${token}` },
        params: { club: selectedClub },
      });
      setAttendanceHistory(response.data || []);
      console.log("AttendanceTracker - History:", response.data);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load attendance history.");
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

  // Handle attendance toggle
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

  // Calculate stats
  const stats = useMemo(() => {
    const total = members.length;
    const presentCount = Object.values(attendance).filter(
      (s) => s === "present"
    ).length;
    const absentCount = Object.values(attendance).filter(
      (s) => s === "absent"
    ).length;
    const totalMarked = presentCount + absentCount;
    const attendanceRate =
      total > 0 ? ((presentCount / total) * 100).toFixed(1) : 0;
    return { presentCount, absentCount, totalMarked, attendanceRate };
  }, [attendance, members]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedClub || !date || !lectureNumber) {
      setError("Please fill in all required fields.");
      return;
    }
    if (Object.values(attendance).every((status) => status === null)) {
      setError("Please mark attendance for at least one member.");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      await axios.post(
        "http://localhost:5000/api/attendance",
        {
          club: selectedClub,
          date,
          lectureNumber: parseInt(lectureNumber),
          attendance,
          stats,
          createdBy: user?._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Attendance recorded successfully!");
      setAttendance(
        members.reduce(
          (acc, member) => ({
            ...acc,
            [member.id]: null,
          }),
          {}
        )
      );
      setTimeout(() => setSuccess(""), 3000);
      fetchAttendanceHistory();
    } catch (err) {
      console.error("Error saving attendance:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to save attendance."
      );
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(
      (member) =>
        member.name?.toLowerCase().includes(query) ||
        false ||
        member.rollNo?.toLowerCase().includes(query) ||
        false ||
        member.email?.toLowerCase().includes(query) ||
        false
    );
  }, [members, searchQuery]);

  // Download attendance as CSV
  const downloadCSV = () => {
    const headers = ["Name", "Roll No", "Email", "Attendance"];
    const rows = filteredMembers.map((member) => [
      `"${member.name || "Unknown"}"`,
      `"${member.rollNo || "N/A"}"`,
      `"${member.email || "N/A"}"`,
      attendance[member.id] || "Not Marked",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `attendance_${selectedClub}_${date}_lecture${lectureNumber}.csv`
    );
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#456882] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Navbar  />
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
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-[#456882] text-white rounded-full hover:bg-[#5a7a98] transition-colors flex items-center gap-2"
            >
              <Eye className="w-5 h-5" />
              {showHistory ? "Hide History" : "View History"}
            </button>
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
                  Attendance Details
                </h2>
                {clubs.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    No clubs available to manage.
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
                          onChange={(e) => setSelectedClub(e.target.value)}
                          className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882] appearance-none bg-white"
                          disabled={isLoading}
                        >
                          {clubs.map((club) => (
                            <option
                              key={club._id || `club-${Math.random()}`}
                              value={club._id}
                            >
                              {club.name || "Unknown Club"}
                            </option>
                          ))}
                        </select>
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                        />
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lecture Number
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={lectureNumber || 1}
                          onChange={(e) => setLectureNumber(e.target.value)}
                          min="1"
                          className="w-full pl-10 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
                          disabled={isLoading}
                        />
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <button
                      onClick={handleSubmit}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-xl hover:bg-[#5a7a98] transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      <Save className="w-5 h-5" />
                      Save Attendance
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
                  Attendance Stats
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
                      placeholder="Search by name, roll no, or email..."
                      value={searchQuery || ""}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-[#456882] focus:border-[#456882]"
                      disabled={isLoading}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </motion.div>

                  {/* Download Button */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-end"
                  >
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
                            key={member.id}
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
                          key={record._id || `record-${Math.random()}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-xl border border-gray-200 bg-gray-50"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {record.club?.name || "Unknown Club"} - Lecture{" "}
                              {record.lectureNumber || "N/A"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {record.date
                                ? new Date(record.date).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
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
                              {record.createdBy?.name || "Unknown"}
                            </p>
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
