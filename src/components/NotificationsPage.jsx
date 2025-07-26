import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaBell, FaSpinner } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const NotificationCard = ({ notification }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="p-4 bg-white rounded-lg shadow-md border border-gray-200 mb-4"
  >
    <div className="flex items-center gap-3">
      <FaBell className="text-teal-600 text-xl" style={{ color: "#456882" }} />
      <div>
        <p className="text-gray-800 font-semibold">{notification.message}</p>
        <p className="text-gray-500 text-sm">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  </motion.div>
);

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

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
        const [userResponse, notificationsResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/user", config),
          axios.get("http://localhost:5000/api/notifications", config),
        ]);

        setUser(userResponse.data);
        setNotifications(notificationsResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.error || "Failed to load notifications.");
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

  return (
    <div className="min-h-screen bg-gray-50 font-[Poppins]">
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
      <Navbar
        user={user}
        role={
          user?.isAdmin
            ? "superadmin"
            : user?.isHeadCoordinator
            ? "admin"
            : "user"
        }
      />
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-12 bg-gradient-to-br from-teal-50 to-gray-50"
      >
        <div className="container mx-auto px-4">
          <h2
            className="text-3xl font-bold text-center mb-8 text-teal-600"
            style={{ color: "#456882" }}
          >
            Notifications
          </h2>
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-gray-700 text-lg">No notifications found.</p>
            </motion.div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                />
              ))}
            </div>
          )}
        </div>
      </motion.section>
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
  );
};

export default NotificationsPage;
