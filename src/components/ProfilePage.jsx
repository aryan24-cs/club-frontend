import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaSpinner,
  FaSave,
  FaTrophy,
  FaUsers,
  FaCalendar,
  FaMedal,
  FaEdit,
  FaEye,
  FaStar,
  FaGraduationCap,
  FaShieldAlt,
  FaCrown,
  FaChartLine,
  FaWhatsapp,
  FaEnvelope,
  FaCoins,
  FaTrash,
  FaExclamationTriangle,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    semester: "",
    course: "",
    specialization: "",
    rollNo: "",
    isACEMStudent: false,
    collegeName: "",
  });
  const [profileData, setProfileData] = useState({
    clubs: [],
    achievements: [],
    stats: {
      totalEvents: 0,
      attendanceRate: 0,
      eventsOrganized: 0,
      overallRank: 0,
      totalMembers: 0,
      seminarsAttended: 0,
      competitionsAttended: 0,
      workshopsAttended: 0,
      totalPoints: 0,
    },
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        const [userResponse, clubsResponse, eventsResponse, attendanceResponse, practiceAttendanceResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/user", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/clubs", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/events", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/attendance/user", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/practice-attendance/user", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const userData = userResponse.data;
        setUser(userData);
        setProfile({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          semester: userData.semester || "",
          course: userData.course || "",
          specialization: userData.specialization || "",
          rollNo: userData.rollNo || "",
          isACEMStudent: userData.isACEMStudent || false,
          collegeName: userData.collegeName || "",
        });

        const formattedClubs = clubsResponse.data
          .filter((club) => Array.isArray(userData.clubName) && userData.clubName.includes(club.name))
          .map((club) => {
            const isHeadCoordinator = userData.isHeadCoordinator &&
              Array.isArray(userData.headCoordinatorClubs) &&
              userData.headCoordinatorClubs.includes(club.name);
            return {
              id: club._id || "",
              name: club.name || "",
              role: userData.isAdmin ? "Admin" : isHeadCoordinator ? "Head Coordinator" : "Member",
              joinedAt: userData.createdAt || new Date(),
              badge: club.category === "Technical" ? "🚀" :
                    club.category === "Cultural" ? "🎭" :
                    club.category === "Literary" ? "📚" :
                    club.category === "Entrepreneurial" ? "💼" : "💡",
              headCoordinators: club.headCoordinators || [],
            };
          });

        const userEvents = eventsResponse.data.filter((event) =>
          Array.isArray(userData.clubName) && userData.clubName.includes(event.club?.name)
        );
        const eventAttendanceRecords = attendanceResponse.data || [];
        const practiceAttendanceRecords = practiceAttendanceResponse.data || [];

        const eventAttendance = eventAttendanceRecords.filter(
          (record) => record.status === "present"
        );
        const eventPresentCount = eventAttendance.length;
        const eventTotalCount = eventAttendanceRecords.length;
        const eventAttendanceRate =
          eventTotalCount > 0
            ? Math.round((eventPresentCount / eventTotalCount) * 100)
            : 0;
        const eventPoints = eventAttendance.reduce(
          (sum, record) => sum + (record.points || 0),
          0
        );

        const practiceAttendance = practiceAttendanceRecords.filter(
          (record) => record.status === "present"
        );
        const practicePresentCount = practiceAttendance.length;
        const practiceTotalCount = practiceAttendanceRecords.length;
        const practiceAttendanceRate =
          practiceTotalCount > 0
            ? Math.round((practicePresentCount / practiceTotalCount) * 100)
            : 0;
        const practicePoints = practiceAttendance.reduce(
          (sum, record) => sum + (record.points || 0),
          0
        );

        const totalAttendanceCount = eventTotalCount + practiceTotalCount;
        const totalPresentCount = eventPresentCount + practicePresentCount;
        const combinedAttendanceRate =
          totalAttendanceCount > 0
            ? Math.round((totalPresentCount / totalAttendanceCount) * 100)
            : 0;
        const totalPoints = eventPoints + practicePoints;

        const stats = {
          totalEvents: userEvents.length,
          attendanceRate: combinedAttendanceRate,
          eventsOrganized: eventsResponse.data.filter(
            (event) => event.createdBy?._id === userData._id
          ).length,
          overallRank: 0,
          totalMembers: clubsResponse.data.reduce(
            (sum, club) =>
              sum +
              (Array.isArray(userData.clubName) && userData.clubName.includes(club.name) ? club.memberCount || 0 : 0),
            0
          ),
          seminarsAttended: userEvents.filter(
            (event) => event.type === "seminar"
          ).length,
          competitionsAttended: userEvents.filter(
            (event) => event.type === "competition"
          ).length,
          workshopsAttended: userEvents.filter(
            (event) => event.type === "workshop"
          ).length,
          totalPoints,
        };

        const eventTypeIcons = {
          seminar: "🎤",
          competition: "🏆",
          workshop: "🛠️",
          default: "⭐",
        };

        const achievements = eventsResponse.data
          .filter(
            (event) =>
              event?.createdBy?._id && event.createdBy._id === userData._id
          )
          .map((event) => ({
            id: event._id || "",
            title: `Organized ${
              event.type
                ? event.type.charAt(0).toUpperCase() +
                  event.type.slice(1).toLowerCase()
                : "Event"
            }`,
            description: `Organized ${event.title || "an event"}`,
            icon:
              eventTypeIcons[event.type?.toLowerCase()] ||
              eventTypeIcons.default,
            earnedAt: event.createdAt || new Date(),
          }));

        setProfileData({
          clubs: formattedClubs,
          achievements,
          stats,
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching user:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
        setError("Failed to load profile.");
        setIsLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    } else {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      await axios.put(
        "http://localhost:5000/api/auth/user",
        {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          semester: profile.semester,
          course: profile.course,
          specialization: profile.specialization,
          rollNo: profile.rollNo,
          isACEMStudent: profile.isACEMStudent,
          collegeName: !profile.isACEMStudent ? profile.collegeName : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Profile updated successfully!");
      setUser((prev) => ({
        ...prev,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        semester: profile.semester,
        course: profile.course,
        specialization: profile.specialization,
        rollNo: profile.rollNo,
        isACEMStudent: profile.isACEMStudent,
        collegeName: !profile.isACEMStudent ? profile.collegeName : null,
      }));
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError("");
    try {
      await axios.delete("http://localhost:5000/api/auth/delete-account", {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      localStorage.removeItem("isACEMStudent");
      localStorage.removeItem("collegeName");
      navigate("/signup");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete account");
      setIsDeleting(false);
    }
  };

  const openDeleteModal = () => setShowDeleteModal(true);
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setError("");
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "superadmin":
        return <FaCrown className="text-yellow-500" />;
      case "admin":
        return <FaShieldAlt className="text-blue-500" />;
      case "Head Coordinator":
        return <FaCrown className="text-purple-500" />;
      case "Coordinator":
        return <FaGraduationCap className="text-green-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  const getRoleBadge = () => {
    if (user?.isAdmin) return { text: "Super Admin", color: "bg-red-500" };
    if (user?.isHeadCoordinator)
      return { text: "Head Coordinator", color: "bg-purple-500" };
    return { text: "Member", color: "bg-blue-500" };
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 font-[Poppins] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <FaSpinner
            className="text-6xl text-teal-600 animate-spin mx-auto mb-4"
            style={{ color: "#456882" }}
          />
          <p className="text-gray-600">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-[Poppins]">
      <Navbar />
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg border-b"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div className="absolute -bottom-1 -right-1">
                  {getRoleIcon(
                    user?.isAdmin
                      ? "superadmin"
                      : user?.isHeadCoordinator
                      ? "Head Coordinator"
                      : "Member"
                  )}
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {user?.name}
                </h1>
                <p className="text-gray-600">
                  {user?.course} • Semester {user?.semester} • Roll No:{" "}
                  {user?.rollNo || "N/A"}
                </p>
                <p className="text-gray-600">
                  {user?.isACEMStudent
                    ? "Aravali College Of Engineering And Management"
                    : user?.collegeName || "N/A"}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs text-white ${
                      getRoleBadge().color
                    }`}
                  >
                    {getRoleBadge().text}
                  </span>
                  <span className="px-2 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                    {user?.isACEMStudent ? "ACEM Student" : "Non-ACEM Student"}
                  </span>
                  <span className="text-sm text-gray-500">
                    Rank #{profileData?.stats?.overallRank}
                  </span>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              style={{ backgroundColor: "#456882" }}
            >
              {isEditing ? <FaEye /> : <FaEdit />}
              <span>{isEditing ? "View Mode" : "Edit Profile"}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
          {[
            { id: "profile", label: "Profile", icon: FaUser },
            { id: "clubs", label: "My Clubs", icon: FaUsers },
            { id: "achievements", label: "Achievements", icon: FaTrophy },
            { id: "stats", label: "Statistics", icon: FaChartLine },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition ${
                activeTab === tab.id
                  ? "bg-teal-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              style={{
                backgroundColor:
                  activeTab === tab.id ? "#456882" : "transparent",
              }}
            >
              <tab.icon className="text-sm" />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold mb-6 text-gray-800">
                  Personal Information
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) =>
                          setProfile({ ...profile, name: e.target.value })
                        }
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isEditing
                            ? "border-gray-300 focus:ring-2 focus:ring-teal-600"
                            : "border-gray-200 bg-gray-50"
                        } focus:outline-none`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isEditing
                            ? "border-gray-300 focus:ring-2 focus:ring-teal-600"
                            : "border-gray-200 bg-gray-50"
                        } focus:outline-none`}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isEditing
                            ? "border-gray-300 focus:ring-2 focus:ring-teal-600"
                            : "border-gray-200 bg-gray-50"
                        } focus:outline-none`}
                        placeholder="+1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Semester
                      </label>
                      <input
                        type="number"
                        value={profile.semester}
                        onChange={(e) =>
                          setProfile({ ...profile, semester: e.target.value })
                        }
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isEditing
                            ? "border-gray-300 focus:ring-2 focus:ring-teal-600"
                            : "border-gray-200 bg-gray-50"
                        } focus:outline-none`}
                        min="1"
                        max="8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Course
                      </label>
                      <input
                        type="text"
                        value={profile.course}
                        onChange={(e) =>
                          setProfile({ ...profile, course: e.target.value })
                        }
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isEditing
                            ? "border-gray-300 focus:ring-2 focus:ring-teal-600"
                            : "border-gray-200 bg-gray-50"
                        } focus:outline-none`}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Specialization
                      </label>
                      <input
                        type="text"
                        value={profile.specialization}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            specialization: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isEditing
                            ? "border-gray-300 focus:ring-2 focus:ring-teal-600"
                            : "border-gray-200 bg-gray-50"
                        } focus:outline-none`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        value={profile.rollNo}
                        onChange={(e) =>
                          setProfile({ ...profile, rollNo: e.target.value })
                        }
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isEditing
                            ? "border-gray-300 focus:ring-2 focus:ring-teal-600"
                            : "border-gray-200 bg-gray-50"
                        } focus:outline-none`}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Student Status
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={profile.isACEMStudent}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              isACEMStudent: e.target.checked,
                              collegeName: e.target.checked
                                ? ""
                                : profile.collegeName,
                            })
                          }
                          disabled={!isEditing}
                          className="w-5 h-5 text-teal-600 focus:ring-teal-600 rounded"
                          style={{ accentColor: "#456882" }}
                        />
                        <span className="text-gray-700">ACEM Student</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        College Name
                      </label>
                      {profile.isACEMStudent ? (
                        <input
                          type="text"
                          value="Aravali College Of Engineering And Management"
                          disabled
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={profile.collegeName}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              collegeName: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isEditing
                              ? "border-gray-300 focus:ring-2 focus:ring-teal-600"
                              : "border-gray-200 bg-gray-50"
                          } focus:outline-none`}
                          required
                        />
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      className={`w-full px-6 py-3 rounded-lg font-semibold transition ${
                        isSubmitting
                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                      style={{
                        backgroundColor: isSubmitting ? "#d1d5db" : "#456882",
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin inline-block mr-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <FaSave className="inline-block mr-2" />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                  )}
                  <motion.button
                    onClick={openDeleteModal}
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    className={`w-full px-6 py-3 rounded-lg font-semibold transition ${
                      isSubmitting
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700"
                    } mt-4`}
                  >
                    <FaTrash className="inline-block mr-2" />
                    Delete My Account
                  </motion.button>
                </form>
              </motion.div>
            )}

            {activeTab === "clubs" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold text-gray-800">My Clubs</h2>
                {profileData?.clubs?.map((club) => (
                  <div
                    key={club.id}
                    className="bg-white rounded-xl shadow-lg p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{club.badge}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {club.name}
                          </h3>
                          <p className="text-gray-600">{club.role}</p>
                          <p className="text-sm text-gray-500">
                            Joined:{" "}
                            {new Date(club.joinedAt).toLocaleDateString()}
                          </p>
                          {club.role === "Head Coordinator" && (
                            <div className="mt-2">
                              <p className="text-sm font-semibold text-gray-700">Coordinator Contact:</p>
                              <ul className="text-sm text-gray-600">
                                {club.headCoordinators.map((coordinator, index) => (
                                  <li key={index}>
                                    {coordinator.name} ({coordinator.email}, {coordinator.phone || "No phone"})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <FaWhatsapp
                          className="text-green-500 text-xl cursor-pointer hover:scale-110 transition"
                          onClick={() =>
                            window.open(
                              `https://wa.me/${user.phone || "1234567890"}`
                            )
                          }
                        />
                        <FaEnvelope
                          className="text-blue-500 text-xl cursor-pointer hover:scale-110 transition"
                          onClick={() =>
                            (window.location.href = `mailto:${user.email}`)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === "achievements" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold text-gray-800">
                  Achievements & Milestones
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profileData?.achievements?.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="bg-white rounded-xl shadow-lg p-6"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {achievement.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {achievement.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Earned:{" "}
                            {new Date(
                              achievement.earnedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "stats" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold mb-6 text-gray-800">
                  Statistics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <FaCalendar className="text-2xl text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">
                      {profileData?.stats?.totalEvents}
                    </p>
                    <p className="text-sm text-gray-600">Events Attended</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <FaChartLine className="text-2xl text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      {profileData?.stats?.attendanceRate}%
                    </p>
                    <p className="text-sm text-gray-600">Attendance Rate</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <FaTrophy className="text-2xl text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">
                      {profileData?.stats?.eventsOrganized}
                    </p>
                    <p className="text-sm text-gray-600">Events Organized</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <FaStar className="text-2xl text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-600">
                      {profileData?.stats?.overallRank}
                    </p>
                    <p className="text-sm text-gray-600">Overall Rank</p>
                  </div>
                  <div className="text-center p-4 bg-teal-50 rounded-lg">
                    <FaUsers className="text-2xl text-teal-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-teal-600">
                      {profileData?.stats?.totalMembers}
                    </p>
                    <p className="text-sm text-gray-600">Club Members</p>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <FaGraduationCap className="text-2xl text-indigo-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-indigo-600">
                      {profileData?.stats?.seminarsAttended}
                    </p>
                    <p className="text-sm text-gray-600">Seminars Attended</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <FaMedal className="text-2xl text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-600">
                      {profileData?.stats?.competitionsAttended}
                    </p>
                    <p className="text-sm text-gray-600">
                      Competitions Attended
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <FaCoins className="text-2xl text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-600">
                      {profileData?.stats?.totalPoints}
                    </p>
                    <p className="text-sm text-gray-600">Total Points</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 sticky top-4"
            >
              <h2 className="text-xl font-bold mb-6 text-gray-800">
                Quick Stats
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Events</span>
                  <span className="font-semibold text-teal-600">
                    {profileData?.stats?.totalEvents}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Attendance Rate</span>
                  <span className="font-semibold text-teal-600">
                    {profileData?.stats?.attendanceRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Events Organized</span>
                  <span className="font-semibold text-teal-600">
                    {profileData?.stats?.eventsOrganized}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Points</span>
                  <span className="font-semibold text-teal-600">
                    {profileData?.stats?.totalPoints}
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Contact Info
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FaEnvelope className="text-teal-600" />
                    <a
                      href={`mailto:${user?.email}`}
                      className="text-gray-600 hover:text-teal-600"
                    >
                      {user?.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaWhatsapp className="text-teal-600" />
                    <a
                      href={`https://wa.me/${user?.phone || "1234567890"}`}
                      className="text-gray-600 hover:text-teal-600"
                    >
                      {user?.phone || "N/A"}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            {success}
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
              >
                <div className="flex items-center justify-center mb-4">
                  <FaExclamationTriangle className="text-red-600 text-4xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
                  Are you sure?
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  Deleting your account will permanently remove all your data,
                  including your profile, club memberships, achievements, and
                  statistics. This action cannot be undone.
                </p>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center"
                  >
                    <p className="text-red-600 font-medium">{error}</p>
                  </motion.div>
                )}
                <div className="flex justify-between gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                    className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    <FaTimes className="inline-block mr-2" />
                    No, Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: isDeleting ? 1 : 1.05 }}
                    whileTap={{ scale: isDeleting ? 1 : 0.95 }}
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className={`w-full px-6 py-3 rounded-lg font-semibold transition ${
                      isDeleting
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {isDeleting ? (
                      <>
                        <FaSpinner className="animate-spin inline-block mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FaCheck className="inline-block mr-2" />
                        Yes, Delete
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;