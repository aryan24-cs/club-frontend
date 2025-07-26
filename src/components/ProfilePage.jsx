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

// Mock data for demonstration - replace with actual API calls
const mockProfileData = {
  user: {
    id: 1,
    name: 'Alex Johnson',
    email: 'alex.johnson@college.edu',
    phone: '+91 9876543210',
    rollNumber: 'CS21B1234',
    batch: '2021-2025',
    department: 'Computer Science',
    isAdmin: false,
    isHeadCoordinator: true,
    profilePicture: null,
    joinedAt: '2021-08-15'
  },
  clubs: [
    { id: 1, name: 'Tech Club', role: 'Head Coordinator', joinedAt: '2021-09-01', badge: '🚀' },
    { id: 2, name: 'Photography Club', role: 'Member', joinedAt: '2022-01-15', badge: '📸' },
    { id: 3, name: 'Drama Society', role: 'Coordinator', joinedAt: '2021-10-01', badge: '🎭' }
  ],
  achievements: [
    { id: 1, title: 'Event Organizer', description: 'Organized 5+ events', icon: '🏆', earnedAt: '2023-05-01' },
    { id: 2, title: 'Active Member', description: '90%+ attendance', icon: '⭐', earnedAt: '2023-03-15' },
    { id: 3, title: 'Leadership Excellence', description: 'Head Coordinator for 2+ years', icon: '👑', earnedAt: '2023-08-01' }
  ],
  stats: {
    totalEvents: 28,
    attendanceRate: 92,
    eventsOrganized: 12,
    overallRank: 5,
    totalMembers: 156
  }
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    rollNumber: '',
    department: '',
    batch: ''
  });
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // In real implementation, replace with actual API calls
        setTimeout(() => {
          setUser(mockProfileData.user);
          setProfile({
            name: mockProfileData.user.name,
            email: mockProfileData.user.email,
            phone: mockProfileData.user.phone,
            rollNumber: mockProfileData.user.rollNumber,
            department: mockProfileData.user.department,
            batch: mockProfileData.user.batch
          });
          setProfileData(mockProfileData);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load profile.');
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('Profile updated successfully!');
      setUser(prev => ({ ...prev, ...profile }));
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile.');
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
                <p className="text-gray-600">{user?.department} • {user?.batch}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs text-white ${getRoleBadge().color}`}>
                    {getRoleBadge().text}
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
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition ${
                activeTab === tab.id 
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
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-600' : 'border-gray-200 bg-gray-50'
                        } focus:outline-none`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Roll Number</label>
                      <input
                        type="text"
                        value={profile.rollNumber}
                        onChange={(e) => setProfile({ ...profile, rollNumber: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-600' : 'border-gray-200 bg-gray-50'
                        } focus:outline-none`}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-600' : 'border-gray-200 bg-gray-50'
                      } focus:outline-none`}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-600' : 'border-gray-200 bg-gray-50'
                        } focus:outline-none`}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">Department</label>
                      <input
                        type="text"
                        value={profile.department}
                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-600' : 'border-gray-200 bg-gray-50'
                        } focus:outline-none`}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Batch</label>
                    <input
                      type="text"
                      value={profile.batch}
                      onChange={(e) => setProfile({ ...profile, batch: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-600' : 'border-gray-200 bg-gray-50'
                      } focus:outline-none`}
                    />
                  </div>

                  {isEditing && (
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      className={`w-full px-6 py-3 rounded-lg font-semibold transition ${
                        isSubmitting ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700'
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
                        <FaWhatsapp className="text-green-500 text-xl cursor-pointer hover:scale-110 transition" />
                        <FaEnvelope className="text-blue-500 text-xl cursor-pointer hover:scale-110 transition" />
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
                    <p className="text-2xl font-bold text-yellow-600">#{profileData?.stats?.overallRank}</p>
                    <p className="text-sm text-gray-600">Overall Rank</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Clubs Joined</span>
                  <span className="font-semibold text-teal-600">{profileData?.clubs?.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Achievements</span>
                  <span className="font-semibold text-teal-600">{profileData?.achievements?.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold text-teal-600">
                    {user?.joinedAt ? new Date(user.joinedAt).getFullYear() : '2021'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Attended Tech Talk event</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Updated profile information</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Earned new achievement</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Notification Messages */}
      {(error || success) && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            error ? 'bg-red-500' : 'bg-green-500'
          } text-white max-w-sm`}
        >
          <p className="text-sm">{error || success}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-2 text-white underline text-xs"
            onClick={() => {
              setError('');
              setSuccess('');
            }}
          >
            Dismiss
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;