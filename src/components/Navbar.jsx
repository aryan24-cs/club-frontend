import React, { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  Calendar,
  Settings,
  PlusCircle,
  User,
  Bell,
  Mail,
  LogOut,
  Menu,
  X,
  BookOpen,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// Airplane Menu Component
const AirplaneMenu = ({
  isOpen,
  onClose,
  navLinks,
  userLinks,
  user,
  handleLogout,
}) => {
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const toggleSubMenu = (label) => {
    setOpenSubMenu(openSubMenu === label ? null : label);
  };

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
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#456882] hover:text-[#334d5e]"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="pt-16 px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-4 mb-8"
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      console.error('Mobile menu profile picture load error:', user.profilePicture);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <h2 className="text-2xl font-bold text-[#456882] truncate">
                  {user?.name || "User"}
                </h2>
              </motion.div>
              <div className="space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    {link.subLinks ? (
                      <div>
                        <div className="flex items-center w-full">
                          <Link
                            to={link.to}
                            className={`flex items-center flex-1 text-[#456882] hover:bg-[#456882] hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-fit max-w-[160px] truncate ${
                              location.pathname === link.to
                                ? "bg-[#334d5e] text-white"
                                : ""
                            }`}
                            aria-label={`Navigate to ${link.label}`}
                          >
                            {link.icon}
                            <span className="ml-2">{link.label}</span>
                          </Link>
                          <button
                            className="p-2 text-[#456882] hover:bg-[#456882] hover:text-white rounded-md"
                            onClick={() => toggleSubMenu(link.label)}
                            aria-label={`Toggle ${link.label} submenu`}
                            aria-expanded={openSubMenu === link.label}
                          >
                            <ChevronDown
                              className={`w-5 h-5 transform ${
                                openSubMenu === link.label ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </div>
                        <AnimatePresence>
                          {openSubMenu === link.label && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-4 space-y-1"
                            >
                              {link.subLinks.map((subLink) => (
                                <Link
                                  key={subLink.to}
                                  to={subLink.to}
                                  className={`flex items-center text-[#456882] hover:bg-[#456882] hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-fit max-w-[180px] truncate ${
                                    location.pathname === subLink.to
                                      ? "bg-[#334d5e] text-white"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    onClose();
                                    navigate(subLink.to);
                                  }}
                                  aria-label={`Navigate to ${subLink.label}`}
                                >
                                  {subLink.icon}
                                  <span className="ml-2">{subLink.label}</span>
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`flex items-center text-[#456882] hover:bg-[#456882] hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-fit max-w-[200px] truncate ${
                          location.pathname === link.to
                            ? "bg-[#334d5e] text-white"
                            : ""
                        }`}
                        onClick={() => {
                          onClose();
                          navigate(link.to);
                        }}
                        aria-label={`Navigate to ${link.label}`}
                      >
                        {link.icon}
                        <span className="ml-2">{link.label}</span>
                      </Link>
                    )}
                  </motion.div>
                ))}
                {userLinks.map((link, index) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.4 + (navLinks.length + index) * 0.1,
                    }}
                  >
                    <Link
                      to={link.to}
                      className={`flex items-center text-[#456882] hover:bg-[#456882] hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-fit max-w-[200px] truncate ${
                        location.pathname === link.to
                          ? "bg-[#334d5e] text-white"
                          : ""
                        }`}
                      onClick={() => {
                        onClose();
                        navigate(link.to);
                      }}
                      aria-label={`Navigate to ${link.label}`}
                    >
                      {link.icon}
                      <span className="ml-2">{link.label}</span>
                    </Link>
                  </motion.div>
                ))}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.4 + (navLinks.length + userLinks.length) * 0.1,
                  }}
                  className="flex items-center text-[#456882] hover:bg-[#456882] hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full text-left min-w-fit max-w-[200px] truncate"
                  onClick={() => {
                    handleLogout();
                    onClose();
                  }}
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  <span className="ml-2">Logout</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Navbar = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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
        if (response.data.isAdmin) {
          setRole("superadmin");
        } else if (response.data.headCoordinatorClubs?.length > 0) {
          setRole("admin");
        } else {
          setRole("user");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setRole("user");
    navigate("/login");
  };

  const toggleSubMenu = (label) => {
    setOpenSubMenu(openSubMenu === label ? null : label);
  };

  // Common user links for the dropdown and mobile menu
  const userLinks = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <Home className="w-5 h-5 mr-2" />,
    },
    {
      to: "/profile",
      label: "Profile",
      icon: <User className="w-5 h-5 mr-2" />,
    },
    {
      to: "/notifications",
      label: "Notifications",
      icon: <Bell className="w-5 h-5 mr-2" />,
    },
    {
      to: "/contact",
      label: "Contact",
      icon: <Mail className="w-5 h-5 mr-2" />,
    },
  ];

  // Role-based navigation links with events and clubs grouped
  const navLinks = {
    user: [
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: <Home className="w-5 h-5 mr-2" />,
      },
      {
        to: "/clubs",
        label: "Clubs",
        icon: <Users className="w-5 h-5 mr-2" />,
        subLinks: [
          {
            to: "/clubs",
            label: "View Clubs",
            icon: <Users className="w-5 h-5 mr-2" />,
          },
        ],
      },
      {
        to: "/events",
        label: "Events",
        icon: <Calendar className="w-5 h-5 mr-2" />,
        subLinks: [
          {
            to: "/events",
            label: "View Events",
            icon: <Calendar className="w-5 h-5 mr-2" />,
          },
        ],
      },
    ],
    admin: [
      {
        to: "/admin-dashboard",
        label: "Admin Dashboard",
        icon: <Home className="w-5 h-5 mr-2" />,
      },
      {
        to: "/clubs",
        label: "Clubs",
        icon: <Users className="w-5 h-5 mr-2" />,
        subLinks: [
          {
            to: "/clubs",
            label: "View Clubs",
            icon: <Users className="w-5 h-5 mr-2" />,
          },
          {
            to: "/manage-clubs",
            label: "Manage Clubs",
            icon: <Settings className="w-5 h-5 mr-2" />,
          },
        ],
      },
      {
        to: "/admin/events",
        label: "Events",
        icon: <Calendar className="w-5 h-5 mr-2" />,
        subLinks: [
          {
            to: "/admin/events",
            label: "Manage Events",
            icon: <Calendar className="w-5 h-5 mr-2" />,
          },
          {
            to: "/attendance",
            label: "Attendance",
            icon: <BookOpen className="w-5 h-5 mr-2" />,
          },
        ],
      },
      {
        to: "/admin/users",
        label: "Users",
        icon: <Users className="w-5 h-5 mr-2" />,
      },
      {
        to: "/contact-manage",
        label: "Messages",
        icon: <MessageSquare className="w-5 h-5 mr-2" />,
      },
    ],
    superadmin: [
      {
        to: "/super-admin-dashboard",
        label: "Super Admin Dashboard",
        icon: <Home className="w-5 h-5 mr-2" />,
      },
      {
        to: "/clubs",
        label: "Clubs",
        icon: <Users className="w-5 h-5 mr-2" />,
        subLinks: [
          {
            to: "/clubs",
            label: "View Clubs",
            icon: <Users className="w-5 h-5 mr-2" />,
          },
          {
            to: "/create-club",
            label: "Create Club",
            icon: <PlusCircle className="w-5 h-5 mr-2" />,
          },
          {
            to: "/manage-clubs",
            label: "Manage Clubs",
            icon: <Settings className="w-5 h-5 mr-2" />,
          },
        ],
      },
      {
        to: "/admin/events",
        label: "Events",
        icon: <Calendar className="w-5 h-5 mr-2" />,
        subLinks: [
          {
            to: "/admin/events",
            label: "Manage Events",
            icon: <Calendar className="w-5 h-5 mr-2" />,
          },
          {
            to: "/attendance",
            label: "Attendance",
            icon: <BookOpen className="w-5 h-5 mr-2" />,
          },
        ],
      },
      {
        to: "/admin/users",
        label: "Users",
        icon: <Users className="w-5 h-5 mr-2" />,
      },
      {
        to: "/contact-manage",
        label: "Messages",
        icon: <MessageSquare className="w-5 h-5 mr-2" />,
      },
    ],
  }[role] || [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <Home className="w-5 h-5 mr-2" />,
    },
    {
      to: "/clubs",
      label: "Clubs",
      icon: <Users className="w-5 h-5 mr-2" />,
      subLinks: [
        {
          to: "/clubs",
          label: "View Clubs",
          icon: <Users className="w-5 h-5 mr-2" />,
        },
      ],
    },
    {
      to: "/events",
      label: "Events",
      icon: <Calendar className="w-5 h-5 mr-2" />,
      subLinks: [
        {
          to: "/events",
          label: "View Events",
          icon: <Calendar className="w-5 h-5 mr-2" />,
        },
      ],
    },
  ];

  // Define home route based on role
  const homeRoute =
    {
      user: "/dashboard",
      admin: "/admin-dashboard",
      superadmin: "/super-admin-dashboard",
    }[role] || "/dashboard";

  if (loading) {
    return (
      <div className="fixed top-0 w-full h-16 bg-white shadow-md z-50"></div>
    );
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="bg-white shadow-md sticky top-0 z-50"
      >
        <div className="max-w-7.5xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link
              to={homeRoute}
              className="text-2xl font-bold text-[#456882] truncate"
              aria-label="ACEM Home"
            >
              ACEM
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <div key={link.label} className="relative">
                  {link.subLinks ? (
                    <div
                      className="group"
                      onMouseEnter={() => toggleSubMenu(link.label)}
                      onMouseLeave={() => toggleSubMenu(null)}
                    >
                      <div className="flex items-center">
                        <Link
                          to={link.to}
                          className={`flex items-center flex-1 text-[#456882] hover:bg-[#456882] hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-fit max-w-[100px] truncate ${
                            location.pathname === link.to ||
                            link.subLinks.some(
                              (subLink) => subLink.to === location.pathname
                            )
                              ? "bg-[#334d5e] text-white"
                              : ""
                          }`}
                          aria-label={`Navigate to ${link.label}`}
                        >
                          {link.icon}
                          <span className="ml-2">{link.label}</span>
                        </Link>
                        <span
                          className="p-2 text-[#456882] hover:bg-[#456882] hover:text-white rounded-md cursor-pointer"
                          aria-label={`Toggle ${link.label} submenu`}
                          aria-expanded={openSubMenu === link.label}
                        >
                          <ChevronDown
                            className={`w-5 h-5 transform ${
                              openSubMenu === link.label ? "rotate-180" : ""
                            }`}
                          />
                        </span>
                      </div>
                      <AnimatePresence>
                        {openSubMenu === link.label && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full mt-1 bg-white shadow-lg rounded-md p-2 min-w-[200px] z-50"
                          >
                            {link.subLinks.map((subLink) => (
                              <Link
                                key={subLink.to}
                                to={subLink.to}
                                className={`flex items-center text-[#456882] hover:bg-[#456882] hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-fit max-w-[180px] truncate ${
                                  location.pathname === subLink.to
                                    ? "bg-[#334d5e] text-white"
                                    : ""
                                }`}
                                onClick={() => {
                                  setOpenSubMenu(null);
                                  navigate(subLink.to);
                                }}
                                aria-label={`Navigate to ${subLink.label}`}
                              >
                                {subLink.icon}
                                <span className="ml-2">{subLink.label}</span>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center text-[#456882] hover:bg-[#456882] hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-fit max-w-[120px] truncate ${
                        location.pathname === link.to
                          ? "bg-[#334d5e] text-white"
                          : ""
                      }`}
                      onClick={() => navigate(link.to)}
                      aria-label={`Navigate to ${link.label}`}
                    >
                      {link.icon}
                      <span className="ml-2">{link.label}</span>
                    </Link>
                  )}
                </div>
              ))}
              <div
                className="relative group"
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <div className="flex items-center text-[#456882] hover:bg-[#456882] hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-fit max-w-[150px] truncate cursor-pointer">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-6 h-6 rounded-full object-cover mr-2"
                      onError={(e) => {
                        console.error('Desktop profile picture load error:', user.profilePicture);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <span className="truncate">{user?.name || "User"}</span>
                </div>
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-md p-4 min-w-[200px] z-50"
                    >
                      <div className="flex items-center px-4 py-2 border-b border-gray-200">
                        {user?.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt="Profile"
                            className="w-8 h-8 rounded-full object-cover mr-2"
                            onError={(e) => {
                              console.error('Dropdown profile picture load error:', user.profilePicture);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2">
                            {user?.name?.charAt(0) || "U"}
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-800 font-medium truncate">
                            {user?.name || "User"}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {user?.email || "user@acem.edu"}
                          </p>
                        </div>
                      </div>
                      {userLinks.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          className={`flex items-center text-[#456882] hover:bg-[#456882] hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-fit max-w-[180px] truncate ${
                            location.pathname === link.to
                              ? "bg-[#334d5e] text-white"
                              : ""
                          }`}
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate(link.to);
                          }}
                          aria-label={`Navigate to ${link.label}`}
                        >
                          {link.icon}
                          <span className="ml-2">{link.label}</span>
                        </Link>
                      ))}
                      <button
                        className="flex items-center text-[#456882] hover:bg-[#456882] hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full text-left min-w-fit max-w-[180px] truncate"
                        onClick={handleLogout}
                        aria-label="Logout"
                      >
                        <LogOut className="w-5 h-5 mr-2" />
                        <span className="ml-2">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-[#456882] hover:text-[#334d5e]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      <AirplaneMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        navLinks={navLinks}
        userLinks={userLinks}
        user={user}
        handleLogout={handleLogout}
      />
    </>
  );
});

export default Navbar;