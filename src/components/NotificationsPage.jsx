import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Loader2, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const NotificationCard = ({ notification, onMarkAsRead }) => {
  const [isMarking, setIsMarking] = useState(false);

  const handleMarkAsRead = async () => {
    setIsMarking(true);
    try {
      await onMarkAsRead(notification._id);
    } finally {
      setIsMarking(false);
    }
  };

  const typeStyles = {
    membership: "bg-blue-100 text-blue-800",
    event: "bg-green-100 text-green-800",
    activity: "bg-yellow-100 text-yellow-800",
    general: "bg-gray-100 text-gray-800",
    attendance: "bg-purple-100 text-purple-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 bg-white rounded-lg shadow-md border border-gray-200 mb-4 flex justify-between items-start"
    >
      <div className="flex items-start gap-3">
        <Bell className="text-[#456882] w-5 h-5 mt-1" />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-gray-800 font-semibold">
              {notification.title}
            </h3>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                typeStyles[notification.type]
              }`}
            >
              {notification.type.charAt(0).toUpperCase() +
                notification.type.slice(1)}
            </span>
          </div>
          <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
          <p className="text-gray-500 text-xs mt-1">
            {new Date(notification.createdAt).toLocaleString("en-US", {
              timeZone: "Asia/Kolkata",
            })}
          </p>
        </div>
      </div>
      {!notification.read && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMarkAsRead}
          disabled={isMarking}
          className={`flex items-center gap-1 text-sm px-3 py-1 rounded-md ${
            isMarking
              ? "bg-gray-300"
              : "bg-[#456882] text-white hover:bg-[#334d5e]"
          }`}
          aria-label={`Mark notification ${notification.title} as read`}
        >
          {isMarking ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          <span>{isMarking ? "Marking..." : "Mark as Read"}</span>
        </motion.button>
      )}
    </motion.div>
  );
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(
        "http://localhost:5000/api/notifications",
        config
      );
      const newNotifications = response.data;

      const newUnreadCount = newNotifications.filter((n) => !n.read).length;
      if (newUnreadCount > unreadCount && unreadCount !== 0) {
        setToast(
          `You have ${newUnreadCount - unreadCount} new notification(s)`
        );
        setTimeout(() => setToast(null), 5000);
      }
      setNotifications(newNotifications);
      setUnreadCount(newUnreadCount);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.response?.data?.error || "Failed to load notifications.");
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [navigate, unreadCount]);

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
        setUnreadCount(
          notificationsResponse.data.filter((n) => !n.read).length
        );
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

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [navigate, fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        config
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Error marking notification as read:", err);
      const errorMessage =
        err.response?.status === 404
          ? "Notification not found."
          : err.response?.status === 403
          ? "You are not authorized to mark this notification as read."
          : err.response?.data?.error || "Failed to mark notification as read.";
      setError(errorMessage);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch(
        "http://localhost:5000/api/notifications/mark-all-read",
        {},
        config
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError(
        err.response?.data?.error || "Failed to mark all notifications as read."
      );
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      }
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
          <Loader2 className="w-8 h-8 text-[#456882] animate-spin" />
        </motion.div>
      )}
      <Navbar
        user={user}
        role={
          user?.isAdmin
            ? "superadmin"
            : user?.headCoordinatorClubs?.length > 0
            ? "admin"
            : "user"
        }
        unreadCount={unreadCount}
      />
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-12 bg-gradient-to-br from-teal-50 to-gray-50"
      >
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-[#456882]">Notifications</h2>
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMarkAllAsRead}
                className="bg-[#456882] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#334d5e]"
                aria-label="Mark all notifications as read"
              >
                Mark All as Read
              </motion.button>
            )}
          </div>
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-gray-700 text-lg">No notifications found.</p>
            </motion.div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          )}
        </div>
      </motion.section>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-4 right-4 bg-[#456882] text-white rounded-lg p-4 shadow-lg max-w-sm"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-sm">{error}</p>
            <div className="flex gap-2 mt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-white underline text-sm"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                Dismiss
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-white underline text-sm"
                onClick={fetchNotifications}
                aria-label="Retry fetching notifications"
              >
                Retry
              </motion.button>
            </div>
          </motion.div>
        )}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 bg-[#456882] text-white rounded-lg p-4 shadow-lg max-w-sm"
            role="alert"
            aria-live="polite"
          >
            <p className="text-sm">{toast}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-white underline text-sm mt-2"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification toast"
            >
              Dismiss
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsPage;
