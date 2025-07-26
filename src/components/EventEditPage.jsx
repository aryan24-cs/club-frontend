import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaSpinner, FaSave } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const EventEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState({ title: '', date: '', description: '', clubId: '' });
  const [clubs, setClubs] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [userResponse, eventResponse, clubsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/user', config),
          axios.get(`http://localhost:5000/api/events/${id}`, config),
          axios.get('http://localhost:5000/api/clubs', config),
        ]);

        setUser(userResponse.data);
        setEvent(eventResponse.data);
        const filteredClubs = clubsResponse.data.filter((club) =>
          userResponse.data.headCoordinatorClubs?.includes(club.name)
        );
        setClubs(filteredClubs);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.error || 'Failed to load event data.');
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/events/${id}`, event, config);
      setError('Event updated successfully!');
      setTimeout(() => navigate('/admin/events'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update event.');
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
      <Navbar user={user} role="admin" />
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-12 bg-gradient-to-br from-teal-50 to-gray-50"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-teal-600" style={{ color: '#456882' }}>
            Edit Event
          </h2>
          <motion.form
            onSubmit={handleSubmit}
            className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="event-title">
                Event Title
              </label>
              <input
                id="event-title"
                type="text"
                value={event.title}
                onChange={(e) => setEvent({ ...event, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                style={{ borderColor: '#456882' }}
                required
                aria-label="Event Title"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="event-date">
                Date
              </label>
              <input
                id="event-date"
                type="date"
                value={event.date}
                onChange={(e) => setEvent({ ...event, date: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                style={{ borderColor: '#456882' }}
                required
                aria-label="Event Date"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="event-description">
                Description
              </label>
              <textarea
                id="event-description"
                value={event.description}
                onChange={(e) => setEvent({ ...event, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                style={{ borderColor: '#456882' }}
                rows="4"
                required
                aria-label="Event Description"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="event-club">
                Club
              </label>
              <select
                id="event-club"
                value={event.clubId}
                onChange={(e) => setEvent({ ...event, clubId: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                style={{ borderColor: '#456882' }}
                required
                aria-label="Select Club"
              >
                <option value="">Select a Club</option>
                {clubs.map((club) => (
                  <option key={club._id} value={club._id}>
                    {club.name}
                  </option>
                ))}
              </select>
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
              aria-label="Save Event"
            >
              {isSubmitting ? (
                <FaSpinner className="animate-spin inline-block mr-2" />
              ) : (
                <FaSave className="inline-block mr-2" />
              )}
              Save Event
            </motion.button>
          </motion.form>
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

export default EventEditPage;
