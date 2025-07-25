import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ClubDetailPage = () => {
  const { clubName } = useParams();
  const [club, setClub] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch club details
        const clubResponse = await axios.get(`http://localhost:5000/api/clubs?name=${clubName}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClub(clubResponse.data[0]);

        // Fetch activities for the club
        const activitiesResponse = await axios.get(`http://localhost:5000/api/activities?club=${clubName}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActivities(activitiesResponse.data);

        // Check membership status
        const userResponse = await axios.get('http://localhost:5000/api/auth/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsMember(userResponse.data.clubName.includes(clubName));
        setLoading(false);
      } catch (err) {
        setError('Failed to load club details.',err);
        setLoading(false);
      }
    };
    fetchClubData();
  }, [clubName]);

  const handleJoinClub = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        'http://localhost:5000/api/auth/user-details',
        {
          clubName: [clubName],
          isClubMember: true,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsMember(true);
    } catch (err) {
      setError('Failed to join club.',err);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-red-600 text-center py-12">{error}</div>;
  if (!club) return <div className="text-center py-12">Club not found.</div>;

  return (
    <div className="min-h-screen bg-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-64 bg-red-600"
      >
        <img src={club.icon} alt={club.name} className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-bold text-white"
          >
            {club.name}
          </motion.h1>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto py-12 px-4">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-semibold text-red-600 mb-4">About {club.name}</h2>
          <p className="text-gray-600">{club.description}</p>
          {isMember ? (
            <span className="inline-flex items-center mt-4 px-4 py-2 bg-green-600 text-white rounded-full">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              Member
            </span>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJoinClub}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-full"
            >
              Join Club
            </motion.button>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-semibold text-red-600 mb-4">Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((activity) => (
              <motion.div
                key={activity._id}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg shadow-lg p-4"
              >
                <h3 className="text-xl font-semibold text-red-600">{activity.title}</h3>
                <p className="text-gray-600">{activity.date}</p>
                <p className="text-gray-600">{activity.description.slice(0, 100)}...</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default ClubDetailPage;