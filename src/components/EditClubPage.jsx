import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditClubPage = () => {
  const { clubName } = useParams();
  const [club, setClub] = useState(null);
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [headCoordinators, setHeadCoordinators] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  // Fetch club details
  useEffect(() => {
    const fetchClub = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/clubs?name=${clubName}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const clubData = response.data[0];
        setClub(clubData);
        setIcon(clubData.icon);
        setDescription(clubData.description);
        setCategory(clubData.category);
        setContactEmail(clubData.contactEmail || '');
        setHeadCoordinators(clubData.headCoordinators.join(', '));
        setLoading(false);
      } catch (err) {
        setError('Failed to load club details.',err);
        setLoading(false);
      }
    };
    fetchClub();
  }, [clubName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/clubs/${club._id}`,
        {
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
      navigate(`/clubs/${clubName}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update club.');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-red-600 text-center py-12">{error}</div>;
  if (!club) return <div className="text-center py-12">Club not found.</div>;

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
          Edit {club.name}
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
            <label className="block text-gray-700 font-medium">Club Name (Read-only)</label>
            <input
              type="text"
              value={club.name}
              disabled
              className="w-full px-4 py-2 border-b-2 border-gray-300 bg-gray-100"
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
            disabled={submitting}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update Club'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default EditClubPage;