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
  FaGraduationCap
} from "react-icons/fa";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useSpring,
  useInView
} from "framer-motion";

// Floating Particles Component (unchanged)
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

// Airplane Menu Component (unchanged)
const AirplaneMenu = ({ isOpen, onClose }) => {
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
            className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 overflow-hidden border-r-4 border-[#456882]"
          >
            <motion.div
              initial={{ x: -100, y: 20 }}
              animate={{ x: 250, y: 20 }}
              exit={{ x: -100, y: 20 }}
              transition={{
                duration: 1.2,
                ease: "easeInOut",
                delay: 0.2,
              }}
              className="absolute top-4 text-2xl text-[#456882]"
            >
              ✈️
            </motion.div>

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
                Navigation
              </motion.h2>

              <div className="space-y-4">
                {[
                  { href: "#home", label: "Home", delay: 0.4 },
                  { href: "#roles", label: "Roles", delay: 0.5 },
                  { href: "#clubs", label: "Clubs", delay: 0.6 },
                  { href: "#features", label: "Features", delay: 0.7 },
                  { href: "#achievements", label: "Achievements", delay: 0.8 }
                ].map((item) => (
                  <motion.a
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: item.delay }}
                    href={item.href}
                    className="block py-3 px-4 text-lg text-gray-700 hover:text-[#456882] hover:bg-blue-50 rounded-lg transition-all duration-300 transform hover:translate-x-2"
                    onClick={onClose}
                  >
                    {item.label}
                  </motion.a>
                ))}
              </div>

              <div className="pt-8 space-y-3">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="w-full py-3 px-6 text-[#456882] border-2 border-[#456882] rounded-full hover:bg-[#456882] hover:text-white transition-all duration-300 font-semibold"
                  onClick={onClose}
                >
                  Login
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="w-full py-3 px-6 bg-[#456882] text-white rounded-full hover:bg-[#5a7a95] transition-all duration-300 font-semibold shadow-lg"
                  onClick={onClose}
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

// Role Card Component (unchanged)
const RoleCard = memo(({ role, index }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.2,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.05, 
        y: -10,
        boxShadow: "0 20px 40px rgba(69, 104, 130, 0.15)"
      }}
      className={`relative p-8 bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-[#456882] transition-all duration-300 overflow-hidden group`}
    >
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#456882] to-transparent"></div>
      </div>

      <motion.div
        className="relative z-10"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`p-4 rounded-full ${role.bgColor} text-white text-4xl mb-6 w-fit mx-auto`}>
          {role.icon}
        </div>
        
        <h3 className="text-xl font-bold text-[#456882] mb-4 text-center">{role.title}</h3>
        
        <ul className="space-y-3 text-gray-600">
          {role.features.map((feature, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: (index * 0.2) + (idx * 0.1) + 0.3 }}
              className="flex items-center gap-3"
            >
              <FaCheckCircle className="text-[#456882] text-sm flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
});

// Feature Card Component (unchanged)
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
        scale: 1.02,
        boxShadow: "0 15px 30px rgba(69, 104, 130, 0.1)"
      }}
      className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={`p-3 rounded-lg ${feature.color} text-white text-2xl w-fit mb-4`}
      >
        {feature.icon}
      </motion.div>
      
      <h3 className="text-lg font-semibold text-[#456882] mb-3">{feature.title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
    </motion.div>
  );
});

// Statistics Counter Component (unchanged)
const StatCounter = ({ end, label, duration = 2 }) => {
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
      <div className="text-4xl font-bold text-white mb-2">{count}+</div>
      <div className="text-gray-200 font-medium">{label}</div>
    </motion.div>
  );
};

// New Testimonial Card Component
const TestimonialCard = memo(({ testimonial, index }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      whileHover={{ 
        scale: 1.03,
        boxShadow: "0 15px 30px rgba(69, 104, 130, 0.1)"
      }}
      className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
    >
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className="text-yellow-400 text-lg" />
        ))}
      </div>
      <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
      <div className="flex items-center">
        <div className="w-12 h-12 bg-[#456882] rounded-full flex items-center justify-center text-white text-xl font-bold">
          {testimonial.name[0]}
        </div>
        <div className="ml-4">
          <p className="font-semibold text-[#456882]">{testimonial.name}</p>
          <p className="text-sm text-gray-500">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
});

// Main Landing Page Component
const LandingPage = () => {
  const { scrollY } = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Scroll transforms
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  // Smooth spring animations
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const smoothY = useSpring(heroY, springConfig);

  // Particles array
  const particles = Array.from({ length: 15 }, (_, i) => ({
    delay: i * 0.8,
    duration: 12 + Math.random() * 8
  }));

  const roles = [
    {
      title: "Students",
      icon: <FaUserGraduate />,
      bgColor: "bg-blue-500",
      features: [
        "View and explore all available clubs",
        "Join clubs with approval process",
        "Access joined clubs' activities",
        "Track attendance and marks",
        "Personalized profile with badges",
        "Achievement milestones"
      ]
    },
    {
      title: "Coordinators",
      icon: <FaUserTie />,
      bgColor: "bg-green-500",
      features: [
        "Manage club activities and events",
        "Create and manage trial lists",
        "Approve or reject join requests",
        "Manage member lists",
        "Track student performance",
        "Send notifications to members"
      ]
    },
    {
      title: "Faculty In-Charge",
      icon: <FaChalkboardTeacher />,
      bgColor: "bg-purple-500",
      features: [
        "Full access to all club features",
        "Oversee all club activities",
        "Manage coordinator permissions",
        "Generate comprehensive reports",
        "System-wide administration",
        "Strategic planning and oversight"
      ]
    }
  ];

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

  const clubCategories = [
    {
      name: "Technical Clubs",
      icon: <FaCode />,
      color: "from-blue-400 to-blue-600",
      count: "12+ Clubs"
    },
    {
      name: "Cultural Clubs",
      icon: <FaMusic />,
      color: "from-purple-400 to-purple-600",
      count: "8+ Clubs"
    },
    {
      name: "Literary Societies",
      icon: <FaBook />,
      color: "from-green-400 to-green-600",
      count: "6+ Clubs"
    },
    {
      name: "Sports & Fitness",
      icon: <FaRunning />,
      color: "from-orange-400 to-orange-600",
      count: "15+ Clubs"
    },
    {
      name: "Social & Service",
      icon: <FaHandsHelping />,
      color: "from-teal-400 to-teal-600",
      count: "10+ Clubs"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Student, Technical Club",
      quote: "Joining clubs was so easy with the approval system, and I love tracking my achievements!"
    },
    {
      name: "Prof. Michael Lee",
      role: "Faculty In-Charge",
      quote: "The platform streamlines club management and provides comprehensive oversight effortlessly."
    },
    {
      name: "Alex Patel",
      role: "Club Coordinator",
      quote: "Managing events and communicating with members has never been this seamless!"
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans overflow-x-hidden">
      {/* Floating Particles */}
      {particles.map((particle, index) => (
        <FloatingParticle key={index} {...particle} />
      ))}

      {/* Airplane Menu */}
      <AirplaneMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Enhanced Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-lg z-30 border-b border-gray-200"
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 bg-[#456882] rounded-full flex items-center justify-center"
            >
              <FaGraduationCap className="text-white text-xl" />
            </motion.div>
            <h1 className="text-2xl font-bold text-[#456882]">ACEM Clubs</h1>
          </motion.div>

          <nav className="hidden md:flex items-center gap-8">
            {['Home', 'Roles', 'Clubs', 'Features', 'Achievements'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                whileHover={{ scale: 1.05, color: "#456882" }}
                className="font-medium text-gray-700 hover:text-[#456882] transition-colors relative"
              >
                {item}
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 bg-[#456882]"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 text-[#456882] border-2 border-[#456882] rounded-full hover:bg-[#456882] hover:text-white transition-all duration-300 font-medium"
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(69, 104, 130, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-[#456882] text-white rounded-full hover:bg-[#5a7a95] transition-all duration-300 font-medium shadow-lg"
            >
              Get Started
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden text-2xl text-[#456882]"
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
      </motion.header>

      {/* Hero Section */}
      <motion.section
        id="home"
        style={{ y: smoothY, opacity: heroOpacity, scale: heroScale }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20 relative overflow-hidden"
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
              whileHover={{ scale: 1.1, rotate: 10 }}
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
                scale: 1.05, 
                boxShadow: "0 15px 35px rgba(69, 104, 130, 0.4)",
                y: -2
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-[#456882] text-white rounded-full font-semibold text-lg shadow-xl hover:bg-[#5a7a95] transition-all duration-300 flex items-center gap-3"
            >
              Explore Features
              <FaArrowRight className="text-sm" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
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
            <StatCounter end={500} label="Active Students" />
            <StatCounter end={50} label="Active Clubs" />
            <StatCounter end={200} label="Events Organized" />
            <StatCounter end={95} label="Satisfaction Rate" />
          </div>
        </div>
      </section>

      {/* Role-Based Access Section */}
      <section id="roles" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#456882] mb-6">
              Roles & Permissions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our system provides secure, role-based access control tailored for different user types in your institution.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <RoleCard key={role.title} role={role} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Club Categories Section */}
      <section id="clubs" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
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

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {clubCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                }}
                className={`relative p-6 bg-gradient-to-br ${category.color} rounded-xl text-white text-center overflow-hidden group cursor-pointer`}
              >
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="text-4xl mb-4 relative z-10"
                >
                  {category.icon}
                </motion.div>
                
                <h3 className="text-lg font-semibold mb-2 relative z-10">
                  {category.name}
                </h3>
                
                <p className="text-sm opacity-90 relative z-10">
                  {category.count}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
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
      <section id="achievements" className="py-20 bg-gradient-to-br from-blue-50 to-gray-50">
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
                  scale: 1.05, 
                  y: -10,
                  boxShadow: "0 20px 40px rgba(69, 104, 130, 0.15)"
                }}
                className="relative p-6 bg-white rounded-xl shadow-lg border-2 border-transparent hover:border-[#456882] transition-all duration-300"
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
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-[#456882] text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Hear from students, coordinators, and faculty about their experience with ACEM Clubs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} index={index} />
            ))}
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
                {['Home', 'Roles', 'Clubs', 'Features', 'Achievements'].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
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
                  <a href="mailto:support@acemclubs.com" className="hover:text-white">
                    support@acemclubs.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <FaWhatsapp />
                  <a href="https://wa.me/1234567890" className="hover:text-white">
                    +1 234 567 890
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
                  whileHover={{ scale: 1.2, y: -5 }}
                  className="text-2xl hover:text-white transition-colors"
                >
                  <FaFacebook />
                </motion.a>
                <motion.a
                  href="https://twitter.com"
                  whileHover={{ scale: 1.2, y: -5 }}
                  className="text-2xl hover:text-white transition-colors"
                >
                  <FaTwitter />
                </motion.a>
                <motion.a
                  href="https://instagram.com"
                  whileHover={{ scale: 1.2, y: -5 }}
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