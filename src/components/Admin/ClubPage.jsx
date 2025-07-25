// import React, { useState, useEffect } from 'react';
// import { 
//   Trophy, 
//   Medal, 
// //   Star, 
//   TrendingUp, 
//   Award, 
//   Crown, 
// //   Target, 
//   Calendar,
//   Users,
//   Activity,
//   Filter,
//   Search,
//   Download,
//   ChevronDown,
//   ChevronUp,
//   Zap,
// //   Fire,
// //   Gem,
//   Shield
// } from 'lucide-react';
// import axios from 'axios';

// const RankingSystem = () => {
//   const [activeTab, setActiveTab] = useState('overall');
//   const [timeFilter, setTimeFilter] = useState('all');
//   const [categoryFilter, setCategoryFilter] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortBy, setSortBy] = useState('totalScore');
//   const [sortOrder, setSortOrder] = useState('desc');
//   const [showFilters, setShowFilters] = useState(false);
  
//   const [rankings, setRankings] = useState([]);
//   const [achievements, setAchievements] = useState([]);
//   const [milestones, setMilestones] = useState([]);
//   const [stats, setStats] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem('token');
//         if (!token) throw new Error('No authentication token found');

//         // Fetch users for rankings
//         const usersResponse = await axios.get('http://localhost:5000/api/users', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         const users = usersResponse.data;

//         // Fetch events for event participation
//         const eventsResponse = await axios.get('http://localhost:5000/api/events', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         const events = eventsResponse.data;

//         // Fetch activities for project completion
//         const activitiesResponse = await axios.get('http://localhost:5000/api/activities', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         const activities = activitiesResponse.data;

//         // Fetch attendance for attendance rate
//         const attendanceResponse = await axios.get('http://localhost:5000/api/attendance', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         const attendanceRecords = attendanceResponse.data;

//         // Process rankings
//         const processedRankings = users.map((user, index) => {
//           // Calculate event participation
//           const eventParticipation = events.filter(event => 
//             user.clubName.includes(event.club.name)
//           ).length;

//           // Calculate projects completed (assuming activities are projects)
//           const projectsCompleted = activities.filter(activity => 
//             user.clubName.includes(activity.club) && activity.createdBy._id === user._id
//           ).length;

//           // Calculate attendance rate
//           const userAttendance = attendanceRecords.filter(record => 
//             record.attendance.some(a => a.userId._id === user._id)
//           );
//           const totalAttendance = userAttendance.length;
//           const presentCount = userAttendance.reduce((sum, record) => 
//             sum + (record.attendance.find(a => a.userId._id === user._id)?.status === 'present' ? 1 : 0), 0);
//           const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

//           // Calculate total score (example formula)
//           const totalScore = (eventParticipation * 50) + (projectsCompleted * 100) + (attendanceRate * 5);

//           // Determine badges
//           const badges = [];
//           if (attendanceRate >= 95) badges.push('Perfect Attendance');
//           if (projectsCompleted >= 5) badges.push('Project Master');
//           if (eventParticipation >= 15) badges.push('Event Enthusiast');
//           if (totalScore >= 900) badges.push('Top Performer');

//           // Determine level
//           let level = 'Bronze';
//           if (totalScore >= 900) level = 'Platinum';
//           else if (totalScore >= 800) level = 'Gold';
//           else if (totalScore >= 700) level = 'Silver';

//           return {
//             id: user._id,
//             name: user.name,
//             rollNo: user.rollNo || 'N/A',
//             clubs: user.clubName,
//             totalScore: Math.round(totalScore),
//             attendanceRate: attendanceRate.toFixed(1),
//             eventParticipation,
//             projectsCompleted,
//             badges,
//             rank: index + 1,
//             previousRank: index + 1, // Placeholder, requires historical data
//             avatar: 'https://via.placeholder.com/60/60',
//             level,
//             achievements: badges.length
//           };
//         }).sort((a, b) => b.totalScore - a.totalScore)
//           .map((item, index) => ({ ...item, rank: index + 1 }));

//         setRankings(processedRankings);

//         // Process achievements
//         const processedAchievements = [
//           {
//             id: 1,
//             title: 'Perfect Attendance',
//             description: 'Maintained 95%+ attendance rate',
//             icon: 'Shield',
//             rarity: 'legendary',
//             unlockedBy: processedRankings.filter(r => r.attendanceRate >= 95).length,
//             totalEligible: users.length
//           },
//           {
//             id: 2,
//             title: 'Project Master',
//             description: 'Completed 5+ projects',
//             icon: 'Zap',
//             rarity: 'epic',
//             unlockedBy: processedRankings.filter(r => r.projectsCompleted >= 5).length,
//             totalEligible: users.length
//           },
//           {
//             id: 3,
//             title: 'Event Enthusiast',
//             description: 'Participated in 15+ events',
//             icon: 'Users',
//             rarity: 'rare',
//             unlockedBy: processedRankings.filter(r => r.eventParticipation >= 15).length,
//             totalEligible: users.length
//           },
//           {
//             id: 4,
//             title: 'Top Performer',
//             description: 'Achieved 900+ points',
//             icon: 'Crown',
//             rarity: 'legendary',
//             unlockedBy: processedRankings.filter(r => r.totalScore >= 900).length,
//             totalEligible: users.length
//           }
//         ];
//         setAchievements(processedAchievements);

//         // Process milestones
//         const userResponse = await axios.get('http://localhost:5000/api/auth/user', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         const currentUser = userResponse.data;
//         const userRank = processedRankings.find(r => r.id === currentUser._id) || {};
//         const processedMilestones = [
//           {
//             id: 1,
//             title: 'First Club Join',
//             description: 'Join your first club',
//             progress: currentUser.clubName.length > 0 ? 100 : 0,
//             completed: currentUser.clubName.length > 0,
//             reward: '50 points'
//           },
//           {
//             id: 2,
//             title: 'Event Enthusiast',
//             description: 'Participate in 10 events',
//             progress: Math.min((userRank.eventParticipation || 0) / 10 * 100, 100),
//             completed: (userRank.eventParticipation || 0) >= 10,
//             reward: '200 points'
//           },
//           {
//             id: 3,
//             title: 'Project Master',
//             description: 'Complete 5 projects',
//             progress: Math.min((userRank.projectsCompleted || 0) / 5 * 100, 100),
//             completed: (userRank.projectsCompleted || 0) >= 5,
//             reward: '300 points'
//           },
//           {
//             id: 4,
//             title: 'Perfect Month',
//             description: 'Achieve 95%+ attendance',
//             progress: userRank.attendanceRate >= 95 ? 100 : (userRank.attendanceRate || 0),
//             completed: userRank.attendanceRate >= 95,
//             reward: '500 points'
//           }
//         ];
//         setMilestones(processedMilestones);

//         // Process stats
//         setStats({
//           totalStudents: users.length,
//           activeParticipants: users.filter(u => u.clubName.length > 0).length,
//           totalEvents: events.length,
//           totalProjects: activities.length,
//           averageAttendance: processedRankings.reduce((sum, r) => sum + parseFloat(r.attendanceRate), 0) / processedRankings.length || 0
//         });

//       } catch (err) {
//         setError(err.response?.data?.error || 'Failed to load data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const getRankIcon = (rank) => {
//     switch(rank) {
//       case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
//       case 2: return <Medal className="w-6 h-6 text-gray-400" />;
//       case 3: return <Award className="w-6 h-6 text-amber-600" />;
//       default: return <Trophy className="w-5 h-5 text-gray-400" />;
//     }
//   };

//   const getLevelColor = (level) => {
//     switch(level.toLowerCase()) {
//       case 'platinum': return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
//       case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
//       case 'silver': return 'bg-gradient-to-r from-gray-200 to-gray-400 text-gray-800';
//       default: return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
//     }
//   };

//   const getAchievementIcon = (iconName) => {
//     const icons = {
//       'Shield': Shield,
//       'Zap': Zap,
//       'Users': Users,
//       'Crown': Crown
//     };
//     const Icon = icons[iconName] || Trophy;
//     return <Icon className="w-8 h-8" />;
//   };

//   const getAchievementRarity = (rarity) => {
//     switch(rarity) {
//       case 'legendary': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
//       case 'epic': return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white';
//       case 'rare': return 'bg-gradient-to-r from-green-500 to-blue-500 text-white';
//       default: return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
//     }
//   };

//   const filteredRankings = rankings
//     .filter(student => 
//       (categoryFilter === 'all' || student.clubs.some(club => club.toLowerCase().includes(categoryFilter.toLowerCase()))) &&
//       (timeFilter === 'all' || true) && // Add time filter logic if backend supports it
//       (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()))
//     )
//     .sort((a, b) => {
//       const multiplier = sortOrder === 'desc' ? -1 : 1;
//       return (a[sortBy] - b[sortBy]) * multiplier;
//     });

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
//         <div className="text-red-600 text-lg">{error}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
//         <div className="max-w-7xl mx-auto px-4 py-8">
//           <div className="text-center">
//             <div className="flex items-center justify-center mb-4">
//               <Trophy className="w-12 h-12 mr-4" />
//               <h1 className="text-4xl font-bold">Hall of Fame</h1>
//             </div>
//             <p className="text-xl opacity-90">Celebrating Excellence & Achievement</p>
//             <div className="flex items-center justify-center space-x-8 mt-6 text-sm">
//               <div className="flex items-center">
//                 <Users className="w-5 h-5 mr-2" />
//                 {stats.totalStudents} Students
//               </div>
//               <div className="flex items-center">
//                 <Activity className="w-5 h-5 mr-2" />
//                 {stats.activeParticipants} Active
//               </div>
//               <div className="flex items-center">
//                 <Calendar className="w-5 h-5 mr-2" />
//                 {stats.totalEvents} Events
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Navigation */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4">
//           <div className="flex items-center justify-between py-4">
//             <div className="flex space-x-1">
//               {['overall', 'achievements', 'milestones', 'leaderboard'].map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
//                     activeTab === tab
//                       ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
//                       : 'text-gray-600 hover:bg-gray-100'
//                   }`}
//                 >
//                   {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                 </button>
//               ))}
//             </div>
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//             >
//               <Filter className="w-4 h-4" />
//               <span>Filters</span>
//               {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//             </button>
//           </div>
          
//           {showFilters && (
//             <div className="pb-4 border-t border-gray-100 pt-4 mt-4">
//               <div className="flex items-center space-x-4">
//                 <div className="flex items-center space-x-2">
//                   <Search className="w-4 h-4 text-gray-400" />
//                   <input
//                     type="text"
//                     placeholder="Search students..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                   />
//                 </div>
//                 <select 
//                   value={timeFilter}
//                   onChange={(e) => setTimeFilter(e.target.value)}
//                   className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
//                 >
//                   <option value="all">All Time</option>
//                   <option value="month">This Month</option>
//                   <option value="semester">This Semester</option>
//                   <option value="year">This Year</option>
//                 </select>
//                 <select 
//                   value={categoryFilter}
//                   onChange={(e) => setCategoryFilter(e.target.value)}
//                   className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
//                 >
//                   <option value="all">All Categories</option>
//                   <option value="technical">Technical</option>
//                   <option value="cultural">Cultural</option>
//                   <option value="literary">Literary</option>
//                   <option value="entrepreneurial">Entrepreneurial</option>
//                 </select>
//                 <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
//                   <Download className="w-4 h-4 mr-2" />
//                   Export
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         {activeTab === 'overall' && (
//           <div className="space-y-8">
//             {/* Top 3 Podium */}
//             <div className="bg-white rounded-2xl shadow-xl p-8">
//               <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">🏆 Top Performers</h2>
//               <div className="flex items-end justify-center space-x-8">
//                 {/* 2nd Place */}
//                 {rankings[1] && (
//                   <div className="text-center">
//                     <div className="bg-gradient-to-t from-gray-300 to-gray-100 rounded-lg p-6 mb-4 h-32 flex flex-col justify-end">
//                       <div className="bg-white rounded-full p-3 mx-auto mb-2 shadow-lg">
//                         <img src={rankings[1].avatar} alt={rankings[1].name} className="w-16 h-16 rounded-full" />
//                       </div>
//                       <div className={`px-3 py-1 rounded-full text-xs font-bold ${getLevelColor(rankings[1].level)}`}>
//                         {rankings[1].level}
//                       </div>
//                     </div>
//                     <div className="text-2xl font-bold text-gray-600 mb-1">2nd</div>
//                     <div className="font-semibold text-gray-900">{rankings[1].name}</div>
//                     <div className="text-sm text-gray-500">{rankings[1].totalScore} pts</div>
//                   </div>
//                 )}

//                 {/* 1st Place */}
//                 {rankings[0] && (
//                   <div className="text-center">
//                     <div className="bg-gradient-to-t from-yellow-400 to-yellow-200 rounded-lg p-6 mb-4 h-40 flex flex-col justify-end relative">
//                       <Crown className="w-8 h-8 text-yellow-600 absolute top-2 left-1/2 transform -translate-x-1/2" />
//                       <div className="bg-white rounded-full p-3 mx-auto mb-2 shadow-lg">
//                         <img src={rankings[0].avatar} alt={rankings[0].name} className="w-20 h-20 rounded-full" />
//                       </div>
//                       <div className={`px-3 py-1 rounded-full text-xs font-bold ${getLevelColor(rankings[0].level)}`}>
//                         {rankings[0].level}
//                       </div>
//                     </div>
//                     <div className="text-3xl font-bold text-yellow-600 mb-1">1st</div>
//                     <div className="font-semibold text-gray-900">{rankings[0].name}</div>
//                     <div className="text-sm text-gray-500">{rankings[0].totalScore} pts</div>
//                   </div>
//                 )}

//                 {/* 3rd Place */}
//                 {rankings[2] && (
//                   <div className="text-center">
//                     <div className="bg-gradient-to-t from-amber-600 to-amber-400 rounded-lg p-6 mb-4 h-28 flex flex-col justify-end">
//                       <div className="bg-white rounded-full p-3 mx-auto mb-2 shadow-lg">
//                         <img src={rankings[2].avatar} alt={rankings[2].name} className="w-14 h-14 rounded-full" />
//                       </div>
//                       <div className={`px-3 py-1 rounded-full text-xs font-bold ${getLevelColor(rankings[2].level)}`}>
//                         {rankings[2].level}
//                       </div>
//                     </div>
//                     <div className="text-2xl font-bold text-amber-600 mb-1">3rd</div>
//                     <div className="font-semibold text-gray-900">{rankings[2].name}</div>
//                     <div className="text-sm text-gray-500">{rankings[2].totalScore} pts</div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Quick Stats */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//               <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <div className="text-2xl font-bold">{stats.totalStudents}</div>
//                     <div className="text-blue-100">Total Students</div>
//                   </div>
//                   <Users className="w-8 h-8 text-blue-200" />
//                 </div>
//               </div>
//               <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <div className="text-2xl font-bold">{stats.activeParticipants}</div>
//                     <div className="text-green-100">Active Members</div>
//                   </div>
//                   <Activity className="w-8 h-8 text-green-200" />
//                 </div>
//               </div>
//               <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <div className="text-2xl font-bold">{stats.totalEvents}</div>
//                     <div className="text-purple-100">Events Held</div>
//                   </div>
//                   <Calendar className="w-8 h-8 text-purple-200" />
//                 </div>
//               </div>
//               <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <div className="text-2xl font-bold">{stats.averageAttendance.toFixed(1)}%</div>
//                     <div className="text-orange-100">Avg Attendance</div>
//                   </div>
//                   <TrendingUp className="w-8 h-8 text-orange-200" />
//                 </div>
//               </div>
//             </div>

//             {/* Recent Achievements */}
//             <div className="bg-white rounded-2xl shadow-xl p-6">
//               <h3 className="text-xl font-bold text-gray-900 mb-6">🎯 Recent Achievements</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 {achievements.slice(0, 4).map((achievement) => (
//                   <div key={achievement.id} className={`rounded-lg p-4 ${getAchievementRarity(achievement.rarity)}`}>
//                     <div className="flex items-center justify-between mb-2">
//                       {getAchievementIcon(achievement.icon)}
//                       <span className="text-xs uppercase tracking-wide font-bold opacity-80">
//                         {achievement.rarity}
//                       </span>
//                     </div>
//                     <h4 className="font-bold text-sm mb-1">{achievement.title}</h4>
//                     <p className="text-xs opacity-90 mb-2">{achievement.description}</p>
//                     <div className="text-xs opacity-80">
//                       {achievement.unlockedBy}/{achievement.totalEligible} unlocked
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'achievements' && (
//           <div className="space-y-6">
//             <div className="bg-white rounded-2xl shadow-xl p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-2xl font-bold text-gray-900">🏅 Achievement Gallery</h2>
//                 <div className="text-sm text-gray-500">
//                   {achievements.length} Total Achievements
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {achievements.map((achievement) => (
//                   <div key={achievement.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
//                     <div className={`w-16 h-16 rounded-xl p-3 mb-4 ${getAchievementRarity(achievement.rarity)}`}>
//                       {getAchievementIcon(achievement.icon)}
//                     </div>
//                     <div className="flex items-center justify-between mb-2">
//                       <h3 className="font-bold text-gray-900">{achievement.title}</h3>
//                       <span className={`px-2 py-1 rounded-full text-xs font-bold ${getAchievementRarity(achievement.rarity)}`}>
//                         {achievement.rarity}
//                       </span>
//                     </div>
//                     <p className="text-gray-600 text-sm mb-4">{achievement.description}</p>
//                     <div className="flex items-center justify-between text-sm">
//                       <span className="text-gray-500">Unlocked by</span>
//                       <span className="font-medium text-gray-900">
//                         {achievement.unlockedBy}/{achievement.totalEligible} students
//                       </span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
//                       <div 
//                         className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
//                         style={{ width: `${(achievement.unlockedBy / achievement.totalEligible) * 100}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'milestones' && (
//           <div className="space-y-6">
//             <div className="bg-white rounded-2xl shadow-xl p-6">
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 Milestone Tracker</h2>
//               <div className="space-y-4">
//                 {milestones.map((milestone) => (
//                   <div key={milestone.id} className="border border-gray-200 rounded-xl p-6">
//                     <div className="flex items-center justify-between mb-4">
//                       <div>
//                         <h3 className="font-bold text-gray-900 text-lg">{milestone.title}</h3>
//                         <p className="text-gray-600">{milestone.description}</p>
//                       </div>
//                       <div className="text-right">
//                         <div className={`px-3 py-1 rounded-full text-sm font-medium ${
//                           milestone.completed 
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-gray-100 text-gray-600'
//                         }`}>
//                           {milestone.completed ? 'Completed' : 'In Progress'}
//                         </div>
//                         <div className="text-sm text-gray-500 mt-1">
//                           Reward: {milestone.reward}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-sm text-gray-600">Progress</span>
//                       <span className="text-sm font-medium text-gray-900">{milestone.progress}%</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-3">
//                       <div 
//                         className={`h-3 rounded-full transition-all ${
//                           milestone.completed 
//                             ? 'bg-gradient-to-r from-green-500 to-emerald-600'
//                             : 'bg-gradient-to-r from-indigo-500 to-purple-600'
//                         }`}
//                         style={{ width: `${milestone.progress}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'leaderboard' && (
//           <div className="space-y-6">
//             <div className="bg-white rounded-2xl shadow-xl p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-2xl font-bold text-gray-900">📊 Complete Leaderboard</h2>
//                 <div className="flex items-center space-x-3">
//                   <select 
//                     value={sortBy}
//                     onChange={(e) => setSortBy(e.target.value)}
//                     className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
//                   >
//                     <option value="totalScore">Total Score</option>
//                     <option value="attendanceRate">Attendance Rate</option>
//                     <option value="eventParticipation">Event Participation</option>
//                     <option value="projectsCompleted">Projects Completed</option>
//                   </select>
//                   <button
//                     onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
//                     className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                   >
//                     {sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
//                   </button>
//                 </div>
//               </div>
//               <div className="space-y-3">
//                 {filteredRankings.map((student, index) => (
//                   <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
//                     <div className="flex items-center space-x-4">
//                       <div className="flex items-center justify-center w-8 h-8">
//                         {getRankIcon(student.rank)}
//                       </div>
//                       <div className="w-12 h-12 relative">
//                         <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-full" />
//                         <div className={`absolute -bottom-1 -right-1 px-2 py-1 rounded-full text-xs font-bold ${getLevelColor(student.level)}`}>
//                           {student.level.charAt(0)}
//                         </div>
//                       </div>
//                       <div>
//                         <div className="flex items-center space-x-2">
//                           <h3 className="font-semibold text-gray-900">{student.name}</h3>
//                           <span className="text-sm text-gray-500">#{student.rank}</span>
//                           {student.rank < student.previousRank && (
//                             <TrendingUp className="w-4 h-4 text-green-500" />
//                           )}
//                         </div>
//                         <div className="text-sm text-gray-500">{student.rollNo}</div>
//                         <div className="flex items-center space-x-2 mt-1">
//                           {student.clubs.map((club, idx) => (
//                             <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
//                               {club}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-8">
//                       <div className="text-center">
//                         <div className="text-2xl font-bold text-gray-900">{student.totalScore}</div>
//                         <div className="text-xs text-gray-500">Total Score</div>
//                       </div>
//                       <div className="text-center">
//                         <div className="text-lg font-semibold text-green-600">{student.attendanceRate}%</div>
//                         <div className="text-xs text-gray-500">Attendance</div>
//                       </div>
//                       <div className="text-center">
//                         <div className="text-lg font-semibold text-blue-600">{student.eventParticipation}</div>
//                         <div className="text-xs text-gray-500">Events</div>
//                       </div>
//                       <div className="text-center">
//                         <div className="text-lg font-semibold text-purple-600">{student.projectsCompleted}</div>
//                         <div className="text-xs text-gray-500">Projects</div>
//                       </div>
//                       <div className="text-center">
//                         <div className="text-lg font-semibold text-orange-600">{student.achievements}</div>
//                         <div className="text-xs text-gray-500">Achievements</div>
//                       </div>
//                     </div>
//                     <div className="flex flex-wrap gap-1">
//                       {student.badges.slice(0, 3).map((badge, idx) => (
//                         <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
//                           {badge}
//                         </span>
//                       ))}
//                       {student.badges.length > 3 && (
//                         <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
//                           +{student.badges.length - 3}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Floating Action Button */}
//       <div className="fixed bottom-8 right-8">
//         <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105">
//           <Trophy className="w-6 h-6" />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default RankingSystem;

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
        const userResponse = await axios.get('http://localhost:5000/api/auth/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = userResponse.data;
        setUserRole(user.isAdmin ? 'admin' : 
                    user.isHeadCoordinator ? 'head_coordinator' : 
                    user.headCoordinatorClubs.includes(club?.name) ? 'coordinator' : 'student');
        setIsMember(user.clubName.includes(club?.name));

        // Fetch club data
        const clubResponse = await axios.get(`http://localhost:5000/api/clubs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClub(clubResponse.data);

        // Fetch events
        const eventsResponse = await axios.get('http://localhost:5000/api/events', {
          params: { club: id },
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(eventsResponse.data);

        // Fetch activities
        const activitiesResponse = await axios.get('http://localhost:5000/api/activities', {
          params: { club: clubResponse.data.name },
          headers: { Authorization: `Bearer ${token}` }
        });
        setActivities(activitiesResponse.data);

        // Fetch members
        const membersResponse = await axios.get(`http://localhost:5000/api/clubs/${id}/members`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMembers(membersResponse.data);

        // Fetch attendance
        const attendanceResponse = await axios.get('http://localhost:5000/api/attendance', {
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
      await axios.post(`http://localhost:5000/api/clubs/${id}/join`, {}, {
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
                                  await axios.delete(`http://localhost:5000/api/clubs/${id}/members`, {
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