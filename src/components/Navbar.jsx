import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

// Memoized Navbar component
const Navbar = memo(({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Animation variants for mobile menu
  const menuVariants = {
    closed: { x: '100%', opacity: 0 },
    open: { x: 0, opacity: 1 },
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/profile', label: 'Profile' },
    { to: '/clubs', label: 'Clubs' },
    { to: '/events', label: 'Events' },
    { to: '/contact', label: 'Contact' },
    { to: '/settings', label: 'Settings' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="fixed top-0 w-full bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg z-50"
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-bold tracking-tight">ACEM</Link>
        <div className="flex items-center gap-4">
          <FaBell className="text-white text-xl cursor-pointer hover:text-red-200 transition" />
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-white hover:text-red-200 font-medium transition duration-200"
              >
                {link.label}
              </Link>
            ))}
            <div className="relative group">
              <div className="flex items-center gap-2 cursor-pointer">
                <FaUserCircle className="text-2xl text-white" />
                <span className="text-white font-medium">{user?.name || 'User'}</span>
              </div>
              <div className="absolute right-0 hidden group-hover:block bg-white shadow-xl rounded-lg mt-2 p-3 min-w-[150px]">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
                  onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/login');
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          <button className="md:hidden text-white text-2xl" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-white shadow-xl absolute top-full left-0 w-full"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="flex flex-col p-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="py-3 text-gray-700 hover:text-red-600 font-medium border-b border-gray-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <button
                className="py-3 text-gray-700 hover:text-red-600 font-medium border-b border-gray-200 text-left"
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/login');
                  setIsMenuOpen(false);
                }}
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
});

export default Navbar;