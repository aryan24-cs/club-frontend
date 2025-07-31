import React, { memo, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Plus,
  Trash2,
  Edit3,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Filter,
} from "lucide-react";
import Navbar from "./Navbar";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8 text-[#456882]">
          <h2 className="text-2xl font-bold">Something went wrong.</h2>
          <p>
            {this.state.error?.message ||
              "Please try refreshing the page or contact support."}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 px-6 py-2 bg-[#456882] text-white rounded-full"
            onClick={() => window.location.reload()}
          >
            Retry
          </motion.button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Memoized EventCard Component
const EventCard = memo(({ event, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ type: "spring", stiffness: 100, damping: 15 }}
    whileHover={{ scale: 1.03, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
    className="p-6 bg-white rounded-xl shadow-md border border-gray-200"
  >
    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="flex items-center gap-3">
        <Calendar className="text-[#456882] text-xl" />
        <h4 className="text-lg font-semibold text-gray-900">
          {event.title || "Untitled Event"}
        </h4>
      </div>
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          event.category === "Seminar"
            ? "bg-blue-100 text-blue-600"
            : event.category === "Competition"
            ? "bg-green-100 text-green-600"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {event.category || "Event"}
      </span>
    </div>
    <img
      src={
        event.banner
          ? `http://localhost:5000${event.banner.startsWith("/") ? "" : "/"}${
              event.banner
            }`
          : "https://content3.jdmagicbox.com/v2/comp/faridabad/c2/011pxx11.xx11.180720042429.n1c2/catalogue/aravali-college-of-engineering-and-management-jasana-faridabad-colleges-5hhqg5d110.jpg"
      }
      alt={event.title || "Event Banner"}
      className="w-full h-24 object-cover rounded-lg mb-3"
      onError={(e) => {
        e.target.src = "https://content3.jdmagicbox.com/v2/comp/faridabad/c2/011pxx11.xx11.180720042429.n1c2/catalogue/aravali-college-of-engineering-and-management-jasana-faridabad-colleges-5hhqg5d110.jpg";
        console.warn(
          `Failed to load banner for event ${event.title || "Untitled"}: ${
            event.banner || "No banner"
          }`
        );
      }}
    />
    <p className="text-gray-600 text-sm mb-2">
      {event.date ? new Date(event.date).toLocaleDateString() : "No date"} at{" "}
      {event.time || "No time"}
    </p>
    <p className="text-gray-600 text-sm mb-2">
      Location: {event.location || "No location"}
    </p>
    <p className="text-gray-700 mb-3 line-clamp-2">
      {event.description || "No description"}
    </p>
    <p className="text-gray-500 text-sm mb-3">
      Club: {event.clubName || "Unknown Club"}
    </p>
    <div className="flex gap-2">
      <Link
        to={`/events/${event._id}/edit`}
        className="flex items-center gap-1 text-[#456882] hover:text-[#334d5e] font-medium transition text-sm"
        aria-label={`Edit ${event.title || "event"}`}
      >
        <Edit3 className="w-4 h-4" />
        Edit
      </Link>
      <button
        onClick={() => onDelete(event._id, event.title)}
        className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium transition text-sm"
        aria-label={`Delete ${event.title || "event"}`}
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
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
    category: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Skip rendering if user or clubs are not available
  if (!user || !clubs) {
    console.log(
      "HostEventForm - Skipping render: user or clubs not available",
      { user, clubs }
    );
    return null;
  }

  // Filter clubs where user is a creator or super admin (or head coordinator for specific clubs)
  const eligibleClubs = clubs.filter((club) => {
    if (!club) return false;
    return (
      club.creator?._id?.toString() === user._id?.toString() ||
      club.superAdmins?.some(
        (admin) => admin?._id?.toString() === user._id?.toString()
      ) ||
      (user.headCoordinatorClubs || []).includes(club.name)
    );
  });

  // Debug logging for user and clubs
  useEffect(() => {
    console.log("HostEventForm - User:", {
      _id: user._id || "null",
      name: user.name || "null",
      isAdmin: user.isAdmin || false,
      headCoordinatorClubs: user.headCoordinatorClubs || [],
      isACEMStudent: user.isACEMStudent || false,
      rollNo: user.rollNo || "N/A",
    });
    console.log("HostEventForm - All Clubs:", clubs);
    console.log("HostEventForm - Eligible Clubs:", eligibleClubs);
  }, [user, clubs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    // Validate form data
    const { title, description, date, time, location, club, category } = formData;
    if (!title || !description || !date || !time || !location || !club || !category) {
      setFormError("All fields including category are required.");
      setSubmitting(false);
      return;
    }
    if (!["Seminar", "Competition"].includes(category)) {
      setFormError("Invalid category. Please select Seminar or Competition.");
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "banner" && value) {
          formPayload.append("banner", value);
        } else if (value) {
          formPayload.append(key, key === "date" ? new Date(value).toISOString().split("T")[0] : value);
        }
      });

      // Debug: Log form payload
      const payloadEntries = [];
      for (let [key, value] of formPayload.entries()) {
        payloadEntries.push({ key, value: value instanceof File ? value.name : value });
      }
      console.log("HostEventForm - Form Payload:", payloadEntries);

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
        category: "",
      });
      onSuccess("Event created successfully!", response.data);
    } catch (err) {
      console.error("Event creation error:", err);
      const errorMsg =
        err.response?.data?.error || err.message || "Failed to create event.";
      setFormError(errorMsg);
      onError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "banner" && files && files[0]) {
      if (files[0].size > 5 * 1024 * 1024) {
        setFormError("Banner image must be less than 5MB.");
        return;
      }
    }
    const newValue =
      name === "category" && value
        ? value.charAt(0).toUpperCase() + value.slice(1)
        : files
        ? files[0]
        : value;
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-200"
    >
      <h2 className="text-2xl font-semibold text-[#456882] mb-4">
        Host a New Event
      </h2>
      {eligibleClubs.length === 0 ? (
        <p className="text-sm text-gray-600">
          You are not authorized to host events for any club.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-100 text-red-700 p-3 rounded-sm text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {formError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title || ""}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-[#456882] focus:border-[#456882] bg-gray-50 text-sm"
              placeholder="Enter event title"
              aria-label="Event title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-[#456882] focus:border-[#456882] bg-gray-50 text-sm"
              placeholder="Describe the event"
              rows="4"
              aria-label="Event description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Event Category
            </label>
            <select
              name="category"
              value={formData.category || ""}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-[#456882] bg-gray-50 text-sm"
              aria-label="Event category"
            >
              <option value="">Select event category</option>
              <option value="Seminar">Seminar</option>
              <option value="Competition">Competition</option>
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date || ""}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-[#456882] focus:border-[#456882] bg-gray-50 text-sm"
                aria-label="Event date"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time || ""}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-[#456882] focus:border-[#456882] bg-gray-50 text-sm"
                aria-label="Event time"
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
              value={formData.location || ""}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-[#456882] focus:border-[#456882] bg-gray-50 text-sm"
              placeholder="Enter event location"
              aria-label="Event location"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Club
            </label>
            <select
              name="club"
              value={formData.club || ""}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-[#456882] bg-gray-50 text-sm"
              aria-label="Select club"
            >
              <option value="">Select a club</option>
              {eligibleClubs.map((club, index) => (
                <option key={club?._id || `club-${index}`} value={club?._id}>
                  {club?.name || "Unknown Club"}
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
              accept="image/jpeg,image/png"
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-gray-100 bg-gray-50 text-sm"
              aria-label="Upload banner image"
            />
          </div>
          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: submitting ? 1 : 1.05 }}
            whileTap={{ scale: submitting ? 1 : 0.95 }}
            className={`w-full px-4 py-2 rounded-sm text-sm font-semibold transition-colors ${
              submitting
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#456882] text-white hover:bg-[#334d5e]"
            }`}
            aria-label={submitting ? "Creating event" : "Create event"}
          >
            {submitting ? "Creating..." : "Create Event"}
          </motion.button>
        </form>
      )}
    </motion.div>
  );
});

const ManageEvents = () => {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState("");
  const navigate = useNavigate();

  // Debounced fetchData to prevent race conditions
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        navigate("/login");
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [userResponse, clubsResponse, eventsResponse] = await Promise.all([
        axios
          .get("http://localhost:5000/api/auth/user", config)
          .catch(() => ({ data: null })),
        axios
          .get("http://localhost:5000/api/clubs", config)
          .catch(() => ({ data: [] })),
        axios
          .get("http://localhost:5000/api/events", config)
          .catch(() => ({ data: [] })),
      ]);

      const userData = userResponse.data;
      if (!userData || !userData._id) {
        setError("Failed to load user data.");
        navigate("/login");
        return;
      }
      setUser({
        ...userData,
        isACEMStudent: userData.isACEMStudent || false,
        rollNo: userData.rollNo || "N/A",
      });

      // Debug logging
      console.log("ManageEvents - User:", {
        _id: userData._id || "null",
        name: userData.name || "null",
        isAdmin: userData.isAdmin || false,
        headCoordinatorClubs: userData.headCoordinatorClubs || [],
        isACEMStudent: userData.isACEMStudent || false,
        rollNo: userData.rollNo || "N/A",
      });
      console.log("ManageEvents - All Clubs:", clubsResponse.data || []);

      // Filter clubs based on user role
      let managedClubs = [];
      const isHeadCoordinator = (userData.headCoordinatorClubs || []).length > 0;
      if (isHeadCoordinator) {
        managedClubs = (clubsResponse.data || []).filter((club) =>
          userData.headCoordinatorClubs.includes(club.name)
        );
        console.log("ManageEvents - Filtered clubs for Head Coordinator:", managedClubs);
      } else {
        // For both global admins and super admins, only show clubs they created or are super admins for
        managedClubs = (clubsResponse.data || []).filter(
          (club) =>
            club.creator?._id?.toString() === userData._id?.toString() ||
            club.superAdmins?.some(
              (admin) => admin?._id?.toString() === userData._id?.toString()
            )
        );
        console.log("ManageEvents - Filtered clubs for Admin/Super Admin:", managedClubs);
      }

      setClubs(managedClubs);

      // Filter events
      let filteredEvents = eventsResponse.data || [];
      const managedClubIds = managedClubs
        .map((club) => club?._id?.toString())
        .filter(Boolean);
      filteredEvents = filteredEvents.filter((event) => {
        const clubId =
          event.club?._id?.toString() || event.clubId?.toString();
        return clubId && managedClubIds.includes(clubId);
      });
      console.log("ManageEvents - Filtered events:", filteredEvents);

      // Enhance events with club names and category
      const eventsWithClubNames = filteredEvents.map((event, index) => {
        const club = (clubsResponse.data || []).find((c) => {
          const cId = c?._id?.toString();
          const eId = event.club?._id?.toString() || event.clubId?.toString();
          return cId === eId;
        });
        return {
          ...event,
          _id: event._id || `event-${index}`,
          clubName: club?.name || "Unknown Club",
          banner: event.banner || null,
          category: event.category || "Event",
        };
      });

      setEvents(eventsWithClubNames);
      console.log(
        "ManageEvents - Filtered Events with Club Names:",
        eventsWithClubNames
      );

      // Set error if no clubs or events are available
      if (managedClubs.length === 0 && filteredEvents.length === 0) {
        setError("You do not have access to manage any clubs or events.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        setError("Session expired or unauthorized. Please log in again.");
        navigate("/login");
      } else {
        setError(
          err.response?.data?.error || err.message || "Failed to load data."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (eventId, eventTitle) => {
    if (
      !window.confirm(
        `Delete event "${eventTitle || "Untitled"}"? This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
      setSuccess("Event deleted successfully.");
    } catch (err) {
      console.error("Delete error:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to delete event."
      );
    }
  };

  // Filter events based on category
  const filteredEvents = events.filter(
    (event) =>
      eventFilter === "" ||
      event.category.toLowerCase() === eventFilter.toLowerCase()
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-[#456882] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 text-gray-900 font-[Poppins]">
        <Navbar
          user={user}
          role={
            user?.headCoordinatorClubs?.length > 0
              ? "headCoordinator"
              : user?.isAdmin
              ? "admin"
              : "superAdmin"
          }
        />
        <section className="py-12 bg-gray-100">
          <div className="container mx-auto px-4 sm:px-6">
            {user && clubs && (
              <HostEventForm
                user={user}
                clubs={clubs}
                onSuccess={(msg, newEvent) => {
                  setSuccess(msg);
                  setEvents((prev) => {
                    const club = clubs.find(
                      (c) =>
                        c?._id?.toString() ===
                        (newEvent.club?._id?.toString() ||
                          newEvent.clubId?.toString())
                    );
                    return [
                      {
                        ...newEvent,
                        clubName: club?.name || "Unknown Club",
                        banner: newEvent.banner || null,
                        category: newEvent.category || "Event",
                      },
                      ...prev,
                    ];
                  });
                }}
                onError={setError}
              />
            )}
          </div>
        </section>
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-2xl font-semibold text-[#456882]"
              >
                Manage Events
              </motion.h2>
              <div className="relative mt-4 sm:mt-0">
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
            {filteredEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <p className="text-gray-600 text-sm sm:text-base mb-4">
                  No events found.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-[#456882] text-white rounded-lg hover:bg-[#334d5e] text-sm sm:text-sm"
                  onClick={() =>
                    document.querySelector('input[name="title"]')?.focus()
                  }
                  aria-label="Create new event"
                >
                  Create New Event
                </motion.button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                  <EventCard
                    key={event._id || `event-${index}`}
                    event={event}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-4 right-4 bg-red-600 text-white rounded-lg p-4 shadow-lg text-sm"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <p>{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className="absolute top-2 right-2"
                aria-label="Dismiss error"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-4 right-4 bg-green-600 text-white rounded-lg p-4 shadow-lg text-sm"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <p>{success}</p>
              </div>
              <button
                onClick={() => setSuccess("")}
                className="absolute top-2 right-2"
                aria-label="Dismiss success"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default ManageEvents;
