import React, { memo, useState, useEffect } from "react";
import {
  FaUsers,
  FaTrophy,
  FaCalendarAlt,
  FaWhatsapp,
  FaBars,
  FaTimes,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaEnvelope,
  FaStar,
  FaMedal,
  FaChevronDown,
  FaCheckCircle,
  FaArrowRight,
  FaEye,
  FaCrown,
  FaGraduationCap,
  FaSpinner,
} from "react-icons/fa";
import { Users, Calendar, Award, ChevronRight } from "lucide-react"; // Added lucide-react icons
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useInView } from "framer-motion";
import axios from "axios";
import { Link } from "react-router-dom"; // Added Link for navigation

// API Base URL
const API_BASE_URL = "https://club-manager-chi.vercel.app/";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
};

// Floating Particles Component
const FloatingParticle = memo(({ delay, duration }) => {
  return (
    <motion.div
      className="absolute w-3 h-3 bg-gradient-to-r from-[#456882] to-[#5a7a95] rounded-full opacity-30"
      initial={{
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 20,
        opacity: 0,
        scale: 0.5,
      }}
      animate={{
        x: Math.random() * window.innerWidth,
        y: -20,
        opacity: [0, 0.7, 0],
        scale: [0.5, 1, 0.5],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
      }}
    />
  );
});

// Mobile Menu Component
const MobileMenu = memo(({ isOpen, onClose, onLoginClick, onSignupClick }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden border-r border-white/20 rounded-r-3xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-[#456882] transition-colors"
            >
              <FaTimes />
            </button>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="pt-16 px-6"
            >
              <motion.h2
                variants={itemVariants}
                className="text-2xl font-bold text-[#456882] mb-8"
              >
                ACEM Clubs
              </motion.h2>
              <div className="pt-8 space-y-3">
                <motion.button
                  variants={itemVariants}
                  onClick={onLoginClick}
                  className="w-full py-3 px-6 text-[#456882] border border-[#456882]/30 rounded-full hover:bg-[#456882] hover:text-white transition-all duration-300 font-medium backdrop-blur-sm"
                >
                  Login
                </motion.button>
                <motion.button
                  variants={itemVariants}
                  onClick={onSignupClick}
                  className="w-full py-3 px-6 bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white rounded-full hover:from-[#334d5e] hover:to-[#456882] transition-all duration-300 font-medium shadow-lg"
                >
                  Sign Up
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

// Statistics Counter Component
const StatCounter = memo(({ end, label, duration = 2, suffix = "+" }) => {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime;
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return (
    <motion.div ref={ref} variants={itemVariants} className="text-center">
      <div className="text-4xl font-bold text-white mb-2">
        {count}
        {suffix}
      </div>
      <div className="text-gray-200 font-medium">{label}</div>
    </motion.div>
  );
});

// Feature Card Component
const FeatureCard = memo(({ feature, index }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      whileHover={{
        scale: 1.03,
        boxShadow: "0 15px 30px rgba(69, 104, 130, 0.2)",
        y: -5,
      }}
      className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={`p-3 rounded-lg ${feature.color} text-white text-2xl w-fit mb-4`}
      >
        {feature.icon}
      </motion.div>
      <h3 className="text-lg font-semibold text-[#456882] mb-3">
        {feature.title}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  );
});

// Club Card Component
const ClubCard = memo(({ club, index }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
    >
      <div className="relative overflow-hidden h-48">
        <img
          src={club.banner}
          alt={`${club.name} banner`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <span className="bg-[#456882] text-white px-2 py-1 rounded-full text-xs font-medium">
            {club.category}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <img
              src={club.icon}
              alt={`${club.name} icon`}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-xl font-bold text-[#456882] group-hover:text-[#334d5e] transition-colors">
            {club.name}
          </h3>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {club.description}
        </p>
        <div className="grid grid-cols-3 gap-2 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{club.memberCount} members</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{club.eventsCount} events</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="w-4 h-4" />
            <span>Active</span>
          </div>
        </div>
        {club.activeEvents.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Active Events:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              {club.activeEvents.map((event, idx) => (
                <li key={idx}>
                  {event.title} - {new Date(event.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* <Link
          to={`/clubs/${club._id}`}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#456882] to-[#5a7a98] text-white rounded-lg hover:from-[#334d5e] hover:to-[#456882] transition-all duration-300 group-hover:shadow-md transform group-hover:scale-100"
        >
          <span className="font-medium">View Club</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link> */}
      </div>
    </motion.div>
  );
});

// Contact Form Component
const ContactForm = memo(() => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    club: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}api/landing/clubs`);
        setClubs(response.data.clubs);
      } catch (error) {
        console.error("Error fetching clubs for contact form:", error.message);
      }
    };
    fetchClubs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${API_BASE_URL}api/landing/contact`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      setFormData({ name: "", email: "", subject: "", message: "", club: "" });
    } catch (error) {
      console.error("Error submitting contact form:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <motion.input
          variants={itemVariants}
          type="text"
          placeholder="Your Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] focus:border-transparent"
          required
        />
        <motion.input
          variants={itemVariants}
          type="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] focus:border-transparent"
          required
        />
      </div>
      <motion.select
        variants={itemVariants}
        value={formData.club}
        onChange={(e) => setFormData({ ...formData, club: e.target.value })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] focus:border-transparent"
      >
        <option value="">Select a Club (Optional)</option>
        {clubs.map((club) => (
          <option key={club._id} value={club.name}>
            {club.name}
          </option>
        ))}
      </motion.select>
      <motion.input
        variants={itemVariants}
        type="text"
        placeholder="Subject"
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] focus:border-transparent"
      />
      <motion.textarea
        variants={itemVariants}
        placeholder="Your Message"
        rows="4"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] focus:border-transparent resize-none"
        required
      />
      <motion.button
        variants={itemVariants}
        type="submit"
        disabled={isSubmitting}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 10px 20px rgba(69, 104, 130, 0.2)",
        }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white rounded-lg hover:from-[#334d5e] hover:to-[#456882] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <FaSpinner className="animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <FaEnvelope className="text-sm" />
            Send Message
          </>
        )}
      </motion.button>
    </motion.form>
  );
});

// Main Landing Page Component
const LandingPage = () => {
  const { scrollY } = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    activeStudents: 0,
    activeClubs: 0,
    eventsOrganized: 0,
    satisfactionRate: 0,
  });
  const [clubsData, setClubsData] = useState({
    totalClubs: 0,
    clubs: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Scroll transforms
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const smoothY = useSpring(heroY, springConfig);

  // Particles array
  const particles = Array.from({ length: 15 }, (_, i) => ({
    delay: i * 1,
    duration: 12 + Math.random() * 8,
  }));

  // Fetch dynamic data
  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch statistics
        const statsResponse = await axios.get(`${API_BASE_URL}api/landing/stats`);
        setStats(statsResponse.data);

        // Fetch clubs and active events
        const clubsResponse = await axios.get(`${API_BASE_URL}api/landing/clubs`);
        setClubsData(clubsResponse.data);
      } catch (err) {
        console.error("Error fetching landing data:", err.message);
        setError(err.response?.data?.error || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  // Navigation handlers
  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleSignup = () => {
    window.location.href = "/signup";
  };

  const handleExploreFeatures = () => {
    document.getElementById("features").scrollIntoView({ behavior: "smooth" });
  };

  const handleWatchDemo = () => {
    console.log("Demo feature clicked");
  };

  const features = [
    {
      icon: <FaUsers />,
      title: "Role-Based Access",
      description:
        "Secure access control system with different permissions for students, coordinators, and faculty.",
      color: "bg-[#456882]",
    },
    {
      icon: <FaTrophy />,
      title: "Achievement System",
      description:
        "Hall of Fame with ranks, milestone achievements, and performance tracking for students.",
      color: "bg-yellow-500",
    },
    {
      icon: <FaCalendarAlt />,
      title: "Event Management",
      description:
        "Comprehensive event planning, gallery management, and activity tracking for each club.",
      color: "bg-red-500",
    },
    {
      icon: <FaWhatsapp />,
      title: "Integrated Communication",
      description:
        "WhatsApp integration and email notifications for seamless member communication.",
      color: "bg-green-500",
    },
    {
      icon: <FaEye />,
      title: "Real-time Tracking",
      description:
        "Monitor attendance, evaluation marks, and student progress in real-time.",
      color: "bg-blue-500",
    },
    {
      icon: <FaCheckCircle />,
      title: "Approval Workflow",
      description:
        "Streamlined approval process for club joining with trial management system.",
      color: "bg-purple-500",
    },
  ];

  const achievements = [
    {
      title: "Top Performer",
      icon: <FaTrophy />,
      color: "bg-yellow-500",
      description: "Awarded to students with the highest ranks in club activities.",
    },
    {
      title: "Milestone Master",
      icon: <FaMedal />,
      color: "bg-blue-500",
      description: "Recognizes students who achieve significant milestones.",
    },
    {
      title: "Perfect Attendance",
      icon: <FaStar />,
      color: "bg-purple-500",
      description: "For students with 100% attendance in club events.",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <FaSpinner className="animate-spin text-5xl text-[#456882] mb-4" />
          <p className="text-gray-600 text-lg">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md mx-auto text-center"
        >
          <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white rounded-xl hover:shadow-lg transition-all"
          >
            Retry
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans overflow-x-hidden">
      {/* Floating Particles */}
      {particles.map((particle, index) => (
        <FloatingParticle key={`particle-${index}`} {...particle} />
      ))}

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onLoginClick={handleLogin}
        onSignupClick={handleSignup}
      />

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="fixed top-6 left-1/2 transform -translate-x-1/2 z-30 w-[90%] max-w-4xl"
      >
        <div className="bg-blue-50/80 backdrop-blur-xl rounded-3xl border border-blue-100/50 shadow-lg px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 bg-gradient-to-br from-[#456882] to-[#5a7a95] rounded-full flex items-center justify-center"
              >
                <FaGraduationCap className="text-white text-xl" />
              </motion.div>
              <h1 className="text-xl font-bold text-[#456882]">ACEM Clubs</h1>
            </motion.div>
            <div className="hidden md:flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                className="px-5 py-2.5 text-[#456882] bg-white/50 backdrop-blur-sm border border-[#456882]/20 rounded-full hover:bg-white/70 transition-all duration-300 font-medium text-sm"
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 5px 15px rgba(69, 104, 130, 0.2)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSignup}
                className="px-5 py-2.5 bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white rounded-full hover:from-[#334d5e] hover:to-[#456882] transition-all duration-300 font-medium shadow-md text-sm"
              >
                Sign Up
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="md:hidden text-2xl text-[#456882] p-2 rounded-full bg-white/50 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <FaBars />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        id="home"
        style={{ y: smoothY, opacity: heroOpacity }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-32 relative overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-[#456882] to-[#5a7a95] opacity-5 rounded-full"
          />
          <motion.div
            animate={{
              scale: [1.3, 1, 1.3],
              rotate: [360, 180, 0],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-br from-[#456882] to-[#5a7a95] opacity-5 rounded-full"
          />
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 text-center relative z-10"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.95 }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-[#456882] to-[#5a7a95] rounded-2xl flex items-center justify-center text-white text-4xl shadow-2xl"
            >
              <FaCrown />
            </motion.div>
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6 text-[#456882] leading-tight"
          >
            Club Management
            <motion.span
              variants={itemVariants}
              className="block text-3xl md:text-5xl text-gray-600 font-normal"
            >
              for ACEM
            </motion.span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Empower your college community with role-based access, achievement
            tracking, and seamless communication.
          </motion.p>
          <motion.div
            variants={containerVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.button
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 15px 30px rgba(69, 104, 130, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExploreFeatures}
              className="px-8 py-4 bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white rounded-full font-semibold text-lg shadow-xl hover:from-[#334d5e] hover:to-[#456882] transition-all duration-300 flex items-center gap-3"
            >
              Explore Features
              <FaArrowRight className="text-sm" />
            </motion.button>
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWatchDemo}
              className="px-8 py-4 border-2 border-[#456882] text-[#456882] rounded-full font-semibold text-lg hover:bg-[#456882] hover:text-white transition-all duration-300"
            >
              Watch Demo
            </motion.button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-[#456882] text-2xl"
            >
              <FaChevronDown />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Statistics Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white"
      >
        <div className="container mx-auto px-4">
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <StatCounter
              end={stats.activeStudents}
              label="Active Students"
            />
            <StatCounter end={stats.activeClubs} label="Active Clubs" />
            <StatCounter
              end={stats.eventsOrganized}
              label="Events Organized"
            />
            <StatCounter
              end={stats.satisfactionRate}
              label="Satisfaction Rate"
              suffix="%"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Clubs and Active Events Section */}
      <motion.section
        id="clubs"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 bg-white"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#456882] mb-6">
              Our Clubs ({clubsData.totalClubs})
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our {clubsData.totalClubs} active clubs and their upcoming
              events.
            </p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {clubsData.clubs.map((club, index) => (
                <ClubCard key={club._id} club={club} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        id="features"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#456882] mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage clubs effectively, from member
              tracking to achievement systems.
            </p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Achievements Section */}
      <motion.section
        id="achievements"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 bg-white"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#456882] mb-6">
              Achievement System
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Celebrate success with our Hall of Fame, milestone achievements, and
              performance tracking.
            </p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8"
          >
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  y: -10,
                  boxShadow: "0 20px 40px rgba(69, 104, 130, 0.2)",
                }}
                className="relative p-6 bg-white rounded-xl shadow-lg border-2 border-transparent hover:border-[#456882]/20 transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`p-4 rounded-full ${achievement.color} text-white text-3xl mb-4 w-fit mx-auto`}
                >
                  {achievement.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-[#456882] mb-3 text-center">
                  {achievement.title}
                </h3>
                <p className="text-gray-600 text-sm text-center">
                  {achievement.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        id="contact"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#456882] mb-6">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about our club management system? We'd love to hear
              from you.
            </p>
          </motion.div>
          <div className="max-w-2xl mx-auto">
            <motion.div variants={itemVariants} className="bg-white p-8 rounded-xl shadow-lg">
              <ContactForm />
            </motion.div>
          </div>
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
                    onClick={handleLogin}
                    className="hover:text-white transition-colors text-left"
                  >
                    Login
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleSignup}
                    className="hover:text-white transition-colors text-left"
                  >
                    Sign Up
                  </button>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-200">
                <li className="flex items-center gap-2">
                  <FaEnvelope />
                  <a
                    href="mailto:support@acem.edu.in"
                    className="hover:text-white"
                  >
                    support@acem.edu.in
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <FaWhatsapp />
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
                  <FaFacebook />
                </motion.a>
                <motion.a
                  href="https://twitter.com"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  className="text-2xl hover:text-white transition-colors"
                >
                  <FaTwitter />
                </motion.a>
                <motion.a
                  href="https://instagram.com"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  className="text-2xl hover:text-white transition-colors"
                >
                  <FaInstagram />
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

export default LandingPage;
