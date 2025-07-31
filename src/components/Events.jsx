import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Search,
  CheckCircle,
  Clock,
  MapPin,
  ChevronLeft,
  Edit3,
  Trash2,
  X,
  Filter,
} from "lucide-react";
import Navbar from "../components/Navbar";

// Toast Component
const Toast = ({ id, message, type, onClose }) => {
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 max-w-xs p-4 rounded-lg shadow-lg flex items-center justify-between gap-2 text-white ${
        type === "error" ? "bg-red-600" : "bg-green-600"
      }`}
    >
      <span className="text-sm">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="text-white hover:text-gray-200"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHeadCoordinator, setIsHeadCoordinator] = useState(false);
  const [registerLoading, setRegisterLoading] = useState({});
  const [toasts, setToasts] = useState([]);
  const [showJoinClubPrompt, setShowJoinClubPrompt] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(null);
  const [userClubs, setUserClubs] = useState([]);
  const [eventFilter, setEventFilter] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNo: "",
    college: "",
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);

  // Add toast notification
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  // Remove toast
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Fetch user and events data
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("No authentication token found. Please log in.");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
        return;
      }

      try {
        // Fetch user data
        const userResponse = await axios.get("http://localhost:5000/api/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = userResponse.data;
        setUser({
          ...userData,
          isACEMStudent: userData.isACEMStudent || false,
          rollNo: userData.rollNo || "N/A",
        });
        setIsAdmin(userData.isAdmin || false);
        setIsHeadCoordinator(userData.headCoordinatorClubs?.length > 0 || false);
        setUserClubs(userData.clubs?.map((club) => club._id || club) || []);

        // Initialize form data with user details
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          rollNo: userData.rollNo || "",
          college: userData.isACEMStudent ? "ACEM" : "",
        });

        console.log("Events - User:", {
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          isAdmin: userData.isAdmin,
          headCoordinatorClubs: userData.headCoordinatorClubs,
          clubs: userData.clubs,
          isACEMStudent: userData.isACEMStudent,
          rollNo: userData.rollNo,
        });

        // Fetch all events
        const eventsResponse = await axios.get("http://localhost:5000/api/events", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedEvents = (eventsResponse.data || []).map((event) => ({
          ...event,
          category: event.category || "Event",
          club: event.club || { _id: "", name: "Unknown" },
        }));
        setEvents(fetchedEvents);
        setFilteredEvents(fetchedEvents);

        // Filter my events
        const myEvents = fetchedEvents.filter(
          (event) =>
            Array.isArray(event.registeredUsers) &&
            event.registeredUsers.some(
              (reg) => reg?.userId?._id.toString() === userData._id
            )
        );
        setMyEvents(myEvents);

        console.log("Events - All Events:", fetchedEvents);
        console.log("Events - My Events:", myEvents);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err.response?.data);
        setError(err.response?.data?.error || "Failed to load events. Please try again.");
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

  // Filter events
  useEffect(() => {
    const eventsToFilter = activeTab === "all" ? events : myEvents;
    setFilteredEvents(
      eventsToFilter.filter(
        (event) =>
          ((event.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (event.club?.name || "").toLowerCase().includes(searchQuery.toLowerCase())) &&
          (eventFilter === "" || event.category.toLowerCase() === eventFilter.toLowerCase())
      )
    );
  }, [searchQuery, eventFilter, events, myEvents, activeTab]);

  // Handle joining club and registering
  const handleJoinClubAndRegister = async (eventId, clubId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/clubs/${clubId}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
      setUserClubs((prev) => [...prev, clubId]);
      await handleRegister(eventId, true);
      setShowJoinClubPrompt(null);
      addToast("Joined club and registered for the event!");
    } catch (err) {
      console.error("Error joining club:", err.response?.data);
      addToast(err.response?.data?.error || "Failed to join club.", "error");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
      }
    }
  };

  // Handle event registration
  const handleRegister = async (eventId, isAutoRegister = false) => {
    setRegisterLoading((prev) => ({ ...prev, [eventId]: true }));
    try {
      const event = events.find((e) => e._id === eventId);
      if (!event || !event.club?._id) {
        throw new Error("Event or club not found.");
      }

      if (!userClubs.includes(event.club._id.toString()) && !isAutoRegister) {
        setShowJoinClubPrompt({
          eventId,
          clubId: event.club._id,
          clubName: event.club.name,
        });
        setShowRegisterModal(null);
        setRegisterLoading((prev) => ({ ...prev, [eventId]: false }));
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/events/${eventId}/register`,
        {
          name: formData.name,
          email: formData.email,
          rollNo: formData.rollNo,
          isACEMStudent: user.isACEMStudent,
          ...(user.isACEMStudent ? {} : { college: formData.college }),
        },
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
      addToast(response.data.message || "Successfully registered for the event!");

      const updatedEvents = events.map((event) =>
        event._id === eventId
          ? {
              ...event,
              registeredUsers: [
                ...(Array.isArray(event.registeredUsers) ? event.registeredUsers : []),
                {
                  userId: { _id: user._id },
                  name: formData.name,
                  email: formData.email,
                  rollNo: formData.rollNo,
                  isACEMStudent: user.isACEMStudent,
                },
              ],
            }
          : event
      );
      setEvents(updatedEvents);
      setMyEvents([...myEvents, updatedEvents.find((event) => event._id === eventId)]);
      setFilteredEvents(
        activeTab === "all"
          ? updatedEvents.filter(
              (event) =>
                ((event.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (event.club?.name || "").toLowerCase().includes(searchQuery.toLowerCase())) &&
                (eventFilter === "" || event.category.toLowerCase() === eventFilter.toLowerCase())
            )
          : [...myEvents, updatedEvents.find((event) => event._id === eventId)].filter(
              (event) =>
                ((event.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (event.club?.name || "").toLowerCase().includes(searchQuery.toLowerCase())) &&
                (eventFilter === "" || event.category.toLowerCase() === eventFilter.toLowerCase())
            )
      );
      setShowRegisterModal(null);
    } catch (err) {
      console.error("Error registering for event:", err.response?.data);
      addToast(err.response?.data?.error || "Failed to register for event.", "error");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
      }
    }
    setRegisterLoading((prev) => ({ ...prev, [eventId]: false }));
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open registration modal
  const openRegisterModal = (eventId) => {
    const event = events.find((e) => e._id === eventId);
    if (!event) return;
    setShowRegisterModal({ eventId, eventTitle: event.title });
  };

  // Handle event deletion
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedEvents = events.filter((event) => event._id !== eventId);
      setEvents(updatedEvents);
      setMyEvents(myEvents.filter((event) => event._id !== eventId));
      setFilteredEvents(
        activeTab === "all"
          ? updatedEvents.filter(
              (event) =>
                ((event.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (event.club?.name || "").toLowerCase().includes(searchQuery.toLowerCase())) &&
                (eventFilter === "" || event.category.toLowerCase() === eventFilter.toLowerCase())
            )
          : myEvents
              .filter((event) => event._id !== eventId)
              .filter(
                (event) =>
                  ((event.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (event.club?.name || "").toLowerCase().includes(searchQuery.toLowerCase())) &&
                  (eventFilter === "" || event.category.toLowerCase() === eventFilter.toLowerCase())
              )
      );
      addToast("Event deleted successfully!");
    } catch (err) {
      console.error("Error deleting event:", err.response?.data);
      addToast(err.response?.data?.error || "Failed to delete event.", "error");
    }
  };

  const tabs = [
    { id: "all", label: "All Events", icon: Calendar },
    { id: "my", label: "My Events", icon: CheckCircle },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="animate-pulse">
          <div className="h-80 bg-gray-200"></div>
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto text-center">
          <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#456882] text-white rounded-full hover:bg-[#334d5e] transition-colors"
          >
            Try Again
          </button>
          <Link
            to="/login"
            className="ml-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar user={user} role={isAdmin || isHeadCoordinator ? "admin" : "user"} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="fixed top-4 right-4 z-50">
          <AnimatePresence>
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                id={toast.id}
                message={toast.message}
                type={toast.type}
                onClose={removeToast}
              />
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showJoinClubPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-40"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md mx-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#456882]">
                    Join Club First
                  </h3>
                  <button
                    onClick={() => setShowJoinClubPrompt(null)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close prompt"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 mb-4">
                  You need to join{" "}
                  <span className="font-medium">{showJoinClubPrompt.clubName}</span>{" "}
                  to register for this event.
                </p>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      handleJoinClubAndRegister(
                        showJoinClubPrompt.eventId,
                        showJoinClubPrompt.clubId
                      )
                    }
                    className="flex-1 px-4 py-2 bg-[#456882] text-white rounded-full hover:bg-[#334d5e]"
                  >
                    Join Club
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowJoinClubPrompt(null)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRegisterModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-40"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md mx-4 w-full"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#456882]">
                    Register for {showRegisterModal.eventTitle}
                  </h3>
                  <button
                    onClick={() => setShowRegisterModal(null)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#456882]"
                      placeholder="Enter your name"
                      required
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
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#456882]"
                      placeholder="Enter your email"
                      required
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
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#456882]"
                      placeholder="Enter your roll number"
                      required
                    />
                  </div>
                  {!user.isACEMStudent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        College
                      </label>
                      <input
                        type="text"
                        name="college"
                        value={formData.college}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#456882]"
                        placeholder="Enter your college name"
                        required
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-4 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRegister(showRegisterModal.eventId)}
                    disabled={
                      !formData.name ||
                      !formData.email ||
                      !formData.rollNo ||
                      (!user.isACEMStudent && !formData.college) ||
                      registerLoading[showRegisterModal.eventId]
                    }
                    className={`flex-1 px-4 py-2 rounded-full text-white font-medium ${
                      !formData.name ||
                      !formData.email ||
                      !formData.rollNo ||
                      (!user.isACEMStudent && !formData.college) ||
                      registerLoading[showRegisterModal.eventId]
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#456882] hover:bg-[#334d5e]"
                    }`}
                  >
                    {registerLoading[showRegisterModal.eventId] ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                    ) : (
                      "Submit"
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowRegisterModal(null)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative h-96 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#456882] to-[#5a7a98]">
            <img
              src="https://via.placeholder.com/1200x400"
              alt="Events banner"
              className="w-full h-full object-cover opacity-30"
            />
          </div>
          <div className="absolute inset-0 bg-black/20"></div>

          <div className="absolute top-6 left-6">
            <Link
              to="/clubs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Clubs
            </Link>
          </div>

          {(isAdmin || isHeadCoordinator) && (
            <div className="absolute top-6 right-6">
              <Link
                to="/admin/events/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all"
              >
                <Calendar className="w-4 h-4" />
                Add Event
              </Link>
            </div>
          )}

          <div className="absolute bottom-8 left-6 right-6">
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-2"
            >
              Events
            </motion.h1>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-6 text-white/90"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{events.length} events</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>{myEvents.length} registered</span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-2xl">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-white text-[#456882] shadow-md"
                        : "text-gray-600 hover:text-[#456882]"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-[#456882] focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-[#456882] focus:border-[#456882] bg-gray-50 text-sm"
                aria-label="Filter events by category"
              >
                <option value="">All Event Categories</option>
                <option value="Seminar">Seminar</option>
                <option value="Competition">Competition</option>
              </select>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#456882]">
                    {activeTab === "all" ? "All Events" : "My Events"} (
                    {filteredEvents.length})
                  </h2>
                  {(isAdmin || isHeadCoordinator) && (
                    <Link
                      to="/admin/events/new"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-full hover:bg-[#334d5e] transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Add Event
                    </Link>
                  )}
                </div>

                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      {searchQuery || eventFilter ? "No events found" : "No events yet"}
                    </h3>
                    <p className="text-gray-500">
                      {searchQuery || eventFilter
                        ? "Try adjusting your search or filter"
                        : activeTab === "all"
                        ? "Check back later for upcoming events!"
                        : "You haven't registered for any events yet."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event, index) => (
                      <motion.div
                        key={event._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-[#456882]">
                              {event.title || "Untitled Event"}
                            </h3>
                            <span
                              className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                event.category === "Seminar"
                                  ? "bg-blue-100 text-blue-600"
                                  : event.category === "Competition"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                            </span>
                          </div>
                          {(isAdmin || isHeadCoordinator) && (
                            <div className="flex gap-2">
                              <Link
                                to={`/events/${event._id}/edit`}
                                className="p-1 text-gray-400 hover:text-[#456882]"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteEvent(event._id)}
                                className="p-1 text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 mb-3">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            {event.date ? new Date(event.date).toLocaleDateString() : "TBD"}{" "}
                            {event.time || ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 mb-3">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{event.location || "TBD"}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          <span className="font-medium">Club:</span>{" "}
                          {event.club?.name || "Unknown"}
                        </p>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {event.description || "No description available."}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => openRegisterModal(event._id)}
                          disabled={
                            (Array.isArray(event.registeredUsers) &&
                              event.registeredUsers.some(
                                (reg) => reg?.userId?._id.toString() === user._id
                              )) ||
                            registerLoading[event._id]
                          }
                          className={`w-full py-2 px-4 rounded-full text-white font-medium transition-colors shadow-lg ${
                            Array.isArray(event.registeredUsers) &&
                            event.registeredUsers.some(
                              (reg) => reg?.userId?._id.toString() === user._id
                            )
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-[#456882] to-[#5a7a98] hover:from-[#334d5e] hover:to-[#456882]"
                          } ${registerLoading[event._id] ? "opacity-50" : ""}`}
                        >
                          {registerLoading[event._id] ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                          ) : Array.isArray(event.registeredUsers) &&
                            event.registeredUsers.some(
                              (reg) => reg?.userId?._id.toString() === user._id
                            ) ? (
                            "Already Registered"
                          ) : (
                            "Register"
                          )}
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Events;
