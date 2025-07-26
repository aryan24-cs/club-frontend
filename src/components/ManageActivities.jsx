import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCalendarAlt, FaPlus, FaSpinner } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
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
        <div className="text-center p-8 text-teal-600">
          <h2 className="text-2xl font-bold">Something went wrong.</h2>
          <p>Please try refreshing the page or contact support.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-full"
            style={{ backgroundColor: "#456882" }}
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

// Memoized ActivityCard Component
const ActivityCard = ({ activity }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ type: "spring", stiffness: 100, damping: 15 }}
    whileHover={{ scale: 1.03, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
    className="p-6 bg-white rounded-xl shadow-md border border-gray-200"
  >
    <div className="flex items-center gap-3 mb-3">
      <FaCalendarAlt
        className="text-teal-600 text-xl"
        style={{ color: "#456882" }}
      />
      <h4 className="text-lg font-semibold text-gray-900">{activity.title}</h4>
    </div>
    <p className="text-gray-600 text-sm mb-2">{activity.date}</p>
    <p className="text-gray-700 mb-3">{activity.description}</p>
    <p className="text-gray-500 text-sm">Club: {activity.clubName}</p>
    <Link
      to={`/activities/${activity._id}/edit`}
      className="mt-2 inline-block text-teal-600 hover:text-teal-700 font-medium transition"
      style={{ color: "#456882" }}
      aria-label={`Edit ${activity.title}`}
    >
      Edit Activity
    </Link>
  </motion.div>
);

const ManageActivities = () => {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [newActivity, setNewActivity] = useState({
    title: "",
    date: "",
    description: "",
    clubId: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [userResponse, clubsResponse, activitiesResponse] =
          await Promise.all([
            axios.get("http://localhost:5000/api/auth/user", config),
            axios.get("http://localhost:5000/api/clubs", config),
            axios
              .get("http://localhost:5000/api/activities", config)
              .catch(() => ({ data: [] })),
          ]);

        setUser(userResponse.data);
        const filteredClubs = clubsResponse.data.filter((club) =>
          userResponse.data.headCoordinatorClubs?.includes(club.name)
        );
        setClubs(filteredClubs);
        setActivities(activitiesResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError(
            err.response?.data?.error ||
              "Failed to load data. Please try again."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    try {
      setActionLoading((prev) => ({ ...prev, createActivity: true }));
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        "http://localhost:5000/api/activities",
        newActivity,
        config
      );
      setActivities((prev) => [...prev, response.data]);
      setNewActivity({ title: "", date: "", description: "", clubId: "" });
      setError("Activity created successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create activity.");
    } finally {
      setActionLoading((prev) => ({ ...prev, createActivity: false }));
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-[Poppins]">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50"
          >
            <FaSpinner
              className="text-4xl text-teal-600 animate-spin"
              style={{ color: "#456882" }}
            />
          </motion.div>
        )}
        <Navbar user={user} role="admin" />
        <section className="py-12 bg-gradient-to-br from-teal-50 to-gray-50">
          <div className="container mx-auto px-2 sm:px-4">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-bold text-center mb-8 text-teal-600"
              style={{ color: "#456882" }}
            >
              Add New Activity
            </motion.h2>
            <motion.form
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-200"
              onSubmit={handleCreateActivity}
            >
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="activity-title"
                >
                  Activity Title
                </label>
                <input
                  id="activity-title"
                  type="text"
                  value={newActivity.title}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, title: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  style={{ borderColor: "#456882" }}
                  required
                  aria-label="Activity Title"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="activity-date"
                >
                  Date
                </label>
                <input
                  id="activity-date"
                  type="date"
                  value={newActivity.date}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, date: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  style={{ borderColor: "#456882" }}
                  required
                  aria-label="Activity Date"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="activity-description"
                >
                  Description
                </label>
                <textarea
                  id="activity-description"
                  value={newActivity.description}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  style={{ borderColor: "#456882" }}
                  rows="4"
                  required
                  aria-label="Activity Description"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="activity-club"
                >
                  Club
                </label>
                <select
                  id="activity-club"
                  value={newActivity.clubId}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, clubId: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  style={{ borderColor: "#456882" }}
                  required
                  aria-label="Select Club"
                >
                  <option value="">Select a Club</option>
                  {clubs.map((club) => (
                    <option key={club._id} value={club._id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>
              <motion.button
                type="submit"
                disabled={actionLoading.createActivity}
                whileHover={{ scale: actionLoading.createActivity ? 1 : 1.05 }}
                whileTap={{ scale: actionLoading.createActivity ? 1 : 0.95 }}
                className={`w-full px-6 py-3 rounded-full font-semibold transition ${
                  actionLoading.createActivity
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-teal-600 text-white hover:bg-teal-700"
                }`}
                style={{
                  backgroundColor: actionLoading.createActivity
                    ? "#d1d5db"
                    : "#456882",
                }}
                aria-label="Create Activity"
              >
                {actionLoading.createActivity ? (
                  <FaSpinner className="animate-spin inline-block mr-2" />
                ) : (
                  <FaPlus className="inline-block mr-2" />
                )}
                Create Activity
              </motion.button>
            </motion.form>
          </div>
        </section>
        <section className="py-12 bg-white">
          <div className="container mx-auto px-2 sm:px-4">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-bold text-center mb-8 text-teal-600"
              style={{ color: "#456882" }}
            >
              Manage Activities
            </motion.h2>
            {activities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <p className="text-gray-700 mb-4 text-lg">
                  No activities found.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-teal-600 text-white rounded-full transition-all"
                  style={{ backgroundColor: "#456882" }}
                  onClick={() =>
                    document.getElementById("activity-title").focus()
                  }
                  aria-label="Create New Activity"
                >
                  Create New Activity
                </motion.button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
                {activities.map((activity) => (
                  <ActivityCard key={activity._id} activity={activity} />
                ))}
              </div>
            )}
          </div>
        </section>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-4 right-4 bg-teal-600 text-white rounded-lg p-4 shadow-lg"
            style={{ backgroundColor: "#456882" }}
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

export default ManageActivities;
