import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Mail,
  User,
  MessageSquare,
  Send,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Users,
  Headphones,
  ChevronDown,
} from "lucide-react";
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 sm:p-8 max-w-md mx-auto text-center">
            <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-sm sm:text-base text-red-600 mb-4">Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm sm:text-base"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Contact Info Card Component
const ContactInfoCard = memo(({ icon: Icon, title, info, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg"
  >
    <div className="flex items-start gap-3 sm:gap-4">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#456882] to-[#5a7a98] rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-[#456882] mb-1">{title}</h3>
        <p className="text-sm sm:text-base text-gray-900 font-medium mb-1">{info}</p>
        <p className="text-xs sm:text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </motion.div>
));

// Form Input Component
const FormInput = memo(({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
      <input
        {...props}
        className={`
          w-full pl-10 pr-4 py-2 sm:py-3 rounded-xl border transition-all duration-300 text-sm sm:text-base
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:border-[#456882] focus:ring-[#456882]/20'
          }
          focus:ring-4 focus:outline-none
        `}
      />
    </div>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs sm:text-sm text-red-600 flex items-center gap-1"
      >
        <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
        {error}
      </motion.p>
    )}
  </div>
));

// Form Textarea Component
const FormTextarea = memo(({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
      <textarea
        {...props}
        className={`
          w-full pl-10 pr-4 py-2 sm:py-3 rounded-xl border transition-all duration-300 resize-none text-sm sm:text-base
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:border-[#456882] focus:ring-[#456882]/20'
          }
          focus:ring-4 focus:outline-none
        `}
      />
    </div>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs sm:text-sm text-red-600 flex items-center gap-1"
      >
        <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
        {error}
      </motion.p>
    )}
  </div>
));

const ContactPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [contactInfo, setContactInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    clubId: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch user and clubs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to access the contact form");
          navigate("/login");
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch user
        const userResponse = await axios.get("http://localhost:5000/api/auth/user", config);
        setUser(userResponse.data);
        setFormData(prev => ({
          ...prev,
          name: userResponse.data.name || "",
          email: userResponse.data.email || "",
        }));

        // Fetch clubs
        const clubsResponse = await axios.get("http://localhost:5000/api/clubs", config);
        setClubs(clubsResponse.data);
        if (clubsResponse.data.length > 0) {
          setSelectedClub(clubsResponse.data[0]._id);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          setError("Session expired. Please log in again.");
          navigate("/login");
        } else {
          setError("Failed to load data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Fetch contact info for selected club
  useEffect(() => {
    const fetchContactInfo = async () => {
      if (!selectedClub) return;
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          `http://localhost:5000/api/clubs/${selectedClub}/contacts`,
          config
        );
        setContactInfo([
          {
            icon: User,
            title: "Super Admin",
            info: response.data.superAdmin ? `${response.data.superAdmin.name} (${response.data.superAdmin.email})` : "Satyam Pandey (satyam.pandey@acem.edu.in)",
            description: response.data.superAdmin ? "Primary contact for club management" : "Default contact for club management",
          },
          {
            icon: User,
            title: "Admin",
            info: response.data.admin ? `${response.data.admin.name} (${response.data.admin.email})` : "Satyam Pandey (satyam.pandey@acem.edu.in)",
            description: response.data.admin ? "Handles club operations" : "Default contact for club operations",
          },
          {
            icon: User,
            title: "Head Coordinator",
            info: response.data.headCoordinator ? `${response.data.headCoordinator.name} (${response.data.headCoordinator.email})` : "Satyam Pandey (satyam.pandey@acem.edu.in)",
            description: response.data.headCoordinator ? "Coordinates club activities" : "Default contact for club activities",
          },
          {
            icon: Phone,
            title: "Contact Number",
            info: response.data.phone || "8851020767",
            description: "Call us for immediate assistance",
          },
          {
            icon: MapPin,
            title: "Location",
            info: response.data.room || "CSE Dept.",
            description: "Visit us for in-person support",
          },
          {
            icon: Clock,
            title: "Support Hours",
            info: response.data.timing || "9 to 4",
            description: "Available for club-related queries",
          },
        ]);
      } catch (err) {
        console.error("Error fetching contact info:", err);
        setError("Failed to load contact information.");
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, [selectedClub]);

  const validateForm = () => {
    const newErrors = {};

    if (!selectedClub) {
      newErrors.clubId = "Please select a club";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleClubChange = (e) => {
    setSelectedClub(e.target.value);
    setFormData(prev => ({ ...prev, clubId: e.target.value }));
    if (errors.clubId) {
      setErrors(prev => ({ ...prev, clubId: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess("");

      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.post("http://localhost:5000/api/contact", formData, config);
      
      setSuccess("🎉 Message sent successfully! We'll get back to you soon.");
      setFormData(prev => ({
        ...prev,
        message: "",
        clubId: selectedClub,
      }));
      
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("Contact form error:", err);
      setError(
        err.response?.data?.msg || 
        err.response?.data?.message || 
        "Failed to send message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#456882]/30 border-t-[#456882] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        {/* Header */}
        <div className="bg-gradient-to-r from-[#456882] to-[#5a7a98] text-white py-10 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Headphones className="w-8 h-8 sm:w-10 sm:h-10" />
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Contact Support</h1>
              </div>
              <p className="text-base sm:text-lg text-blue-100 max-w-xl sm:max-w-2xl mx-auto">
                Select a club to contact the appropriate team members for assistance.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Club Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="relative max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Club
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <select
                  value={selectedClub}
                  onChange={handleClubChange}
                  className={`
                    w-full pl-10 pr-8 py-2 sm:py-3 rounded-xl border text-sm sm:text-base
                    ${errors.clubId 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-[#456882] focus:ring-[#456882]/20'
                    }
                    focus:ring-4 focus:outline-none appearance-none
                  `}
                  disabled={isSubmitting || loading}
                >
                  {clubs.map((club) => (
                    <option key={club._id} value={club._id}>
                      {club.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
              {errors.clubId && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs sm:text-sm text-red-600 flex items-center gap-1 mt-2"
                >
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                  {errors.clubId}
                </motion.p>
              )}
            </div>
          </motion.div>

          {selectedClub && (
            <>
              {/* Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6"
                  >
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                      <p className="text-xs sm:text-sm text-red-700 flex-1">{error}</p>
                      <button onClick={() => setError("")} className="text-red-600 hover:text-red-800">
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6"
                  >
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      <p className="text-xs sm:text-sm text-green-700 flex-1">{success}</p>
                      <button onClick={() => setSuccess("")} className="text-green-600 hover:text-green-800">
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Contact Information */}
                <div className="lg:col-span-1 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <h2 className="text-xl sm:text-2xl font-semibold text-[#456882] mb-4 sm:mb-6 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                      Get in Touch
                    </h2>
                    <div className="space-y-4">
                      {contactInfo.map((info, index) => (
                        <ContactInfoCard key={index} {...info} />
                      ))}
                    </div>
                  </motion.div>

                  {/* Quick Tips */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-[#456882] mb-3 sm:mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                      Quick Tips
                    </h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                        Include your club name for faster support
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                        Describe the issue in detail
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                        Check our FAQ before contacting
                      </li>
                    </ul>
                  </motion.div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8"
                  >
                    <div className="mb-6 sm:mb-8">
                      <h2 className="text-xl sm:text-2xl font-semibold text-[#456882] mb-2">Send us a Message</h2>
                      <p className="text-sm sm:text-base text-gray-600">
                        Fill out the form below and we'll get back to you as soon as possible.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <FormInput
                          label="Full Name"
                          icon={User}
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          error={errors.name}
                          placeholder="Enter your full name"
                          disabled={isSubmitting}
                        />
                        
                        <FormInput
                          label="Email Address"
                          icon={Mail}
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          error={errors.email}
                          placeholder="Enter your email address"
                          disabled={isSubmitting}
                        />
                      </div>

                      <FormTextarea
                        label="Message"
                        icon={MessageSquare}
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        error={errors.message}
                        placeholder="Describe your question or issue in detail..."
                        rows="5 sm:rows-6"
                        disabled={isSubmitting}
                      />

                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                        className={`
                          w-full py-3 sm:py-4 px-6 rounded-xl font-semibold text-sm sm:text-lg transition-all duration-300
                          ${isSubmitting 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-[#456882] to-[#5a7a98] hover:from-[#334d5e] hover:to-[#456882] shadow-lg hover:shadow-xl'
                          }
                          text-white
                        `}
                      >
                        <div className="flex items-center justify-center gap-2 sm:gap-3">
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Sending Message...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                              Send Message
                            </>
                          )}
                        </div>
                      </motion.button>
                    </form>

                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-500 text-center">
                        By submitting this form, you agree to our terms of service and privacy policy.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ContactPage;