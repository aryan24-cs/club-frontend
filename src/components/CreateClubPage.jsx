import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateClubPage = () => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [headCoordinators, setHeadCoordinators] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Water ripple effect
  useEffect(() => {
    const createRipple = (e) => {
      const ripple = document.createElement('span');
      const diameter = 5;
      const radius = diameter / 2;
      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${e.clientX - radius}px`;
      ripple.style.top = `${e.clientY - radius}px`;
      ripple.style.position = 'fixed';
      ripple.style.borderRadius = '50%';
      ripple.style.backgroundColor = 'rgba(220, 20, 60, 0.3)';
      ripple.style.pointerEvents = 'none';
      ripple.style.zIndex = '9999';
      ripple.style.animation = 'ripple 0.6s ease-out';
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    };
    document.addEventListener('click', createRipple);
    return () => document.removeEventListener('click', createRipple);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/clubs',
        {
          name,
          icon,
          description,
          category,
          contactEmail,
          headCoordinators,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate('/clubs');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create club.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <style>
        {`
          @keyframes ripple {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(3); opacity: 0; }
          }
          [style*="animation: ripple"] {
            animation: ripple 0.6s ease-out;
          }
        `}
      </style>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl"
      >
        <h2 className="text-3xl font-bold text-red-600 text-center mb-8">
          Create a New Club
        </h2>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-600 text-sm text-center mb-4"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Club Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border-b-2 border-red-600 focus:outline-none focus:border-red-700"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Icon URL</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-4 py-2 border-b-2 border-red-600 focus:outline-none focus:border-red-700"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border-b-2 border-red-600 focus:outline-none focus:border-red-700"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border-b-2 border-red-600 focus:outline-none focus:border-red-700"
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="Technical">Technical</option>
              <option value="Cultural">Cultural</option>
              <option value="Literary">Literary</option>
              <option value="Entrepreneurial">Entrepreneurial</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Contact Email (Optional)</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-4 py-2 border-b-2 border-red-600 focus:outline-none focus:border-red-700"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">
              Head Coordinators (Comma-separated emails, Optional)
            </label>
            <input
              type="text"
              value={headCoordinators}
              onChange={(e) => setHeadCoordinators(e.target.value)}
              className="w-full px-4 py-2 border-b-2 border-red-600 focus:outline-none focus:border-red-700"
              placeholder="email1@example.com, email2@example.com"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Club'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateClubPage;