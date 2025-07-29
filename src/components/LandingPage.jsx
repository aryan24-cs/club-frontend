import React, { memo, useState, useEffect } from "react";
import {
  FaCode,
  FaMusic,
  FaBook,
  FaRunning,
  FaHandsHelping,
  FaBars,
  FaTimes,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaUsers,
  FaUserGraduate,
  FaUserTie,
  FaChalkboardTeacher,
  FaTrophy,
  FaCalendarAlt,
  FaWhatsapp,
  FaEnvelope,
  FaStar,
  FaMedal,
  FaChevronDown,
  FaCheckCircle,
  FaArrowRight,
  FaEye,
  FaCrown,
  FaGraduationCap,
  FaSpinner
} from "react-icons/fa";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useSpring,
  useInView
} from "framer-motion";

// API Base URL
const API_BASE_URL = "http://localhost:5000/api";

// Floating Particles Component
const FloatingParticle = ({ delay, duration }) => {
  return (
    <motion.div
      className="absolute w-2 h-2 bg-[#456882] rounded-full opacity-20"
      initial={{
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 20,
        opacity: 0
      }}
      animate={{
        x: Math.random() * window.innerWidth,
        y: -20,
        opacity: [0, 0.6, 0]
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "linear"
      }}
    />
  );
};

// Mobile Menu Component (Simplified)
const MobileMenu = ({ isOpen, onClose, onLoginClick, onSignupClick }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.5,
            }}
            className="fixed top-0 left-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden border-r border-white/20 rounded-r-3xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-[#456882] transition-colors z-10"
            >
              <FaTimes />
            </button>

            <div className="pt-16 px-6">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-[#456882] mb-8"
              >
                ACEM Clubs
              </motion.h2>

              <div className="pt-8 space-y-3">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full py-3 px-6 text-[#456882] border border-[#456882]/30 rounded-full hover:bg-[#456882] hover:text-white transition-all duration-300 font-medium backdrop-blur-sm"
                  onClick={onLoginClick}
                >
                  Login
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full py-3 px-6 bg-[#456882] text-white rounded-full hover:bg-[#5a7a95] transition-all duration-300 font-medium shadow-lg"
                  onClick={onSignupClick}
                >
                  Sign Up
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Statistics Counter Component
const StatCounter = ({ end, label, duration = 2, suffix = "+" }) => {
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
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      className="text-center"
    >
      <div className="text-4xl font-bold text-white mb-2">{count}{suffix}</div>
      <div className="text-gray-200 font-medium">{label}</div>
    </motion.div>
  );
};

// Feature Card Component
const FeatureCard = memo(({ feature, index }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15 }}
      whileHover={{ 
        scale: 1.01,
        boxShadow: "0 10px 20px rgba(69, 104, 130, 0.1)"
      }}
      className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`p-3 rounded-lg ${feature.color} text-white text-2xl w-fit mb-4`}
      >
        {feature.icon}
      </motion.div>
      
      <h3 className="text-lg font-semibold text-[#456882] mb-3">{feature.title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
    </motion.div>
  );
});

// Club Category Card Component
const ClubCategoryCard = memo(({ category, index }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.02,
        y: -5,
        boxShadow: "0 15px 25px rgba(0,0,0,0.1)"
      }}
      className={`relative p-6 bg-gradient-to-br ${category.color} rounded-xl text-white text-center overflow-hidden group cursor-pointer`}
    >
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="text-4xl mb-4 relative z-10"
      >
        {category.icon}
      </motion.div>
      
      <h3 className="text-lg font-semibold mb-2 relative z-10">
        {category.name}
      </h3>
      
      <p className="text-sm opacity-90 relative z-10">
        {category.count} Clubs
      </p>
    </motion.div>
  );
});

// Contact Form Component
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/landing/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setMessage(data.error || 'Failed to send message');
      }
    } catch (error) {
      setMessage('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Your Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] focus:border-transparent"
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] focus:border-transparent"
          required
        />
      </div>
      <input
        type="text"
        placeholder="Subject"
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] focus:border-transparent"
      />
      <textarea
        placeholder="Your Message"
        rows="4"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] focus:border-transparent resize-none"
        required
      ></textarea>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-[#456882] text-white rounded-lg hover:bg-[#5a7a95] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <FaSpinner className="animate-spin" />
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </button>
      
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}
        >
          {message}
        </motion.p>
      )}
    </form>
  );
};

// Main Landing Page Component
const LandingPage = () => {
  const { scrollY } = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    activeStudents: 0,
    activeClubs: 0,
    eventsOrganized: 0,
    satisfactionRate: 95
  });
  const [clubCategories, setClubCategories] = useState({
    Technical: 0,
    Cultural: 0,
    Literary: 0,
    Entrepreneurial: 0
  });
  const [loading, setLoading] = useState(true);

  // Scroll transforms with reduced effects
  const heroY = useTransform(scrollY, [0, 500], [0, -50]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.9]);

  // Smooth spring animations
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const smoothY = useSpring(heroY, springConfig);

  // Particles array
  const particles = Array.from({ length: 10 }, (_, i) => ({
    delay: i * 1.2,
    duration: 15 + Math.random() * 10
  }));

  // Fetch dynamic data
  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        // Fetch statistics
        const statsResponse = await fetch(`${API_BASE_URL}/landing/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        // Fetch club categories
        const categoriesResponse = await fetch(`${API_BASE_URL}/landing/club-categories`);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setClubCategories(categoriesData);
        }
      } catch (error) {
        console.error('Error fetching landing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  // Navigation handlers
  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleSignup = () => {
    window.location.href = '/signup';
  };

  const handleExploreFeatures = () => {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
  };

  const handleWatchDemo = () => {
    // You can implement demo functionality here
    alert('Demo feature coming soon!');
  };

  const features = [
    {
      icon: <FaUsers />,
      title: "Role-Based Access",
      description: "Secure access control system with different permissions for students, coordinators, and faculty.",
      color: "bg-[#456882]"
    },
    {
      icon: <FaTrophy />,
      title: "Achievement System",
      description: "Hall of Fame with ranks, milestone achievements, and performance tracking for students.",
      color: "bg-yellow-500"
    },
    {
      icon: <FaCalendarAlt />,
      title: "Event Management",
      description: "Comprehensive event planning, gallery management, and activity tracking for each club.",
      color: "bg-red-500"
    },
    {
      icon: <FaWhatsapp />,
      title: "Integrated Communication",
      description: "WhatsApp integration and email notifications for seamless member communication.",
      color: "bg-green-500"
    },
    {
      icon: <FaEye />,
      title: "Real-time Tracking",
      description: "Monitor attendance, evaluation marks, and student progress in real-time.",
      color: "bg-blue-500"
    },
    {
      icon: <FaCheckCircle />,
      title: "Approval Workflow",
      description: "Streamlined approval process for club joining with trial management system.",
      color: "bg-purple-500"
    }
  ];

  const clubCategoryData = [
    {
      name: "Technical",
      icon: <FaCode />,
      color: "from-blue-400 to-blue-600",
      count: clubCategories.Technical || 0
    },
    {
      name: "Cultural",
      icon: <FaMusic />,
      color: "from-purple-400 to-purple-600",
      count: clubCategories.Cultural || 0
    },
    {
      name: "Literary",
      icon: <FaBook />,
      color: "from-green-400 to-green-600",
      count: clubCategories.Literary || 0
    },
    {
      name: "Entrepreneurial",
      icon: <FaHandsHelping />,
      color: "from-orange-400 to-orange-600",
      count: clubCategories.Entrepreneurial || 0
    }
  ];

  const achievements = [
    {
      title: "Top Performer",
      icon: <FaTrophy />,
      color: "bg-yellow-500",
      description: "Awarded to students with the highest ranks in club activities."
    },
    {
      title: "Milestone Master",
      icon: <FaMedal />,
      color: "bg-blue-500",
      description: "Recognizes students who achieve significant milestones."
    },
    {
      title: "Perfect Attendance",
      icon: <FaStar />,
      color: "bg-purple-500",
      description: "For students with 100% attendance in club events."
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[#456882] mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans overflow-x-hidden">
      {/* Floating Particles */}
      {particles.map((particle, index) => (
        <FloatingParticle key={index} {...particle} />
      ))}

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onLoginClick={handleLogin}
        onSignupClick={handleSignup}
      />

      {/* Updated Header with Light Theme Colors */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="fixed top-6 left-1/2 transform -translate-x-1/2 z-30 w-[90%] max-w-4xl"
      >
        <div className="bg-blue-50/80 backdrop-blur-xl rounded-3xl border border-blue-100/50 shadow-lg px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 bg-[#456882] rounded-full flex items-center justify-center"
              >
                <FaGraduationCap className="text-white text-xl" />
              </motion.div>
              <h1 className="text-xl font-bold text-[#456882]">ACEM Clubs</h1>
            </motion.div>

            {/* Right Side Buttons */}
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
                whileHover={{ scale: 1.02, boxShadow: "0 5px 15px rgba(69, 104, 130, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSignup}
                className="px-5 py-2.5 bg-[#456882] text-white rounded-full hover:bg-[#5a7a95] transition-all duration-300 font-medium shadow-md text-sm"
              >
                Sign Up
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
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
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-20 right-20 w-32 h-32 bg-[#456882] opacity-5 rounded-full"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-20 left-20 w-24 h-24 bg-[#456882] opacity-5 rounded-full"
          />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring", stiffness: 100, delay: 0.2 }}
            className="mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-[#456882] to-[#5a7a95] rounded-2xl flex items-center justify-center text-white text-4xl shadow-2xl"
            >
              <FaCrown />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold mb-6 text-[#456882] leading-tight"
          >
            Club Management
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="block text-3xl md:text-5xl text-gray-600 font-normal"
            >
              Redefined
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Empower your college community with role-based access, achievement tracking, and seamless communication.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.button
              whileHover={{ 
                scale: 1.02, 
                boxShadow: "0 10px 25px rgba(69, 104, 130, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExploreFeatures}
              className="px-8 py-4 bg-[#456882] text-white rounded-full font-semibold text-lg shadow-xl hover:bg-[#5a7a95] transition-all duration-300 flex items-center gap-3"
            >
              Explore Features
              <FaArrowRight className="text-sm" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWatchDemo}
              className="px-8 py-4 border-2 border-[#456882] text-[#456882] rounded-full font-semibold text-lg hover:bg-[#456882] hover:text-white transition-all duration-300"
            >
              Watch Demo
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[#456882] text-2xl"
            >
              <FaChevronDown />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Statistics Section */}
      <section className="py-20 bg-[#456882] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter end={stats.activeStudents} label="Active Students" />
            <StatCounter end={stats.activeClubs} label="Active Clubs" />
            <StatCounter end={stats.eventsOrganized} label="Events Organized" />
            <StatCounter end={stats.satisfactionRate} label="Satisfaction Rate" suffix="%" />
          </div>
        </div>
      </section>

      {/* Club Categories Section */}
      <section id="clubs" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#456882] mb-6">
              Diverse Club Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From technical innovation to cultural expression, find your passion among our diverse range of clubs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clubCategoryData.map((category, index) => (
              <ClubCategoryCard key={category.name} category={category} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#456882] mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage clubs effectively, from member tracking to achievement systems.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#456882] mb-6">
              Achievement System
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Celebrate success with our Hall of Fame, milestone achievements, and performance tracking.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -5,
                  boxShadow: "0 15px 25px rgba(69, 104, 130, 0.1)"
                }}
                className="relative p-6 bg-white rounded-xl shadow-lg border-2 border-transparent hover:border-[#456882]/20 transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
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
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#456882] mb-6">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about our club management system? We'd love to hear from you.
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-[#456882] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl font-bold mb-4">ACEM Clubs</h3>
              <p className="text-gray-200 text-sm">
                Empowering college communities with seamless club management and achievement tracking.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
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
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-200">
                <li className="flex items-center gap-2">
                  <FaEnvelope />
                  <a href="mailto:support@acem.edu.in" className="hover:text-white">
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

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <motion.a
                  href="https://facebook.com"
                  whileHover={{ scale: 1.1 }}
                  className="text-2xl hover:text-white transition-colors"
                >
                  <FaFacebook />
                </motion.a>
                <motion.a
                  href="https://twitter.com"
                  whileHover={{ scale: 1.1 }}
                  className="text-2xl hover:text-white transition-colors"
                >
                  <FaTwitter />
                </motion.a>
                <motion.a
                  href="https://instagram.com"
                  whileHover={{ scale: 1.1 }}
                  className="text-2xl hover:text-white transition-colors"
                >
                  <FaInstagram />
                </motion.a>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 pt-8 border-t border-gray-400 text-center text-gray-200"
          >
            <p>&copy; {new Date().getFullYear()} ACEM Clubs. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;