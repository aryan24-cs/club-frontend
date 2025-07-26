import React, { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell, FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

// Airplane Menu Component
const AirplaneMenu = ({ isOpen, onClose, navLinks, user, handleLogout }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
            aria-label="Close menu overlay"
          />
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 overflow-hidden"
          >
            <motion.div
              initial={{ x: -100, y: 20 }}
              animate={{ x: 250, y: 20 }}
              exit={{ x: -100, y: 20 }}
              transition={{
                duration: 1,
                ease: 'easeInOut',
                delay: 0.2,
              }}
              className="absolute top-4 text-2xl text-teal-600"
              style={{ color: '#456882' }}
            >
              ✈️
            </motion.div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-teal-600 transition-colors"
              style={{ color: '#456882' }}
              aria-label="Close menu"
            >
              <FaTimes />
            </button>
            <div className="pt-16 px-6">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-teal-600 mb-8"
                style={{ color: '#456882' }}
              >
                {user?.name || 'User'}
              </motion.h2>
              <div className="space-y-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <Link
                      to={link.to}
                      className="block py-3 px-4 text-lg text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                      style={{ color: '#456882' }}
                      onClick={onClose}
                      aria-label={`Navigate to ${link.label}`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + navLinks.length * 0.1 }}
                  className="w-full py-3 px-4 text-lg text-left text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                  style={{ color: '#456882' }}
                  onClick={() => {
                    handleLogout();
                    onClose();
                  }}
                  aria-label="Logout"
                >
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Navbar = memo(({ user, role }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Define navigation links based on role
  const navLinks = {
    user: [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/profile", label: "Profile" },
      { to: "/clubs", label: "Clubs" },
      { to: "/events", label: "Events" },
      { to: "/contact", label: "Contact" },
    ],
    admin: [
      { to: "/admin-dashboard", label: "Admin Dashboard" },
      { to: "/profile", label: "Profile" },
      { to: "/clubs", label: "Clubs" },
      { to: "/manage-clubs", label: "Manage Clubs" },
      { to: "/events", label: "Events" },
      { to: "/contact", label: "Contact" },
    ],
    superadmin: [
      { to: "/super-admin-dashboard", label: "Super Admin Dashboard" },
      { to: "/profile", label: "Profile" },
      { to: "/clubs", label: "Clubs" },
      { to: "/create-club", label: "Create Club" },
      { to: "/manage-clubs", label: "Manage Clubs" },
      { to: "/events", label: "Events" },
      { to: "/contact", label: "Contact" },
    ],
  }[role] || [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/profile", label: "Profile" },
    { to: "/clubs", label: "Clubs" },
    { to: "/events", label: "Events" },
    { to: "/contact", label: "Contact" },
  ];

  // Define home route based on role
  const homeRoute = {
    user: "/dashboard",
    admin: "/admin-dashboard",
    superadmin: "/super-admin-dashboard",
  }[role] || "/dashboard";

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="fixed top-0 w-full bg-white shadow-md z-50"
      >
        <div className="container mx-auto px-2 sm:px-4 py-4 flex justify-between items-center">
          <Link
            to={homeRoute}
            className="text-3xl font-bold text-teal-600 cursor-pointer"
            style={{ color: '#456882' }}
            aria-label="ACEM Home"
          >
            ACEM
          </Link>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl text-teal-600"
              style={{ color: '#456882' }}
              onClick={() => navigate('/notifications')} // Navigate to notifications page
              aria-label="View Notifications"
            >
              <FaBell />
            </motion.button>
            <div className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-teal-600 font-semibold hover:text-teal-700 transition-all duration-300"
                  style={{ color: '#456882' }}
                  aria-label={`Navigate to ${link.label}`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="relative group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FaUserCircle className="text-2xl text-teal-600" style={{ color: '#456882' }} />
                  <span className="text-teal-600 font-semibold">{user?.name || 'User'}</span>
                </motion.div>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 bg-white shadow-2xl p-4 rounded-lg min-w-[200px]"
                  >
                    <p className="px-4 py-2 text-sm text-gray-600">{user?.email || 'user@acem.edu'}</p>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 rounded-md"
                      style={{ color: '#456882' }}
                      aria-label="Navigate to Profile"
                    >
                      Profile
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 rounded-md"
                      style={{ color: '#456882' }}
                      onClick={handleLogout}
                      aria-label="Logout"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="md:hidden text-2xl text-teal-600"
              style={{ color: '#456882' }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AirplaneMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        navLinks={navLinks}
        user={user}
        handleLogout={handleLogout}
      />
    </>
  );
});

export default Navbar;
