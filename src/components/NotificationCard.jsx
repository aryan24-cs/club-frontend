import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Loader2, CheckCircle2 } from "lucide-react";

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

export default NotificationCard;
