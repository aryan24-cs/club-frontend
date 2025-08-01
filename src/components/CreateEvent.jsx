import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaSpinner, FaSave } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [event, setEvent] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    club: "", // Changed from clubId to match backend
    banner: null,
    category: "", // Changed from type to match backend
    eventType: "Intra-College", // Changed from eventScope to match backend
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
        const [userResponse, clubsResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/auth/user`, config),
          axios.get(`${process.env.REACT_APP_API_URL}/api/clubs`, config),
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
        if (filteredClubs.length === 0) {
          setError("You do not have permission to create events.");
          navigate("/manage-events");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.error || "Failed to load data.");
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

  const handleInputChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    setEvent((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        navigate("/login");
        return;
      }

      // Validate required fields
      if (
        !event.title ||
        !event.date ||
        !event.time ||
        !event.location ||
        !event.description ||
        !event.club ||
        !event.category ||
        !event.eventType
      ) {
        throw new Error("All required fields must be filled.");
      }

      // Validate fees for Inter-College events with registration fee
      if (event.eventType === "Inter-College" && event.hasRegistrationFee) {
        if (!event.acemFee || !event.nonAcemFee || event.acemFee < 0 || event.nonAcemFee < 0) {
          throw new Error("Valid registration fees are required for Inter-College events.");
        }
      }

      const formData = new FormData();
      Object.entries(event).forEach(([key, value]) => {
        if (key === "banner" && value) {
          formData.append(key, value);
        } else if (value !== null && value !== undefined && key !== "banner") {
          formData.append(key, value);
        }
      });

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };
      await axios.post(`${process.env.REACT_APP_API_URL}/api/events`, formData, config);
      setError("Event created successfully!");
      setTimeout(() => navigate("/manage-events"), 2000);
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err.response?.data?.error || "Failed to create event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            Create New Event
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
            {event.eventType === "Inter-College" && (
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
            )}
            {event.eventType === "Inter-College" && event.hasRegistrationFee && (
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
              aria-label="Create Event"
            >
              {isSubmitting ? (
                <FaSpinner className="animate-spin inline-block mr-2" />
              ) : (
                <FaSave className="inline-block mr-2" />
              )}
              Create Event
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
  );
};

export default CreateEventPage;