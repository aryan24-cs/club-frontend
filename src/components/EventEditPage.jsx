import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaSpinner, FaSave } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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
        <div className="text-center p-8 text-[#456882]">
          <h2 className="text-2xl font-bold">Something went wrong.</h2>
          <p>Please try refreshing the page or contact support.</p>
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
    clubId: "",
    banner: null,
    type: "",
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
          axios.get("http://localhost:5000/api/auth/user", config),
          axios.get(`http://localhost:5000/api/events/${id}`, config),
          axios.get("http://localhost:5000/api/clubs", config),
        ]);

        const userData = userResponse.data;
        setUser({
          ...userData,
          isACEMStudent: userData.isACEMStudent || false,
          rollNo: userData.rollNo || "N/A",
        });

        // Debug logging
        console.log("EditEventPage - User:", {
          _id: userData._id,
          name: userData.name,
          isAdmin: userData.isAdmin,
          headCoordinatorClubs: userData.headCoordinatorClubs,
          isACEMStudent: userData.isACEMStudent || false,
          rollNo: userData.rollNo || "N/A",
        });
        console.log("EditEventPage - Event:", eventResponse.data);
        console.log("EditEventPage - All Clubs:", clubsResponse.data);

        // Determine user role
        const isGlobalAdmin = userData.isAdmin;
        const isSuperAdmin = clubsResponse.data.some((club) =>
          club.superAdmins?.some(
            (admin) => admin?._id?.toString() === userData._id?.toString()
          )
        );
        const isAdmin = userData.headCoordinatorClubs?.length > 0;

        console.log("EditEventPage - Roles:", {
          isGlobalAdmin,
          isSuperAdmin,
          isAdmin,
        });

        // Filter clubs
        let filteredClubs = [];
        if (isGlobalAdmin) {
          filteredClubs = clubsResponse.data;
          console.log("EditEventPage - Showing all clubs for global admin");
        } else if (isSuperAdmin) {
          filteredClubs = clubsResponse.data.filter((club) =>
            club.superAdmins?.some(
              (admin) => admin?._id?.toString() === userData._id?.toString()
            )
          );
          console.log(
            "EditEventPage - Filtered clubs for SuperAdmin:",
            filteredClubs
          );
        } else if (isAdmin) {
          filteredClubs = clubsResponse.data.filter((club) =>
            userData.headCoordinatorClubs?.includes(club.name)
          );
          console.log(
            "EditEventPage - Filtered clubs for Admin:",
            filteredClubs
          );
        } else {
          console.log("EditEventPage - No clubs for user");
        }

        setClubs(filteredClubs);

        // Set event data with formatted fields
        const eventData = eventResponse.data;
        setEvent({
          title: eventData.title || "",
          date: eventData.date
            ? new Date(eventData.date).toISOString().split("T")[0]
            : "",
          time: eventData.time || "",
          location: eventData.location || "",
          description: eventData.description || "",
          clubId: eventData.club?._id || eventData.clubId || "",
          banner: null, // File input is not pre-filled
          type: eventData.type || "",
        });

        // Validate access
        if (
          !isGlobalAdmin &&
          !filteredClubs.some(
            (club) =>
              club._id.toString() ===
              (eventData.club?._id || eventData.clubId)?.toString()
          )
        ) {
          setError("You do not have permission to edit this event.");
          navigate("/manage-events");
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
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      Object.entries(event).forEach(([key, value]) => {
        if (key === "banner" && value) {
          formData.append("banner", value);
        } else if (value && key !== "banner") {
          formData.append(key, value);
        }
      });

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };
      await axios.put(`http://localhost:5000/api/events/${id}`, formData, config);
      setError("Event updated successfully!");
      setTimeout(() => navigate("/manage-events"), 2000);
    } catch (err) {
      console.error("Error updating event:", err);
      setError(err.response?.data?.error || "Failed to update event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setEvent((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

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
            <FaSpinner className="text-4xl text-[#456882] animate-spin" />
          </motion.div>
        )}
        <Navbar user={user} role={user?.isAdmin ? "admin" : user?.headCoordinatorClubs?.length > 0 ? "admin" : "superAdmin"} />
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
                  htmlFor="event-type"
                >
                  Event Type
                </label>
                <select
                  id="event-type"
                  name="type"
                  value={event.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#456882]"
                  required
                  aria-label="Select Event Type"
                >
                  <option value="">Select Event Type</option>
                  <option value="seminar">Seminar</option>
                  <option value="competition">Competition</option>
                  <option value="workshop">Workshop</option>
                  <option value="cultural">Cultural</option>
                  <option value="technical">Technical</option>
                  <option value="literary">Literary</option>
                  <option value="entrepreneurial">Entrepreneurial</option>
                </select>
              </div>
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
                  name="clubId"
                  value={event.clubId}
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
                  accept="image/*"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#456882]"
                  aria-label="Upload Banner Image"
                />
              </div>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                className={`w-full px-6 py-3 rounded-full font-semibold transition ${
                  isSubmitting
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-[#456882] text-white hover:bg-[#334d5e]"
                }`}
                aria-label="Save Event"
              >
                {isSubmitting ? (
                  <FaSpinner className="animate-spin inline-block mr-2" />
                ) : (
                  <FaSave className="inline-block mr-2" />
                )}
                Save Event
              </motion.button>
            </motion.form>
          </div>
        </motion.section>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-4 right-4 bg-[#456882] text-white rounded-lg p-4 shadow-lg"
          >
            <p className="text-sm">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-2 text-white underline"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              Dismiss
            </motion.button>
          </motion.div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default EditEventPage;
