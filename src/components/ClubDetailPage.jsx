import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ClubDetailPage = () => {
  const { clubName } = useParams();
  const [club, setClub] = useState(null);
  const [activities, setActivities] = useState([]);
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHeadCoordinator, setIsHeadCoordinator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch club details
        const clubResponse = await axios.get(`http://localhost:5000/api/clubs?name=${clubName}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClub(clubResponse.data[0]);

        // Fetch activities
        const activitiesResponse = await axios.get(`http://localhost:5000/api/activities?club=${clubName}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActivities(activitiesResponse.data);

        // Fetch members
        const membersResponse = await axios.get(`http://localhost:5000/api/clubs/${clubResponse.data[0]._id}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(membersResponse.data);

        // Check user roles and membership
        const userResponse = await axios.get('http://localhost:5000/api/auth/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsMember(userResponse.data.clubName.includes(clubName));
        setIsAdmin(userResponse.data.isAdmin);
        setIsHeadCoordinator(
          userResponse.data.isHeadCoordinator &&
          userResponse.data.headCoordinatorClubs.includes(clubName)
        );
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
      // Refresh members list
      const membersResponse = await axios.get(`http://localhost:5000/api/clubs/${club._id}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(membersResponse.data);
    } catch (err) {
      setError('Failed to join club.',err);
    }
  };

  const handleRemoveMember = async (email) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/clubs/${club._id}/members`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { email },
      });
      setMembers(members.filter((member) => member.email !== email));
    } catch (err) {
      setError('Failed to remove member.',err);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-600">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;
  if (!club) return <div className="text-center py-12 text-gray-600">Club not found.</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-64 sm:h-80 md:h-96 bg-red-600"
      >
        <img
          src={club.banner || club.icon}
          alt={`${club.name} banner`}
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center"
          >
            {club.name}
          </motion.h1>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={club.icon}
                alt={`${club.name} icon`}
                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-full"
              />
              <h2 className="text-2xl sm:text-3xl font-semibold text-red-600">
                About {club.name}
              </h2>
            </div>
            {(isAdmin || isHeadCoordinator) && (
              <Link
                to={`/clubs/${clubName}/edit`}
                className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-full text-sm sm:text-base hover:bg-blue-700 transition"
              >
                Edit Club
              </Link>
            )}
          </div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">{club.description}</p>
          {isMember ? (
            <span className="inline-flex items-center mt-4 px-4 py-2 bg-green-600 text-white rounded-full text-sm sm:text-base">
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
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-full text-sm sm:text-base"
              aria-label="Join Club"
            >
              Join Club
            </motion.button>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-red-600 mb-4">
            Members
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMembers(!showMembers)}
            className="mb-4 px-4 py-2 bg-red-600 text-white rounded-full text-sm sm:text-base"
            aria-label={showMembers ? 'Hide Members' : 'Show Members'}
          >
            {showMembers ? 'Hide Members' : 'Show Members'}
          </motion.button>
          <AnimatePresence>
            {showMembers && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
              >
                {members.length > 0 ? (
                  members.map((member) => (
                    <motion.div
                      key={member.email}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-gray-700 font-medium">{member.name}</p>
                        <p className="text-gray-500 text-sm">{member.email}</p>
                      </div>
                      {(isAdmin || isHeadCoordinator) && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRemoveMember(member.email)}
                          className="px-3 py-1 bg-red-600 text-white rounded-full text-sm hover:bg-red-700"
                          aria-label={`Remove ${member.name} from club`}
                        >
                          Remove
                        </motion.button>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm sm:text-base">No members yet.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-red-600 mb-4">
            Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {activities.map((activity) => (
              <motion.div
                key={activity._id}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-lg shadow-md p-4"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-red-600">{activity.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base">{activity.date}</p>
                <p className="text-gray-600 text-sm sm:text-base">{activity.description.slice(0, 100)}...</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default ClubDetailPage;