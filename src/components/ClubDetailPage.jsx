import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ClubDetailPage = () => {
  const { clubName } = useParams();
  const [club, setClub] = useState(null);
  const [activities, setActivities] = useState([]);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHeadCoordinator, setIsHeadCoordinator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const token = localStorage.getItem('token');
        const clubResponse = await axios.get(`http://localhost:5000/api/clubs?name=${clubName}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClub(clubResponse.data[0]);

        const activitiesResponse = await axios.get(`http://localhost:5000/api/activities?club=${clubName}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActivities(activitiesResponse.data);

        const membersResponse = await axios.get(`http://localhost:5000/api/clubs/${clubResponse.data[0]._id}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(membersResponse.data);
        setFilteredMembers(membersResponse.data);

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
        setError('Failed to load club details.');
        setLoading(false);
      }
    };
    fetchClubData();
  }, [clubName]);

  useEffect(() => {
    setFilteredMembers(
      members.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, members]);

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
      const membersResponse = await axios.get(`http://localhost:5000/api/clubs/${club._id}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(membersResponse.data);
      setFilteredMembers(membersResponse.data);
    } catch (err) {
      setError('Failed to join club.');
    }
  };

  const handleRemoveMember = async (email) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/clubs/${club._id}/members`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { email },
      });
      const updatedMembers = members.filter((member) => member.email !== email);
      setMembers(updatedMembers);
      setFilteredMembers(updatedMembers);
    } catch (err) {
      setError('Failed to remove member.');
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (loading) return <div className="text-center py-12 text-gray-600 dark:text-gray-300">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;
  if (!club) return <div className="text-center py-12 text-gray-600 dark:text-gray-300">Club not found.</div>;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="flex justify-end p-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-64 sm:h-80 md:h-96 bg-[#456882]"
      >
        <img
          src={club.banner || club.icon}
          alt={`${club.name} banner`}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center drop-shadow-lg"
          >
            {club.name}
          </motion.h1>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
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
                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-full border-2 border-[#456882]"
              />
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#456882]">
                About {club.name}
              </h2>
            </div>
            {(isAdmin || isHeadCoordinator) && (
              <Link
                to={`/clubs/${clubName}/edit`}
                className="mt-4 sm:mt-0 px-4 py-2 bg-[#456882] text-white rounded-full text-sm sm:text-base hover:bg-[#3a546e] transition"
              >
                Edit Club
              </Link>
            )}
          </div>
          <p className={`mt-4 text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {club.description}
          </p>
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
              className="mt-4 px-4 py-2 bg-[#456882] text-white rounded-full text-sm sm:text-base hover:bg-[#3a546e]"
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#456882] mb-4 sm:mb-0">
              Members
            </h2>
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`px-4 py-2 rounded-full border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#456882]`}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMembers(!showMembers)}
            className="mb-4 px-4 py-2 bg-[#456882] text-white rounded-full text-sm sm:text-base hover:bg-[#3a546e]"
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
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <motion.div
                      key={member.email}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`rounded-lg shadow-md p-4 flex justify-between items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                    >
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{member.name}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{member.email}</p>
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
                  <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No members found.</p>
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
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#456882] mb-4">
            Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {activities.map((activity) => (
              <motion.div
                key={activity._id}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className={`rounded-lg shadow-md p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <h3 className="text-lg sm:text-xl font-semibold text-[#456882]">{activity.title}</h3>
                <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{activity.date}</p>
                <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{activity.description.slice(0, 100)}...</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default ClubDetailPage;