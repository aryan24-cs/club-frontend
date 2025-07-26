import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, 
  Calendar, 
  Mail, 
  Settings, 
  Search, 
  CheckCircle, 
  UserPlus, 
  Eye, 
  EyeOff, 
  X,
  MapPin,
  Clock,
  Award,
  ChevronLeft,
  Edit3,
  Trash2
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('about');
  const [joinLoading, setJoinLoading] = useState(false);

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
    setJoinLoading(true);
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
    setJoinLoading(false);
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

  const tabs = [
    { id: 'about', label: 'About', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'members', label: 'Members', icon: Users },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="animate-pulse">
          <div className="h-80 bg-gray-200"></div>
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto text-center">
          <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Club not found</h2>
          <Link
            to="/clubs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#456882] text-white rounded-full hover:bg-[#334d5e] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Clubs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#456882] to-[#5a7a98]">
          <img
            src={club.banner || club.icon || '/api/placeholder/1200/400'}
            alt={`${club.name} banner`}
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Navigation */}
        <div className="absolute top-6 left-6">
          <Link
            to="/clubs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Clubs
          </Link>
        </div>

        {/* Admin Controls */}
        {(isAdmin || isHeadCoordinator) && (
          <div className="absolute top-6 right-6">
            <Link
              to={`/clubs/${clubName}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              Edit Club
            </Link>
          </div>
        )}
        
        {/* Club Info */}
        <div className="absolute bottom-8 left-6 right-6">
          <div className="flex items-end gap-6">
            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              src={club.icon || '/api/placeholder/120/120'}
              alt={`${club.name} icon`}
              className="w-24 h-24 rounded-2xl border-4 border-white shadow-2xl"
            />
            <div className="flex-1">
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold text-white mb-2"
              >
                {club.name}
              </motion.h1>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center gap-6 text-white/90"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{members.length} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{activities.length} events</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {club.category || 'Active'}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Join/Member Status */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {isMember ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 border border-green-200 text-green-700 rounded-full">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">You're a member of this club</span>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoinClub}
              disabled={joinLoading}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#456882] to-[#5a7a98] text-white rounded-full hover:from-[#334d5e] hover:to-[#456882] transition-all shadow-lg disabled:opacity-50"
            >
              {joinLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              <span className="font-medium">
                {joinLoading ? 'Joining...' : 'Join Club'}
              </span>
            </motion.button>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-2xl">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-[#456882] shadow-md'
                      : 'text-gray-600 hover:text-[#456882]'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* About Tab */}
          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-[#456882] mb-4">About {club.name}</h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {club.description || 'Discover amazing opportunities and connect with like-minded students in this vibrant community.'}
                </p>
                
                {/* Club Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-6 h-6 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">Members</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{members.length}</p>
                    <p className="text-blue-700 text-sm">Active members</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-6 h-6 text-green-600" />
                      <h3 className="font-semibold text-green-900">Events</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{activities.length}</p>
                    <p className="text-green-700 text-sm">Total events</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-6 h-6 text-purple-600" />
                      <h3 className="font-semibold text-purple-900">Category</h3>
                    </div>
                    <p className="text-lg font-bold text-purple-600">{club.category || 'General'}</p>
                    <p className="text-purple-700 text-sm">Club type</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#456882]">Club Events</h2>
                  {(isAdmin || isHeadCoordinator) && (
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-full hover:bg-[#334d5e] transition-colors">
                      <Calendar className="w-4 h-4" />
                      Add Event
                    </button>
                  )}
                </div>
                
                {activities.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No events yet</h3>
                    <p className="text-gray-500">Check back later for upcoming events!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities.map((activity, index) => (
                      <motion.div
                        key={activity._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-semibold text-[#456882] flex-1">
                            {activity.title}
                          </h3>
                          {(isAdmin || isHeadCoordinator) && (
                            <div className="flex gap-2">
                              <button className="p-1 text-gray-400 hover:text-[#456882]">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600 mb-3">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{activity.date}</span>
                        </div>
                        
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {activity.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-[#456882]">
                    Club Members ({filteredMembers.length})
                  </h2>
                  
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#456882] focus:border-transparent"
                      />
                    </div>
                    
                    <button
                      onClick={() => setShowMembers(!showMembers)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-full hover:bg-[#334d5e] transition-colors"
                    >
                      {showMembers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showMembers ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {showMembers && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {filteredMembers.length === 0 ? (
                        <div className="text-center py-12">
                          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            {searchQuery ? 'No members found' : 'No members yet'}
                          </h3>
                          <p className="text-gray-500">
                            {searchQuery ? 'Try adjusting your search terms' : 'Be the first to join this club!'}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredMembers.map((member, index) => (
                            <motion.div
                              key={member.email}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#456882] to-[#5a7a98] rounded-full flex items-center justify-center text-white font-semibold">
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{member.name}</p>
                                  <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {member.email}
                                  </p>
                                </div>
                              </div>
                              
                              {(isAdmin || isHeadCoordinator) && (
                                <button
                                  onClick={() => handleRemoveMember(member.email)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                  title={`Remove ${member.name}`}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClubDetailPage;