import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaSpinner, FaSave } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get('http://localhost:5000/api/auth/user', config);
        setUser(response.data);
        setProfile({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone || '',
        });
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err.response?.data?.error || 'Failed to load profile.');
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put('http://localhost:5000/api/auth/user', profile, config);
      setError('Profile updated successfully!');
      setUser((prev) => ({ ...prev, ...profile }));
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[Poppins]">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50"
        >
          <FaSpinner className="text-4xl text-teal-600 animate-spin" style={{ color: '#456882' }} />
        </motion.div>
      )}
      <Navbar user={user} role={user?.isAdmin ? 'superadmin' : user?.isHeadCoordinator ? 'admin' : 'user'} />
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-12 bg-gradient-to-br from-teal-50 to-gray-50"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-teal-600" style={{ color: '#456882' }}>
            Your Profile
          </h2>
          <motion.div
            className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-6">
              <FaUser className="text-6xl text-teal-600" style={{ color: '#456882' }} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  style={{ borderColor: '#456882' }}
                  required
                  aria-label="Name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  style={{ borderColor: '#456882' }}
                  required
                  aria-label="Email"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  style={{ borderColor: '#456882' }}
                  aria-label="Phone"
                />
              </div>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                className={`w-full px-6 py-3 rounded-full font-semibold transition ${
                  isSubmitting ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
                style={{ backgroundColor: isSubmitting ? '#d1d5db' : '#456882' }}
                aria-label="Save Profile"
              >
                {isSubmitting ? (
                  <FaSpinner className="animate-spin inline-block mr-2" />
                ) : (
                  <FaSave className="inline-block mr-2" />
                )}
                Save Profile
              </motion.button>
            </form>
          </motion.div>
        </div>
      </motion.section>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed bottom-4 right-4 bg-teal-600 text-white rounded-lg p-4 shadow-lg"
          style={{ backgroundColor: '#456882' }}
        >
          <p className="text-sm">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-2 text-white underline"
            onClick={() => setError('')}
            aria-label="Dismiss error"
          >
            Dismiss
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;
