import React, { useState, useEffect } from 'react';
// import { 
//   Users,
//   Calendar,
//   UserPlus,
//   Settings,
//   ChevronRight,
//   Activity,
//   Mail,
//   Phone,
//   MessageCircle,
//   Award,
//   Search,
//   Download,
//   Clock,
//   MapPin,
//   Eye,
//   TrendingUp
// } from 'react-icons/fi';
import axios from 'axios';
import { useParams } from 'react-router-dom';

// Define BASE_URL at the top of the file
const BASE_URL = 'https://club-manager-chi.vercel.app'; // Change this to your production URL when deploying

const ClubPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [userRole, setUserRole] = useState('student');
  const [isMember, setIsMember] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Validate club ID
      if (!id || id === 'undefined') {
        setError('Invalid club ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        // Fetch user data
        const userResponse = await axios.get(`${BASE_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = userResponse.data;
        setUserRole(user.isAdmin ? 'admin' : 
                    user.isHeadCoordinator ? 'head_coordinator' : 
                    user.headCoordinatorClubs.includes(club?.name) ? 'coordinator' : 'student');
        setIsMember(user.clubName.includes(club?.name));

        // Fetch club data
        const clubResponse = await axios.get(`${BASE_URL}/api/clubs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClub(clubResponse.data);

        // Fetch events
        const eventsResponse = await axios.get(`${BASE_URL}/api/events`, {
          params: { club: id },
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(eventsResponse.data);

        // Fetch activities
        const activitiesResponse = await axios.get(`${BASE_URL}/api/activities`, {
          params: { club: clubResponse.data.name },
          headers: { Authorization: `Bearer ${token}` }
        });
        setActivities(activitiesResponse.data);

        // Fetch members
        const membersResponse = await axios.get(`${BASE_URL}/api/clubs/${id}/members`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMembers(membersResponse.data);

        // Fetch attendance
        const attendanceResponse = await axios.get(`${BASE_URL}/api/attendance`, {
          params: { club: id },
          headers: { Authorization: `Bearer ${token}` }
        });
        setAttendance(attendanceResponse.data);

      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const joinClub = async () => {
    if (!id || id === 'undefined') {
      setError('Invalid club ID');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/api/clubs/${id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsMember(true);
      alert('Membership request sent successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join club');
    }
  };

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    
    if (filterType === 'upcoming') return eventDate >= today;
    if (filterType === 'past') return eventDate < today;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden">
        <img 
          src={club.banner || 'https://via.placeholder.com/800x300'} 
          alt={club.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="flex items-center justify-center mb-4">
              <img 
                src={club.icon || 'https://via.placeholder.com/100'} 
                alt={club.name}
                className="w-20 h-20 rounded-full border-4 border-white mr-4"
              />
              <div>
                <h1 className="text-4xl font-bold mb-2">{club.name}</h1>
                <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
                  {club.category}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {club.memberCount} Members
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {club.eventsCount} Events
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {['overview', 'events', 'activities', 'members', 'attendance'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'members' && <span className="ml-1 text-xs">({club.memberCount})</span>}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              {!isMember && userRole === 'student' && (
                <button
                  onClick={joinClub}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Club
                </button>
              )}
              {(userRole === 'coordinator' || userRole === 'head_coordinator' || userRole === 'admin') && (
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-600 leading-relaxed">{club.description}</p>
              </div>

              {/* Recent Events */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Events</h2>
                  <button 
                    onClick={() => setActiveTab('events')}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm"
                  >
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.slice(0, 2).map((event) => (
                    <div key={event._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <img src={event.banner || 'https://via.placeholder.com/400x200'} alt={event.title} className="w-full h-32 object-cover" />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Calendar className="w-4 h-4 mr-1" />
                          {event.date}
                          <Clock className="w-4 h-4 ml-3 mr-1" />
                          {event.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-1" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Activities</h2>
                  <button 
                    onClick={() => setActiveTab('activities')}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm"
                  >
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="space-y-4">
                  {activities.slice(0, 2).map((activity) => (
                    <div key={activity._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{activity.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                          <span className="text-xs text-gray-500">{activity.date}</span>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {activity.images.slice(0, 2).map((img, index) => (
                            <img key={index} src={img || 'https://via.placeholder.com/300x200'} alt="" className="w-16 h-16 rounded object-cover" />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Club Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-indigo-600 mr-2" />
                      <span className="text-gray-600">Members</span>
                    </div>
                    <span className="font-semibold text-gray-900">{club.memberCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-gray-600">Events</span>
                    </div>
                    <span className="font-semibold text-gray-900">{club.eventsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="text-gray-600">Activities</span>
                    </div>
                    <span className="font-semibold text-gray-900">{activities.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 text-orange-600 mr-2" />
                      <span className="text-gray-600">Avg Attendance</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {attendance.length > 0 
                        ? ((attendance.reduce((sum, record) => sum + record.stats.attendanceRate, 0) / attendance.length).toFixed(1) + '%')
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 text-sm">{club.contactEmail}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 text-sm">+91-8851020767</span>
                  </div>
                  <div className="pt-3">
                    <button 
                      onClick={() => alert('Contact form not implemented yet')}
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Club
                    </button>
                  </div>
                </div>
              </div>

              {/* Coordinators */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Coordinators</h3>
                <div className="space-y-3">
                  {club.superAdmins.map((admin, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <Award className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{admin.name}</div>
                        <div className="text-xs text-gray-500">{admin.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Events</h2>
                <div className="flex items-center space-x-3">
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">All Events</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past Events</option>
                  </select>
                  {(userRole === 'coordinator' || userRole === 'head_coordinator' || userRole === 'admin') && (
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                      Add Event
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <div key={event._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <img src={event.banner || 'https://via.placeholder.com/400x200'} alt={event.title} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          {event.date}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-2" />
                          {event.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.location}
                        </div>
                      </div>
                      <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Activities</h2>
                {(userRole === 'coordinator' || userRole === 'head_coordinator' || userRole === 'admin') && (
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    Add Activity
                  </button>
                )}
              </div>
              <div className="space-y-6">
                {activities.map((activity) => (
                  <div key={activity._id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{activity.title}</h3>
                        <p className="text-gray-600 mb-2">{activity.description}</p>
                        <span className="text-sm text-gray-500">{activity.date}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {activity.images.map((img, index) => (
                        <img key={index} src={img || 'https://via.placeholder.com/300x200'} alt={`Activity ${index + 1}`} className="w-full h-32 rounded object-cover hover:scale-105 transition-transform cursor-pointer" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Members ({members.length})</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Roll No</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Phone</th>
                      {(userRole === 'coordinator' || userRole === 'head_coordinator' || userRole === 'admin') && (
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => (
                      <tr key={member._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-indigo-600 text-sm font-medium">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900">{member.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{member.rollNo || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-600">{member.email}</td>
                        <td className="py-3 px-4 text-gray-600">{member.phone || 'N/A'}</td>
                        {(userRole === 'coordinator' || userRole === 'head_coordinator' || userRole === 'admin') && (
                          <td className="py-3 px-4">
                            <button 
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('token');
                                  await axios.delete(`${BASE_URL}/api/clubs/${id}/members`, {
                                    headers: { Authorization: `Bearer ${token}` },
                                    data: { email: member.email }
                                  });
                                  setMembers(members.filter(m => m._id !== member._id));
                                  alert('Member removed successfully');
                                } catch (err) {
                                  setError(err.response?.data?.error || 'Failed to remove member');
                                }
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Attendance Records</h2>
                {(userRole === 'coordinator' || userRole === 'head_coordinator' || userRole === 'admin') && (
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    Mark Attendance
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Lecture #</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Present</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Total</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Attendance %</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record) => (
                      <tr key={record._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{record.date}</td>
                        <td className="py-3 px-4 text-gray-600">{record.lectureNumber}</td>
                        <td className="py-3 px-4 text-green-600 font-medium">{record.stats.presentCount}</td>
                        <td className="py-3 px-4 text-gray-600">{record.stats.totalMarked}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.stats.attendanceRate >= 90 
                              ? 'bg-green-100 text-green-800'
                              : record.stats.attendanceRate >= 75 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.stats.attendanceRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button className="text-indigo-600 hover:text-indigo-800 text-sm mr-3">View</button>
                          {(userRole === 'coordinator' || userRole === 'head_coordinator' || userRole === 'admin') && (
                            <button className="text-gray-600 hover:text-gray-800 text-sm">Edit</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubPage;