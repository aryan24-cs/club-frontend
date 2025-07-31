import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaSpinner,
  FaSave,
  FaTrophy,
  FaUsers,
  FaCalendar,
  FaMedal,
  FaEdit,
  FaEye,
  FaStar,
  FaGraduationCap,
  FaShieldAlt,
  FaCrown,
  FaChartLine,
  FaWhatsapp,
  FaEnvelope
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    semester: '',
    course: '',
    specialization: '',
    rollNo: '',
    isACEMStudent: true
  });
  const [profileData, setProfileData] = useState({
    clubs: [],
    achievements: [],
    stats: {
      totalEvents: 0,
      attendanceRate: 0,
      eventsOrganized: 0,
      overallRank: 0,
      totalMembers: 0,
      seminarsAttended: 0,
      competitionsAttended: 0,
      workshopsAttended: 0
    }
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Get token from localStorage
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        // Fetch user data
        const userResponse = await axios.get('http://localhost:5000/api/auth/user', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch clubs
        const clubsResponse = await axios.get('http://localhost:5000/api/clubs', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch events (for stats)
        const eventsResponse = await axios.get('http://localhost:5000/api/events', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch activities (for achievements)
        const activitiesResponse = await axios.get('http://localhost:5000/api/activities', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch attendance
        const attendanceResponse = await axios.get('http://localhost:5000/api/attendance', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const userData = userResponse.data;
        setUser(userData);
        setProfile({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          semester: userData.semester || '',
          course: userData.course || '',
          specialization: userData.specialization || '',
          rollNo: userData.rollNo || '',
          isACEMStudent: userData.isACEMStudent || true
        });

        // Transform clubs data
        const formattedClubs = clubsResponse.data
          .filter(club => userData.clubName.includes(club.name))
          .map(club => ({
            id: club._id,
            name: club.name,
            role: userData.isHeadCoordinator && userData.headCoordinatorClubs.includes(club.name)
              ? 'Head Coordinator'
              : userData.isAdmin
                ? 'Admin'
                : 'Member',
            joinedAt: userData.createdAt,
            badge: club.category === 'Technical' ? '🚀' :
              club.category === 'Cultural' ? '🎭' :
                club.category === 'Literary' ? '📚' :
                  club.category === 'Entrepreneurial' ? '💼' : '💡'
          }));

        // Calculate stats
        const userEvents = eventsResponse.data.filter(event =>
          userData.clubName.includes(event.club.name));
        const attendanceRecords = attendanceResponse.data;
        const userAttendance = attendanceRecords.flatMap((record) =>
          record.attendance.filter((a) => a.userId._id === userData._id)
        );
        const presentCount = userAttendance.filter((a) => a.status === "present").length;
        const totalCount = userAttendance.length;
        const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

        const stats = {
          totalEvents: userEvents.length,
          attendanceRate,
          eventsOrganized: eventsResponse.data.filter(event =>
            event.createdBy._id === userData._id).length,
          overallRank: 0, // Implement ranking logic if needed
          totalMembers: clubsResponse.data.reduce((sum, club) =>
            sum + (userData.clubName.includes(club.name) ? club.memberCount : 0), 0),
          seminarsAttended: userEvents.filter(event => event.type === 'seminar').length,
          competitionsAttended: userEvents.filter(event => event.type === 'competition').length,
          workshopsAttended: userEvents.filter(event => event.type === 'workshop').length
        };

        // Format achievements based on activities and events
        const eventTypeIcons = {
          seminar: '🎤',
          competition: '🏆',
          workshop: '🛠️',
          default: '⭐'
        };

        const achievements = [
          ...(eventsResponse?.data || [])
            .filter(event => event?.createdBy?._id && event.createdBy._id === userData?._id)
            .map(event => ({
              id: event._id || '',
              title: `Organized ${event.type ? (event.type.charAt(0).toUpperCase() + event.type.slice(1).toLowerCase()) : 'Event'}`,
              description: `Organized ${event.title || 'an event'}`,
              icon: eventTypeIcons[event.type?.toLowerCase()] || eventTypeIcons.default,
              earnedAt: event.createdAt || new Date()
            })),
          ...(activitiesResponse?.data || [])
            .filter(activity => activity?.createdBy?._id && activity.createdBy._id === userData?._id)
            .map(activity => ({
              id: activity._id || '',
              title: 'Activity Contributor',
              description: `Contributed to ${activity.title || 'an activity'}`,
              icon: '⭐',
              earnedAt: activity.createdAt || new Date()
            }))
        ];

        setProfileData({
          clubs: formattedClubs,
          achievements,
          stats
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching user:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        setError('Failed to load profile.');
        setIsLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      // Update user profile
      await axios.put('http://localhost:5000/api/auth/user', {
        name: profile.name,
        email: profile.email,
        phone: profile.phone
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update user details
      await axios.post('http://localhost:5000/api/auth/user-details', {
        semester: profile.semester,
        course: profile.course,
        specialization: profile.specialization,
        rollNo: profile.rollNo,
        isACEMStudent: profile.isACEMStudent,
        isClubMember: user.isClubMember,
        clubName: user.clubName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Profile updated successfully!');
      setUser(prev => ({
        ...prev,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        semester: profile.semester,
        course: profile.course,
        specialization: profile.specialization,
        rollNo: profile.rollNo,
        isACEMStudent: profile.isACEMStudent
      }));
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'superadmin': return <FaCrown className="text-yellow-500" />;
      case 'admin': return <FaShieldAlt className="text-blue-500" />;
      case 'Head Coordinator': return <FaCrown className="text-purple-500" />;
      case 'Coordinator': return <FaGraduationCap className="text-green-500" />;
      default: return <FaUser className="text-gray-500" />;
    }
  };

  const getRoleBadge = () => {
    if (user?.isAdmin) return { text: 'Super Admin', color: 'bg-red-500' };
    if (user?.isHeadCoordinator) return { text: 'Head Coordinator', color: 'bg-purple-500' };
    return { text: 'Member', color: 'bg-blue-500' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 font-[Poppins] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <FaSpinner className="text-6xl text-teal-600 animate-spin mx-auto mb-4" style={{ color: '#456882' }} />
          <p className="text-gray-600">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-[Poppins]">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg border-b"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1">
                  {getRoleIcon(user?.isAdmin ? 'superadmin' : user?.isHeadCoordinator ? 'Head Coordinator' : 'Member')}
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
                <p className="text-gray-600">{user?.course} • Semester {user?.semester} • Roll No: {user?.rollNo || 'N/A'}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs text-white ${getRoleBadge().color}`}>
                    {getRoleBadge().text}
                  </span>
                  <span className="px-2 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                    {user?.isACEMStudent ? 'ACEM Student' : 'Non-ACEM Student'}
                  </span>
                  <span className="text-sm text-gray-500">Rank #{profileData?.stats?.overallRank}</span>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              style={{ backgroundColor: '#456882' }}
            >
              {isEditing ? <FaEye /> : <FaEdit />}
              <span>{isEditing ? 'View Mode' : 'Edit Profile'}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
          {[
            { id: 'profile', label: 'Profile', icon: FaUser },
            { id: 'clubs', label: 'My Clubs', icon: FaUsers },
            { id: 'achievements', label: 'Achievements', icon: FaTrophy },
            { id: 'stats', label: 'Statistics', icon: FaChartLine }
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition ${activeTab === tab.id
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
              style={{ backgroundColor: activeTab === tab.id ? '#456882' : 'transparent' }}
            >
              <tab.icon className="text-sm" />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold mb-6 text-gray-800">Personal Information</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 rounded-lg border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-600' : 'border-gray-200 bg-gray-50'
                          } focus:outline-none`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 rounded-lg border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-600' : 'border-gray-200 bg-gray-50'
                          } focus:outline-none`}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 rounded-lg border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-600' : 'border-gray-200 bg-gray-50'
                          } focus:outline-none`}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Semester</label>
                      <input
                        type="number"
                        value={profile.semester}
                        onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 rounded-lg border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-600' : 'border-gray-200 bg-gray-50'
                          } focus:outline-none`}
                        min="1"
                        max="8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Course</label>
                      <input
                        type="text"
                        value={profile.course}
                        onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 rounded-lg border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-600' : 'border-gray-200 bg-gray-50'
                          } focus:outline-none`}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Specialization</label>
                      <input
                        type="text"
                        value={profile.specialization}
                        onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 rounded-lg border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-600' : 'border-gray-200 bg-gray-50'
                          } focus:outline-none`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Roll Number</label>
                      <input
                        type="text"
                        value={profile.rollNo}
                        onChange={(e) => setProfile({ ...profile, rollNo: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 rounded-lg border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-600' : 'border-gray-200 bg-gray-50'
                          } focus:outline-none`}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Student Status</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={profile.isACEMStudent}
                          onChange={(e) => setProfile({ ...profile, isACEMStudent: e.target.checked })}
                          disabled={!isEditing}
                          className="w-5 h-5 text-teal-600 focus:ring-teal-600 rounded"
                          style={{ accentColor: '#456882' }}
                        />
                        <span className="text-gray-700">ACEM Student</span>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      className={`w-full px-6 py-3 rounded-lg font-semibold transition ${isSubmitting ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700'
                        }`}
                      style={{ backgroundColor: isSubmitting ? '#d1d5db' : '#456882' }}
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin inline-block mr-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <FaSave className="inline-block mr-2" />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                  )}
                </form>
              </motion.div>
            )}

            {activeTab === 'clubs' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold text-gray-800">My Clubs</h2>
                {profileData?.clubs?.map(club => (
                  <div key={club.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{club.badge}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{club.name}</h3>
                          <p className="text-gray-600">{club.role}</p>
                          <p className="text-sm text-gray-500">Joined: {new Date(club.joinedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <FaWhatsapp
                          className="text-green-500 text-xl cursor-pointer hover:scale-110 transition"
                          onClick={() => window.open(`https://wa.me/${user.phone || '1234567890'}`)}
                        />
                        <FaEnvelope
                          className="text-blue-500 text-xl cursor-pointer hover:scale-110 transition"
                          onClick={() => window.location.href = `mailto:${user.email}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold text-gray-800">Achievements & Milestones</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profileData?.achievements?.map(achievement => (
                    <div key={achievement.id} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{achievement.title}</h3>
                          <p className="text-gray-600 text-sm">{achievement.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Earned: {new Date(achievement.earnedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold mb-6 text-gray-800">Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <FaCalendar className="text-2xl text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{profileData?.stats?.totalEvents}</p>
                    <p className="text-sm text-gray-600">Events Attended</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <FaChartLine className="text-2xl text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{profileData?.stats?.attendanceRate}%</p>
                    <p className="text-sm text-gray-600">Attendance Rate</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <FaTrophy className="text-2xl text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">{profileData?.stats?.eventsOrganized}</p>
                    <p className="text-sm text-gray-600">Events Organized</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <FaStar className="text-2xl text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-600">{profileData?.stats?.overallRank}</p>
                    <p className="text-sm text-gray-600">Overall Rank</p>
                  </div>
                  <div className="text-center p-4 bg-teal-50 rounded-lg">
                    <FaUsers className="text-2xl text-teal-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-teal-600">{profileData?.stats?.totalMembers}</p>
                    <p className="text-sm text-gray-600">Club Members</p>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <FaGraduationCap className="text-2xl text-indigo-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-indigo-600">{profileData?.stats?.seminarsAttended}</p>
                    <p className="text-sm text-gray-600">Seminars Attended</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <FaMedal className="text-2xl text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-600">{profileData?.stats?.competitionsAttended}</p>
                    <p className="text-sm text-gray-600">Competitions Attended</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <FaTrophy className="text-2xl text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-600">{profileData?.stats?.workshopsAttended}</p>
                    <p className="text-sm text-gray-600">Workshops Attended</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Clubs</span>
                  <span className="font-semibold text-teal-600">{profileData?.clubs?.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Achievements</span>
                  <span className="font-semibold text-teal-600">{profileData?.achievements?.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Events Organized</span>
                  <span className="font-semibold text-teal-600">{profileData?.stats?.eventsOrganized}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rank</span>
                  <span className="font-semibold text-teal-600">#{profileData?.stats?.overallRank}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h2>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/clubs')}
                  className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                  style={{ backgroundColor: '#456882' }}
                >
                  Explore Clubs
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/events')}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  View Events
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {(error || success) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${error ? 'bg-red-500' : 'bg-green-500'
            }`}
        >
          {error || success}
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;
