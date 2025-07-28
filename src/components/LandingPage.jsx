import React, { memo, useState } from "react";
import {
  FaCode,
  FaMusic,
  FaBook,
  FaRunning,
  FaHandsHelping,
  FaBars,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaUsers,
} from "react-icons/fa";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { useNavigate } from "react-router-dom";

// Floating Bubble Component (Fragrance-like animation)
const Bubble = ({ size, delay }) => {
  const randomXOffset = Math.random() * 100 - 50; // Random horizontal sway (-50 to 50px)

  return (
    <motion.div
      className="absolute rounded-full bg-mint opacity-50"
      style={{
        width: size,
        height: size,
        backgroundColor: "#CFFFE2",
        willChange: "transform, opacity",
      }}
      initial={{ x: `${randomXOffset}vw`, y: "100vh", opacity: 0.5 }}
      animate={{
        x: [
          `${randomXOffset}vw`,
          `${randomXOffset + (Math.random() * 20 - 10)}vw`,
        ], // Slight horizontal sway
        y: "-10vh", // Move to top
        opacity: [0.5, 0.7, 0], // Fade in, then out
      }}
      transition={{
        duration: 8 + Math.random() * 4, // Random duration (8-12s)
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeOut",
        delay: delay,
      }}
      whileHover={{ scale: 1.3, opacity: 0.8 }}
    />
  );
};

// Airplane Menu Component
const AirplaneMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Menu Container */}
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
            className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 overflow-hidden"
          >
            {/* Airplane Path Animation */}
            <motion.div
              initial={{ x: -100, y: 20 }}
              animate={{ x: 250, y: 20 }}
              exit={{ x: -100, y: 20 }}
              transition={{
                duration: 1,
                ease: "easeInOut",
                delay: 0.2,
              }}
              className="absolute top-4 text-2xl text-teal-600"
              style={{ color: "#456882" }}
            >
              ✈️
            </motion.div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-teal-600 transition-colors"
              style={{ color: "#456882" }}
            >
              <FaTimes />
            </button>

            {/* Menu Content */}
            <div className="pt-16 px-6">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-teal-600 mb-8"
                style={{ color: "#456882" }}
              >
                Navigation
              </motion.h2>

              <div className="space-y-4">
                <motion.a
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  href="#home"
                  className="block py-3 px-4 text-lg text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                  onClick={onClose}
                >
                  Home
                </motion.a>
                <motion.a
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  href="#clubs"
                  className="block py-3 px-4 text-lg text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                  onClick={onClose}
                >
                  Clubs
                </motion.a>
                <motion.a
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  href="#past-events"
                  className="block py-3 px-4 text-lg text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                  onClick={onClose}
                >
                  Events
                </motion.a>

                <div className="pt-6 space-y-3">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="w-full py-3 px-6 text-teal-600 border border-teal-600 rounded-full hover:bg-teal-50 transition-all font-semibold"
                    style={{ borderColor: "#456882", color: "#456882" }}
                    onClick={() => {
                      navigate("/login");
                      onClose();
                    }}
                    aria-label="Login"
                  >
                    Login
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="w-full py-3 px-6 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-all font-semibold"
                    style={{ backgroundColor: "#456882" }}
                    onClick={() => {
                      navigate("/signup");
                      onClose();
                    }}
                    aria-label="Sign Up"
                  >
                    Sign Up
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Memoized ClubCard component
const ClubCard = memo(({ category, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: index * 0.2,
      }}
      whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }}
      className={`relative flex flex-col items-center p-6 bg-gradient-to-br ${category.color} rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}
    >
      <div className="absolute inset-0 bg-white opacity-10 transform skew-y-6"></div>
      <motion.div
        className="p-4 rounded-full bg-white bg-opacity-20 text-white text-4xl mb-4 z-10"
        whileHover={{ scale: 1.1, y: -5 }}
        transition={{ duration: 0.3 }}
      >
        {category.icon}
      </motion.div>
      <h3 className="text-xl font-semibold text-gray-900 z-10">
        {category.name}
      </h3>
      <p className="text-sm text-gray-700 mt-2 text-center z-10">
        Join the {category.name.toLowerCase()} and unleash your passion!
      </p>
    </motion.div>
  );
});

const LandingPage = () => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0.7]);
  const scale = useTransform(scrollY, [0, 200], [1, 0.95]);
  const bgY = useTransform(scrollY, [0, 200], [0, -50]); // Parallax effect for background
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const categories = [
    {
      name: "Technical Clubs",
      icon: <FaCode />,
      color: "from-blue-200 to-blue-400",
    },
    {
      name: "Cultural Clubs",
      icon: <FaMusic />,
      color: "from-purple-200 to-purple-400",
    },
    {
      name: "Literary Societies",
      icon: <FaBook />,
      color: "from-green-200 to-green-400",
    },
    {
      name: "Sports & Fitness",
      icon: <FaRunning />,
      color: "from-yellow-200 to-yellow-400",
    },
    {
      name: "Social & Service",
      icon: <FaHandsHelping />,
      color: "from-teal-200 to-teal-400",
    },
  ];

  const eventImages = [
    {
      src: "https://media.istockphoto.com/id/517188688/photo/mountain-landscape.jpg?s=612x612&w=0&k=20&c=A63koPKaCyIwQWOTFBRWXj_PwCrR4cEoOw2S9Q7yVl8=",
      alt: "Technical Club Hackathon",
    },
    {
      src: "https://images.unsplash.com/photo-1517457373958-b4d6b2b1e6f8",
      alt: "Cultural Club Dance Performance",
    },
    {
      src: "https://images.unsplash.com/photo-1515169067868-5387ec356754",
      alt: "Literary Society Book Reading",
    },
    {
      src: "https://loveincorporated.blob.core.windows.net/contentimages/gallery/03211459-0607-4d07-8a6c-9966e3820a7d-Mount-Kirkjufell-Iceland.jpg",
      alt: "Sports Club Marathon",
    },
    {
      src: "https://content3.jdmagicbox.com/v2/comp/faridabad/c2/011pxx11.xx11.180720042429.n1c2/catalogue/aravali-college-of-engineering-and-management-jasana-faridabad-colleges-5hhqg5d110.jpg",
      alt: "Social Service Community Outreach",
    },
  ];

  // Generate 10 bubbles for a livelier effect
  const bubbles = Array.from({ length: 10 }, (_, i) => ({
    size: `${15 + Math.random() * 25}px`, // Random size between 15-40px
    delay: i * 0.5, // Staggered delays
  }));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-[Poppins]">
      {/* Airplane Menu */}
      <AirplaneMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="fixed top-0 w-full bg-white shadow-md z-30"
      >
        <div className="container mx-auto px-2 sm:px-4 py-4 flex justify-between items-center">
          <motion.h1
            whileHover={{ scale: 1.05 }}
            className="text-3xl font-bold text-teal-600 cursor-pointer"
            style={{ color: "#456882" }}
            onClick={() => navigate("/")}
          >
            ACEM
          </motion.h1>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden text-2xl text-teal-600 relative z-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ color: "#456882" }}
            aria-label="Toggle Menu"
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaBars />
            </motion.div>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
              }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 text-teal-600 border border-teal-600 rounded-full hover:bg-teal-50 transition-all duration-300 font-medium"
              style={{ borderColor: "#456882", color: "#456882" }}
              onClick={() => navigate("/login")}
              aria-label="Login"
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
              }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-all duration-300 font-medium"
              style={{ backgroundColor: "#456882" }}
              onClick={() => navigate("/signup")}
              aria-label="Sign Up"
            >
              Signup
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        style={{ opacity, scale }}
        className="min-h-[70vh] sm:min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-gray-50 pt-20 relative overflow-hidden"
      >
        {/* Background Image and Gradient Overlay */}
        <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
          <img
            src="https://images.unsplash.com/photo-1516321318429-4b6b5f3b7f9e"
            alt="Campus Event Background"
            className="w-full h-full object-cover opacity-20"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-600/30 to-transparent"></div>
        </motion.div>
        {/* Bubbles */}
        {bubbles.map((bubble, index) => (
          <Bubble key={index} size={bubble.size} delay={bubble.delay} />
        ))}
        <div className="container mx-auto px-2 sm:px-4 flex flex-col items-center text-center relative z-10">
          {/* Animated Illustration */}
          <motion.div
            className="mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <FaUsers
              className="text-6xl sm:text-8xl text-teal-600"
              style={{ color: "#456882" }}
            />
          </motion.div>
          {/* Animated Heading */}
          <div className="min-h-[120px] sm:min-h-[150px] flex items-center justify-center">
            <TypeAnimation
              sequence={[
                "Unite. Explore. Celebrate.",
                2000,
                "Join ACEM Clubs Today!",
                2000,
              ]}
              wrapper="h1"
              repeat={Infinity}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-teal-600 w-full"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                color: "#456882",
                whiteSpace: "normal",
                lineHeight: "1.2",
                overflow: "hidden",
              }}
            />
          </div>
          {/* Animated Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-base sm:text-lg md:text-xl mb-6 text-gray-800"
          >
            Connect with vibrant communities and make unforgettable memories.
          </motion.p>
          {/* Buttons */}
          <div className="flex justify-center gap-4">
            <motion.a
              href="#clubs"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{ backgroundColor: "#456882" }}
            >
              Explore Clubs
            </motion.a>
            <motion.a
              href="#join"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 border border-teal-600 text-teal-600 rounded-full font-semibold hover:bg-teal-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{ borderColor: "#456882", color: "#456882" }}
            >
              Join a Club
            </motion.a>
          </div>
        </div>
      </motion.section>

      {/* Club Categories Section */}
      <section id="clubs" className="py-16 bg-white">
        <div className="container mx-auto px-2 sm:px-4">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold text-center mb-12 text-teal-600"
            style={{ color: "#456882" }}
          >
            Explore Our Clubs
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
            {categories.map((category, index) => (
              <ClubCard key={category.name} category={category} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Past Events Gallery Section */}
      <section
        id="past-events"
        className="py-16 bg-gradient-to-br from-teal-50 to-gray-50"
      >
        <div className="container mx-auto px-2 sm:px-4">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold text-center mb-12 text-teal-600"
            style={{ color: "#456882" }}
          >
            Memorable Past Events
          </motion.h2>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {eventImages.map((image, index) => (
              <motion.div
                key={image.src}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="mb-6 break-inside-avoid"
              >
                <div className="relative bg-white rounded-lg shadow-md overflow-hidden group">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                    <p className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {image.alt}
                    </p>
                  </div>
                  {/* <div className="p-4">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-teal-600 transition-colors duration-300" style={{ color: '#456882' }}>
                      {image.alt}
                    </p>
                  </div> */}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gradient-to-r from-teal-600 to-teal-800 text-white">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="hover:text-teal-200 transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    className="hover:text-teal-200 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="/clubs"
                    className="hover:text-teal-200 transition-colors"
                  >
                    Clubs
                  </a>
                </li>
                <li>
                  <a
                    href="/join"
                    className="hover:text-teal-200 transition-colors"
                  >
                    Join a Club
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="hover:text-teal-200 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <motion.a
                  whileHover={{ scale: 1.2, y: -2 }}
                  href="https://facebook.com"
                  className="text-2xl hover:text-teal-200 transition-colors"
                >
                  <FaFacebook />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.2, y: -2 }}
                  href="https://twitter.com"
                  className="text-2xl hover:text-teal-200 transition-colors"
                >
                  <FaTwitter />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.2, y: -2 }}
                  href="https://instagram.com"
                  className="text-2xl hover:text-teal-200 transition-colors"
                >
                  <FaInstagram />
                </motion.a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white text-teal-600 rounded-full hover:bg-teal-100 transition-all font-semibold"
                  style={{ color: "#456882" }}
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>Developed By SkillShastra</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
