import React, { memo, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Trash2,
  Edit3,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Filter,
  Plus,
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
        <div className="text-center p-8 text-gray-700">
          <h2 className="text-2xl font-bold">Something went wrong.</h2>
          <p className="mt-2">
            {this.state.error?.message ||
              "Please try refreshing the page or contact support."}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
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
const EventCard = memo(({ event, user, onRegister, onDelete }) => {
  const canManage =
    user?.isAdmin ||
    user?.headCoordinatorClubs?.includes(event.clubName) ||
    event.club?.superAdmins?.some(
      (admin) => admin?._id?.toString() === user?._id?.toString()
    );

  const isPrivilegedUser =
    user?.isAdmin ||
    (Array.isArray(user?.headCoordinatorClubs) &&
      user?.headCoordinatorClubs.length > 0) ||
    event.club?.superAdmins?.some(
      (admin) => admin?._id?.toString() === user?._id?.toString()
    );

  const isRegistered =
    !isPrivilegedUser &&
    Array.isArray(event.registeredUsers) &&
    event.registeredUsers.some(
      (reg) => reg?.userId?._id?.toString() === user?._id?.toString()
    );

  const isRestricted =
    !isPrivilegedUser &&
    event.eventType === "Intra-College" &&
    !user?.isACEMStudent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      whileHover={{ scale: 1.03, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
      className="p-6 bg-white rounded-xl shadow-md border border-gray-200 relative"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <Calendar className="text-blue-600 text-xl" />
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
          event.banner ||
          "https://content3.jdmagicbox.com/v2/comp/faridabad/c2/011pxx11.xx11.180720042429.n1c2/catalogue/aravali-college-of-engineering-and-management-jasana-faridabad-colleges-5hhqg5d110.jpg"
        }
        alt={event.title || "Event Banner"}
        className="w-full h-24 object-cover rounded-lg mb-3"
        onError={(e) => {
          e.target.src =
            "https://content3.jdmagicbox.com/v2/comp/faridabad/c2/011pxx11.xx11.180720042429.n1c2/catalogue/aravali-college-of-engineering-and-management-jasana-faridabad-colleges-5hhqg5d110.jpg";
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
      <p className="text-gray-600 text-sm mb-2">
        Type: {event.eventType || "Intra-College"}
      </p>
      {event.eventType === "Inter-College" && (
        <p className="text-gray-600 text-sm mb-2">
          Registration Fee:{" "}
          {event.hasRegistrationFee
            ? `ACEM: ₹${event.acemFee || 0}, Non-ACEM: ₹${
                event.nonAcemFee || 0
              }`
            : "Free"}
        </p>
      )}
      <p className="text-gray-700 mb-3 line-clamp-2">
        {event.description || "No description"}
      </p>
      <p className="text-gray-500 text-sm mb-3">
        Club: {event.clubName || "Unknown Club"}
      </p>
      <div className="flex gap-2">
        {canManage && (
          <>
            <Link
              to={`/events/${event._id}/edit`}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition text-sm"
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
          </>
        )}
      </div>
      {!isPrivilegedUser && (
        <motion.button
          whileHover={{ scale: isRegistered || isRestricted ? 1 : 1.05 }}
          whileTap={{ scale: isRegistered || isRestricted ? 1 : 0.95 }}
          onClick={() => onRegister(event)}
          disabled={isRegistered || isRestricted}
          className={`absolute top-4 right-4 px-3 py-1 rounded-sm text-xs font-semibold transition-colors ${
            isRegistered || isRestricted
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
          aria-label={`Register for ${event.title}`}
        >
          {isRegistered
            ? "Already Registered"
            : isRestricted
            ? "Restricted to ACEM Students"
            : "Register"}
        </motion.button>
      )}
    </motion.div>
  );
});

// Event Registration Modal
const EventRegistrationModal = memo(
  ({ event, user, onClose, onSuccess, onError }) => {
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState({
      cardNumber: "",
      expiry: "",
      cvv: "",
    });
    const [formError, setFormError] = useState("");
    const navigate = useNavigate();

    const handlePaymentChange = (e) => {
      const { name, value } = e.target;
      setPaymentDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleRegister = async () => {
      if (!user) {
        onError("Please log in to register for the event.");
        navigate("/login");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        if (event.hasRegistrationFee && event.eventType === "Inter-College") {
          if (
            !paymentDetails.cardNumber ||
            !paymentDetails.expiry ||
            !paymentDetails.cvv
          ) {
            setFormError("Please fill in all payment details.");
            return;
          }
          setPaymentProcessing(true);
          console.log("Simulating payment:", paymentDetails);
        }

        const response = await axios.post(
          `http://localhost:5000/api/events/${event._id}/register`,
          {
            name: user.name,
            email: user.email,
            rollNo: user.isACEMStudent ? user.rollNo : undefined,
            isACEMStudent: user.isACEMStudent,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!user.isACEMStudent && event.eventType === "Inter-College") {
          setQrCode(response.data.qrCode);
        }
        onSuccess(
          user.isACEMStudent
            ? "Successfully joined the club and registered for the event!"
            : "Registration successful! Check your QR code."
        );
      } catch (err) {
        console.error("Event registration error:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        setFormError(
          err.response?.data?.error ||
            err.message ||
            "Failed to register for event."
        );
        onError(
          err.response?.data?.error ||
            err.message ||
            "Failed to register for event."
        );
      } finally {
        setPaymentProcessing(false);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-600">
              Register for {event.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          {formError && (
            <div className="bg-red-100 text-red-700 p-3 rounded-sm text-sm flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4" />
              {formError}
            </div>
          )}
          {qrCode ? (
            <div className="text-center">
              <img
                src={qrCode}
                alt="Registration QR Code"
                className="mx-auto mb-4"
              />
              <p className="text-sm text-gray-600">
                Scan this QR code at the event.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-sm text-sm hover:bg-blue-700 transition"
              >
                Close
              </motion.button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Name: {user?.name || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Email: {user?.email || "N/A"}
                </p>
                {user?.isACEMStudent && (
                  <p className="text-sm text-gray-600">
                    Roll No: {user?.rollNo || "N/A"}
                  </p>
                )}
              </div>
              {event.hasRegistrationFee &&
                event.eventType === "Inter-College" && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Registration fee: ₹
                      {user?.isACEMStudent ? event.acemFee : event.nonAcemFee}
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Card Number
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={paymentDetails.cardNumber}
                        onChange={handlePaymentChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Expiry
                        </label>
                        <input
                          type="text"
                          name="expiry"
                          value={paymentDetails.expiry}
                          onChange={handlePaymentChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm"
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={paymentDetails.cvv}
                          onChange={handlePaymentChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm"
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              <motion.button
                onClick={handleRegister}
                disabled={paymentProcessing}
                whileHover={{ scale: paymentProcessing ? 1 : 1.05 }}
                whileTap={{ scale: paymentProcessing ? 1 : 0.95 }}
                className={`w-full px-4 py-2 rounded-sm text-sm font-semibold transition-colors ${
                  paymentProcessing
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                aria-label={
                  paymentProcessing
                    ? "Processing registration"
                    : "Register for event"
                }
              >
                {paymentProcessing ? "Processing..." : "Register"}
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    );
  }
);

const ManageEvents = () => {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(null);
  const navigate = useNavigate();

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

      console.log("ManageEvents - User:", {
        _id: userData._id || "null",
        name: userData.name || "null",
        isAdmin: userData.isAdmin || false,
        headCoordinatorClubs: userData.headCoordinatorClubs || [],
        isACEMStudent: userData.isACEMStudent || false,
        rollNo: userData.rollNo || "N/A",
      });
      console.log("ManageEvents - All Clubs:", clubsResponse.data || []);

      let managedClubs = [];
      const isHeadCoordinator =
        (userData.headCoordinatorClubs || []).length > 0;
      if (userData.isAdmin) {
        managedClubs = clubsResponse.data || [];
      } else if (isHeadCoordinator) {
        managedClubs = (clubsResponse.data || []).filter((club) =>
          userData.headCoordinatorClubs.includes(club.name)
        );
      } else {
        managedClubs = (clubsResponse.data || []).filter(
          (club) =>
            club.creator?._id?.toString() === userData._id?.toString() ||
            club.superAdmins?.some(
              (admin) => admin?._id?.toString() === userData._id?.toString()
            )
        );
      }
      console.log("ManageEvents - Filtered clubs:", managedClubs);
      setClubs(managedClubs);

      let filteredEvents = eventsResponse.data || [];
      const managedClubIds = managedClubs
        .map((club) => club?._id?.toString())
        .filter(Boolean);
      filteredEvents = filteredEvents.filter((event) => {
        const clubId = event.club?._id?.toString() || event.club?.toString();
        return clubId && managedClubIds.includes(clubId);
      });

      const eventsWithClubNames = filteredEvents.map((event, index) => {
        const club = (clubsResponse.data || []).find((c) => {
          const cId = c?._id?.toString();
          const eId = event.club?._id?.toString() || event.club?.toString();
          return cId === eId;
        });
        return {
          ...event,
          _id: event._id || `event-${index}`,
          clubName: club?.name || "Unknown Club",
          banner: event.banner || null,
          category: event.category || "Event",
          eventType: event.eventType || "Intra-College",
          hasRegistrationFee: event.hasRegistrationFee || false,
          acemFee: event.acemFee || 0,
          nonAcemFee: event.nonAcemFee || 0,
        };
      });

      setEvents(eventsWithClubNames);
      console.log(
        "ManageEvents - Filtered Events with Club Names:",
        eventsWithClubNames
      );

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
    console.log("Attempting to delete event:", { eventId, eventTitle });
    if (
      !window.confirm(
        `Delete event "${eventTitle || "Untitled"}"? This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      if (!token) throw new Error("No authentication token found");
      await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
      setSuccess("Event deleted successfully.");
    } catch (err) {
      console.error("Delete error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        setError("Session expired or unauthorized. Please log in again.");
        navigate("/login");
      } else if (err.response?.status === 404) {
        setError("Event not found. It may have already been deleted.");
      } else {
        setError(
          err.response?.data?.error || err.message || "Failed to delete event."
        );
      }
    }
  };

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
          className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
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
            user?.isAdmin
              ? "admin"
              : user?.headCoordinatorClubs?.length > 0
              ? "headCoordinator"
              : "superAdmin"
          }
        />
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-2xl font-semibold text-blue-600"
              >
                Manage Events
              </motion.h2>
              <div className="flex gap-4 mt-4 sm:mt-0">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <select
                    value={eventFilter}
                    onChange={(e) => setEventFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm"
                    aria-label="Filter events by category"
                  >
                    <option value="">All Event Categories</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Competition">Competition</option>
                  </select>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/events/create")}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-sm transition"
                  aria-label="Create new event"
                >
                  <Plus className="w-4 h-4" />
                  Create Event
                </motion.button>
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
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition"
                  onClick={() => navigate("/events/create")}
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
                    user={user}
                    onRegister={() => setShowRegisterModal(event)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
        <AnimatePresence>
          {showRegisterModal && (
            <EventRegistrationModal
              event={showRegisterModal}
              user={user}
              onSuccess={setSuccess}
              onError={setError}
              onClose={() => setShowRegisterModal(null)}
            />
          )}
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
