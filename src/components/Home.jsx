import React, { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaBell, FaCode, FaMusic, FaBook, FaRunning, FaHandsHelping, FaTrophy, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8 text-red-600">
          <h2 className="text-2xl font-bold">Something went wrong.</h2>
          <p>Please try refreshing the page or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Memoized ClubCard component
const ClubCard = memo(({ club }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.05 }}
    className="p-6 bg-gradient-to-br from-red-200 to-red-400 rounded-xl shadow-lg text-center"
  >
    <div className="p-4 rounded-full bg-white bg-opacity-20 text-white text-3xl mb-4">{club.icon}</div>
    <h3 className="text-lg font-semibold text-gray-900">{club.name}</h3>
    <Link to={`/club/${club.id}`} className="mt-2 inline-block text-red-600 hover:underline">View Events</Link>
  </motion.div>
));

// Memoized Badge component
const Badge = memo(({ badge }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.1 }}
    className="p-4 bg-white border-2 border-red-600 rounded-full text-center"
  >
    <FaTrophy className="text-red-600 text-2xl mb-2" />
    <p className="text-sm text-gray-900">{badge.name}</p>
  </motion.div>
));

const Home = () => {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [badges, setBadges] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data and joined clubs
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        // Replace with actual API calls
        setUser({ name: 'John Doe', role: 'Student' });
        setClubs([]); // Empty for testing no-clubs case
        setBadges([{ id: 1, name: 'Top Coder' }, { id: 2, name: 'Event Enthusiast' }]);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white text-gray-900 font-sans">
        {/* Navbar */}
        <Navbar user={user} />

        {/* Welcome Section */}
        <section className="pt-24 pb-12 bg-gradient-to-br from-red-50 to-white">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-bold text-red-600 text-center mb-4"
            >
              Welcome, {user?.name}!
            </motion.h2>
            <p className="text-center text-gray-700">You are a {user?.role}. Explore your profile and clubs below.</p>
          </div>
        </section>

        {/* Profile Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <motion.h3
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-2xl font-bold text-red-600 mb-8"
            >
              Your Profile
            </motion.h3>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-6 bg-white rounded-xl shadow-lg border border-red-200"
            >
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Achievements</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {badges.map((badge) => (
                  <Badge key={badge.id} badge={badge} />
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Joined Clubs */}
        <section className="py-12 bg-gradient-to-br from-red-50 to-white">
          <div className="container mx-auto px-4">
            <motion.h3
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-2xl font-bold text-red-600 mb-8"
            >
              Your Clubs
            </motion.h3>
            {clubs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <img
                  src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                  alt="No Clubs"
                  className="mx-auto mb-4 rounded-lg shadow-md"
                />
                <p className="text-gray-700 mb-4 text-lg">You are not in any club yet.</p>
                <Link
                  to="/clubs"
                  className="px-6 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition"
                >
                  Explore Clubs
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubs.map((club) => (
                  <ClubCard key={club.id} club={club} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-red-600 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link to="/dashboard" className="hover:text-red-200">Dashboard</Link></li>
                  <li><Link to="/profile" className="hover:text-red-200">Profile</Link></li>
                  <li><Link to="/clubs" className="hover:text-red-200">Clubs</Link></li>
                  <li><Link to="/events" className="hover:text-red-200">Events</Link></li>
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
    </ErrorBoundary>
  );
};

export default Home;