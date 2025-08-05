import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import axios from "axios";
import { Search, Calendar, ChevronRight, X } from "lucide-react";
import Navbar from "../components/Navbar"; // Assuming you have a Navbar component

// API Base URL
const API_BASE_URL = "https://club-manager-3k6y.vercel.app/api";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  hover: { scale: 1.05, transition: { duration: 0.3 } },
};

// Modal Component for Error Handling
const Modal = ({ isOpen, onClose, message }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg font-medium text-red-600">{message}</p>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-lg text-white font-medium bg-red-600 hover:bg-red-700"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Image Card Component
const ImageCard = ({ image, eventName }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      variants={imageVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover="hover"
      className="relative group overflow-hidden rounded-lg shadow-md"
    >
      <img
        src={image.path}
        alt={`Photo from ${eventName}`}
        className="w-full h-64 object-cover transition-transform duration-300"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileHover={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4"
      >
        <p className="text-white text-sm font-medium">{image.description}</p>
      </motion.div>
    </motion.div>
  );
};

// Gallery Page Component
const GalleryPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch past events
  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/events/past`);
        setEvents(response.data.events);
        setFilteredEvents(response.data.events);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load gallery.");
        setModalOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPastEvents();
  }, []);

  // Filter events based on search term
  useEffect(() => {
    const filtered = events.filter((event) =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  // Handle modal close
  const closeModal = () => {
    setModalOpen(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar /> {/* Reusing Navbar from ClubsPage.jsx */}
      <Modal isOpen={modalOpen} onClose={closeModal} message={error} />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden bg-gradient-to-r from-[#456882] to-[#5a7a98] py-16"
      >
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
          >
            Event <span className="text-yellow-300">Gallery</span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-100 mb-8 max-w-2xl mx-auto"
          >
            Relive the moments from our past events at ACEM!
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="relative max-w-lg mx-auto"
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events"
              className="w-full p-3 pl-12 bg-white/90 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#456882] text-gray-700 placeholder-gray-500 shadow-sm"
              aria-label="Search events"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Gallery Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No events found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search term.
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-4 py-2 bg-[#456882] text-white rounded-lg hover:bg-[#334d5e] transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </motion.div>
          ) : (
            <div>
              {filteredEvents.map((event) => (
                <motion.div
                  key={event._id}
                  variants={itemVariants}
                  className="mb-12"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[#456882]">
                      {event.name} -{" "}
                      {new Date(event.date).toLocaleDateString()}
                    </h2>
                    <Link
                      to={`/events/${event._id}`}
                      className="flex items-center gap-2 text-[#456882] hover:text-[#334d5e] font-medium"
                    >
                      View Event <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <p className="text-gray-600 mb-6">{event.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {event.images.map((image, index) => (
                      <ImageCard
                        key={`${event._id}-${index}`}
                        image={image}
                        eventName={event.name}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* Footer Section */}
      <motion.footer
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white py-12"
      >
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-4 gap-8"
          >
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold mb-4">ACEM Clubs</h3>
              <p className="text-gray-200 text-sm">
                Empowering college communities with seamless club management and
                achievement tracking.
              </p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-200">
                <li>
                  <button
                    onClick={() => window.location.href = "/login"}
                    className="hover:text-white transition-colors text-left"
                  >
                    Login
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => window.location.href = "/signup"}
                    className="hover:text-white transition-colors text-left"
                  >
                    Sign Up
                  </button>
                </li>
                <li>
                  <a href="/#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/#contact" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-200">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 14H5c-.55 0-1-.45-1-1V7l6.29 4.71c.18.14.43.14.61 0L17 7v10c0 .55-.45 1-1 1zm-8.29-7.71L4 6h16l-6.71 4.29c-.18.14-.43.14-.61 0z" />
                  </svg>
                  <a href="mailto:support@acem.edu.in" className="hover:text-white">
                    support@acem.edu.in
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.9 2.1C16.7.9 14.2 0 12 0 5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12c0-2.2-.9-4.7-2.1-6.9l-1.4 1.4C21.5 8.1 22 10 22 12c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2c2 0 3.9.5 5.5 1.5l1.4-1.4zM12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1.7 10.3l-2 2c-.2.2-.5.2-.7 0l-2-2c-.2-.2-.2-.5 0-.7l2-2c.2-.2.5-.2.7 0l2 2c.2.2.2.5 0 .7z" />
                  </svg>
                  <a href="https://wa.me/8851020767" className="hover:text-white">
                    +91 8851020767
                  </a>
                </li>
              </ul>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <motion.a
                  href="https://facebook.com"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  className="text-2xl hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.7c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12z" />
                  </svg>
                </motion.a>
                <motion.a
                  href="https://twitter.com"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  className="text-2xl hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.5 5.6c-.8.3-1.6.6-2.5.7 1-.6 1.8-1.6 2.2-2.7-.9.5-2 .9-3.1 1.1-.9-1-2.2-1.6-3.6-1.6-2.7 0-4.9 2.2-4.9 4.9 0 .4 0 .8.1 1.2C7.7 9 4.1 7.2 1.8 4.3c-.4.7-.6 1.5-.6 2.4 0 1.7.9 3.2 2.2 4.1-.8 0-1.6-.2-2.2-.6v.1c0 2.4 1.7 4.4 3.9 4.8-.4.1-.8.2-1.3.2-.3 0-.6 0-.9-.1.6 1.9 2.4 3.3 4.5 3.3-1.6 1.3-3.6 2-5.8 2-.4 0-.8 0-1.2-.1 2.2 1.4 4.8 2.2 7.6 2.2 9.1 0 14-7.5 14-14v-.6c.9-.6 1.7-1.4 2.3-2.3-.8.4-1.7.6-2.6.7z" />
                  </svg>
                </motion.a>
                <motion.a
                  href="https://instagram.com"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  className="text-2xl hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.2-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.2-.1 1.6-.1 4.8-.1zm0-2.2C8.7 0 8.2 0 7 .1c-1.2.1-2 .3-2.7.5-.7.3-1.3.6-1.9 1.2-.6.6-1 1.2-1.2 1.9-.2.7-.4 1.5-.5 2.7C0 8.2 0 8.7 0 12s0 3.8.1 5c.1 1.2.3 2 .5 2.7.3.7.6 1.3 1.2 1.9.6.6 1.2 1 1.9 1.2.7.2 1.5.4 2.7.5 1.2.1 1.7.1 5 .1s3.8 0 5-.1c1.2-.1 2-.3 2.7-.5.7-.3 1.3-.6 1.9-1.2.6-.6 1-1.2 1.2-1.9.2-.7.4-1.5.5-2.7.1-1.2.1-1.7.1-5s0-3.8-.1-5c-.1-1.2-.3-2-.5-2.7-.3-.7-.6-1.3-1.2-1.9-.6-.6-1.2-1-1.9-1.2-.7-.2-1.5-.4-2.7-.5C15.8 0 15.3 0 12 0zm0 5.8c-3.4 0-6.2 2.8-6.2 6.2s2.8 6.2 6.2 6.2 6.2-2.8 6.2-6.2-2.8-6.2-6.2-6.2zm0 10.2c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm6.5-10.5c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5z" />
                  </svg>
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="mt-12 pt-8 border-t border-gray-400 text-center text-gray-200"
          >
            <p>&copy; {new Date().getFullYear()} ACEM Clubs. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
};

export default GalleryPage;
