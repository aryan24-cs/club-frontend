import React, { memo } from 'react';
import { FaCode, FaMusic, FaBook, FaRunning, FaHandsHelping, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

// Memoized ClubCard component to prevent unnecessary re-renders
const ClubCard = memo(({ category, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: 10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }} // Ensures animation only runs once
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, rotateY: 5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
      className={`relative flex flex-col items-center p-6 bg-gradient-to-br ${category.color} rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}
    >
      <div className="absolute inset-0 bg-white opacity-10 transform skew-y-6"></div>
      <motion.div
        className="p-4 rounded-full bg-white bg-opacity-20 text-white text-4xl mb-4 z-10"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        {category.icon}
      </motion.div>
      <h3 className="text-xl font-semibold text-gray-900 z-10">{category.name}</h3>
      <p className="text-sm text-gray-700 mt-2 text-center z-10">Join the {category.name.toLowerCase()} and unleash your passion!</p>
    </motion.div>
  );
});

const LandingPage = () => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0.7]);
  const scale = useTransform(scrollY, [0, 200], [1, 0.95]);

  const categories = [
    { name: 'Technical Clubs', icon: <FaCode />, color: 'from-red-200 to-red-400' },
    { name: 'Cultural Clubs', icon: <FaMusic />, color: 'from-red-100 to-red-300' },
    { name: 'Literary Societies', icon: <FaBook />, color: 'from-red-200 to-red-400' },
    { name: 'Sports & Fitness', icon: <FaRunning />, color: 'from-red-100 to-red-300' },
    { name: 'Social & Service', icon: <FaHandsHelping />, color: 'from-red-200 to-red-400' },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="fixed top-0 w-full bg-white shadow-md z-50"
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-red-600">ACEM</h1>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-red-600 border border-red-600 rounded-full hover:bg-red-50 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
            >
              Signup
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        style={{ opacity, scale }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white pt-20"
      >
        <div className="container mx-auto px-4 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-3/4"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-red-600">
              Unite. Explore. Celebrate.
            </h1>
            <p className="text-lg md:text-xl mb-6 text-gray-700">
              Discover and join exciting events hosted by ACEM college clubs.
            </p>
            <div className="flex justify-center gap-4">
              <motion.a
                href="#clubs"
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition"
              >
                Explore Clubs
              </motion.a>
              <motion.a
                href="#join"
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 border border-red-600 text-red-600 rounded-full font-semibold hover:bg-red-50 transition"
              >
                Join a Club
              </motion.a>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Club Categories Section */}
      <section id="clubs" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold text-center mb-12 text-red-600"
          >
            Explore Our Clubs
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {categories.map((category, index) => (
              <ClubCard key={category.name} category={category} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-red-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-red-200">Home</Link></li>
                <li><Link to="/about" className="hover:text-red-200">About</Link></li>
                <li><Link to="/clubs" className="hover:text-red-200">Clubs</Link></li>
                <li><Link to="/join" className="hover:text-red-200">Join a Club</Link></li>
                <li><Link to="/contact" className="hover:text-red-200">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="text-2xl hover:text-red-200"><FaFacebook /></a>
                <a href="#" className="text-2xl hover:text-red-200"><FaTwitter /></a>
                <a href="#" className="text-2xl hover:text-red-200"><FaInstagram /></a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Credits</h3>
              <p>Developed By SkillShastra</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;