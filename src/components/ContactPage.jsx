import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaSpinner } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          "http://localhost:5000/api/auth/user",
          config
        );
        setUser(response.data);
        setFormData((prev) => ({
          ...prev,
          name: response.data.name,
          email: response.data.email,
        }));
      } catch (err) {
        console.error("Error fetching user:", err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post("http://localhost:5000/api/contact", formData, config);
      setError("Message sent successfully!");
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        message: "",
      });
      setTimeout(() => setError(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[Poppins]">
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
            Contact Us
          </h2>
          <motion.form
            onSubmit={handleSubmit}
            className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-semibold mb-2"
                htmlFor="name"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                style={{ borderColor: "#456882" }}
                required
                aria-label="Name"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-semibold mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                style={{ borderColor: "#456882" }}
                required
                aria-label="Email"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-semibold mb-2"
                htmlFor="message"
              >
                Message
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                style={{ borderColor: "#456882" }}
                rows="6"
                required
                aria-label="Message"
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
                  : "bg-teal-600 text-white hover:bg-teal-700"
              }`}
              style={{ backgroundColor: isSubmitting ? "#d1d5db" : "#456882" }}
              aria-label="Send Message"
            >
              {isSubmitting ? (
                <FaSpinner className="animate-spin inline-block mr-2" />
              ) : (
                <FaEnvelope className="inline-block mr-2" />
              )}
              Send Message
            </motion.button>
          </motion.form>
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

export default ContactPage;
