import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Calendar, Save, X } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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
          <p className="mt-2">
            {this.state.error?.message || "Please try refreshing the page or contact support."}
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

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    club: "",
    banner: null,
    category: "",
    eventType: "Intra-College",
    hasRegistrationFee: false,
    acemFee: "",
    nonAcemFee: "",
  });
  const [clubs, setClubs] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

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
        const [userResponse, eventResponse, clubsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/user', config),
          axios.get('http://localhost:5000/api/events/:id', config),
          axios.get('http://localhost:5000/api/clubs', config),
        ]);

        const userData = userResponse.data;
        setUser({
          ...userData,
          isACEMStudent: userData.isACEMStudent || false,
          rollNo: userData.rollNo || "N/A",
        });

        const isGlobalAdmin = userData.isAdmin;
        const isSuperAdmin = clubsResponse.data.some((club) =>
          club.superAdmins?.some(
            (admin) => admin?._id?.toString() === userData._id?.toString()
          )
        );
        const isHeadCoordinator = userData.headCoordinatorClubs?.length > 0;

        let filteredClubs = [];
        if (isGlobalAdmin) {
          filteredClubs = clubsResponse.data;
        } else if (isSuperAdmin) {
          filteredClubs = clubsResponse.data.filter((club) =>
            club.superAdmins?.some(
              (admin) => admin?._id?.toString() === userData._id?.toString()
            )
          );
        } else if (isHeadCoordinator) {
          filteredClubs = clubsResponse.data.filter((club) =>
            userData.headCoordinatorClubs?.includes(club.name)
          );
        }

        setClubs(filteredClubs);

        const eventData = eventResponse.data;
        setEvent({
          title: eventData.title || "",
          date: eventData.date ? new Date(eventData.date).toISOString().split("T")[0] : "",
          time: eventData.time || "",
          location: eventData.location || "",
          description: eventData.description || "",
          club: eventData.club?._id || eventData.club || "",
          banner: null,
          category: eventData.category || "",
          eventType: eventData.eventType || "Intra-College",
          hasRegistrationFee: eventData.hasRegistrationFee || false,
          acemFee: eventData.acemFee || "",
          nonAcemFee: eventData.nonAcemFee || "",
        });

        if (
          !isGlobalAdmin &&
          !isSuperAdmin &&
          !isHeadCoordinator
        ) {
          setError("You do not have permission to edit this event.");
          navigate("/events");
          return;
        }
        if (
          !isGlobalAdmin &&
          !filteredClubs.some(
            (club) =>
              club._id.toString() ===
              (eventData.club?._id || eventData.club)?.toString()
          )
        ) {
          setError("You do not have permission to edit this event.");
          navigate("/events");
          return;
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.error || "Failed to load event data.");
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          setError("Session expired or unauthorized. Please log in again.");
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!event.title || !event.description || !event.date || !event.time || !event.location || !event.club || !event.category) {
      setError("All required fields must be filled.");
      return;
    }
    if (!["Seminar", "Competition"].includes(event.category)) {
      setError("Invalid category. Please select Seminar or Competition.");
      return;
    }
    if (!["Intra-College", "Inter-College"].includes(event.eventType)) {
      setError("Invalid event type.");
      return;
    }
    if (event.eventType === "Inter-College" && event.hasRegistrationFee) {
      if (!event.acemFee || !event.nonAcemFee || isNaN(event.acemFee) || isNaN(event.nonAcemFee) || event.acemFee < 0 || event.nonAcemFee < 0) {
        setError("Valid registration fees are required for Inter-College events.");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      Object.entries(event).forEach(([key, value]) => {
        if (key === "banner" && value) {
          formData.append("banner", value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };
      await axios.put('http://localhost:5000/api/events/:id', formData, config);
      setError("");
      addToast("Event updated successfully!");
      setTimeout(() => navigate("/events"), 2000);
    } catch (err) {
      console.error("Error updating event:", err);
      setError(err.response?.data?.error || "Failed to update event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === "banner" && files && files[0]) {
      if (files[0].size > 5 * 1024 * 1024) {
        setError("Banner image must be less than 5MB.");
        return;
      }
    }
    const newValue = type === "checkbox" ? checked : files ? files[0] : value;
    setEvent((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const [toasts, setToasts] = useState([]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 font-[Poppins]">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50"
          >
            <Calendar className="text-4xl text-[#456882] animate-spin" />
          </motion.div>
        )}
        <Navbar
          user={user}
          role={
            user?.isAdmin
              ? "admin"
              : user?.headCoordinatorClubs?.length > 0
              ? "headCoordinator"
              : "superAdmin"
          }
        />
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="py-12 bg-gradient-to-br from-[#456882]/10 to-gray-50"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#456882]">
              Edit Event
            </h2>
            <motion.form
              onSubmit={handleSubmit}
              className="max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded-sm text-sm flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="event-title"
                >
                  Event Title
                </label>
                <input
                  id="event-title"
                  type="text"
                  name="title"
                  value={event.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#456882]"
                  required
                  aria-label="Event Title"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="event-category"
                >
                  Event Category
                </label>
                <select
                  id="event-category"
                  name="category"
                  value={event.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#456882]"
                  required
                  aria-label="Select Event Category"
                >
                  <option value="">Select Event Category</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Competition">Competition</option>
                </select>
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="event-type"
                >
                  Event Type
                </label>
                <select
                  id="event-type"
                  name="eventType"
                  value={event.eventType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#456882]"
                  required
                  aria-label="Select Event Type"
                >
                  <option value="Intra-College">Intra-College</option>
                  <option value="Inter-College">Inter-College</option>
                </select>
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="has-registration-fee"
                >
                  Has Registration Fee?
                </label>
                <input
                  id="has-registration-fee"
                  type="checkbox"
                  name="hasRegistrationFee"
                  checked={event.hasRegistrationFee}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#456882] focus:ring-[#456882] border-gray-300 rounded"
                  aria-label="Has Registration Fee"
                />
              </div>
              {event.hasRegistrationFee && event.eventType === "Inter-College" && (
                <>
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-semibold mb-2"
                      htmlFor="acem-fee"
                    >
                      ACEM Student Fee (₹)
                    </label>
                    <input
                      id="acem-fee"
                      type="number"
                      name="acemFee"
                      value={event.acemFee}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#456882]"
                      required
                      min="0"
                      aria-label="ACEM Student Fee"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-semibold mb-2"
                      htmlFor="non-acem-fee"
                    >
                      Non-ACEM Student Fee (₹)
                    </label>
                    <input
                      id="non-acem-fee"
                      type="number"
                      name="nonAcemFee"
                      value={event.nonAcemFee}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#456882]"
                      required
                      min="0"
                      aria-label="Non-ACEM Student Fee"
                    />
                  </div>
                </>
              )}
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="event-date"
                >
                  Date
                </label>
                <input
                  id="event-date"
                  type="date"
                  name="date"
                  value={event.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#456882]"
                  required
                  aria-label="Event Date"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="event-time"
                >
                  Time
                </label>
                <input
                  id="event-time"
                  type="time"
                  name="time"
                  value={event.time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#456882]"
                  required
                  aria-label="Event Time"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="event-location"
                >
                  Location
                </label>
                <input
                  id="event-location"
                  type="text"
                  name="location"
                  value={event.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#456882]"
                  required
                  aria-label="Event Location"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="event-description"
                >
                  Description
                </label>
                <textarea
                  id="event-description"
                  name="description"
                  value={event.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#456882]"
                  rows="4"
                  required
                  aria-label="Event Description"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="event-club"
                >
                  Club
                </label>
                <select
                  id="event-club"
                  name="club"
                  value={event.club}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#456882]"
                  required
                  aria-label="Select Club"
                >
                  <option value="">Select a Club</option>
                  {clubs.map((club) => (
                    <option key={club._id} value={club._id}>
                      {club.name || "Unknown Club"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="event-banner"
                >
                  Banner Image
                </label>
                <input
                  id="event-banner"
                  type="file"
                  name="banner"
                  onChange={handleInputChange}
                  accept="image/jpeg,image/png"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#456882]"
                  aria-label="Upload Banner Image"
                />
              </div>
              <div className="flex gap-4">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                  className={`flex-1 px-6 py-3 rounded-full font-semibold transition ${
                    isSubmitting
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-[#456882] text-white hover:bg-[#334d5e]"
                  }`}
                  aria-label="Save Event"
                >
                  {isSubmitting ? (
                    <Calendar className="animate-spin inline-block mr-2" />
                  ) : (
                    <Save className="inline-block mr-2" />
                  )}
                  Save Changes
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => navigate("/events")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-6 py-3 rounded-full font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                  aria-label="Cancel"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.form>
          </div>
        </motion.section>
        <div className="fixed top-4 right-4 z-50">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`max-w-xs p-4 rounded-lg shadow-lg flex items-center justify-between gap-2 text-white ${
                  toast.type === "error" ? "bg-red-600" : "bg-green-600"
                }`}
              >
                <span className="text-sm">{toast.message}</span>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-white hover:text-gray-200"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default EditEventPage;