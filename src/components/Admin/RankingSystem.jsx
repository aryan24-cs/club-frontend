import React, { useState, useEffect } from 'react';
import {
  FaTrophy,
  FaMedal,
  FaAward,
  FaSearch,
  FaDownload,
  FaChevronDown,
  FaChevronUp,
  FaSpinner,
  FaExclamationTriangle,
  FaUsers
} from 'react-icons/fa';
import axios from 'axios';

const RankingSystem = () => {
  const [rankings, setRankings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('totalPoints');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPointsTable = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }

        // Fetch current user to verify authentication
        console.log('Fetching current user details...');
        const userResponse = await axios.get('http://localhost:5000/api/auth/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = userResponse.data;
        console.log('User data:', user);

        // Check if user is a club member or admin
        if (!user.isClubMember && !user.isAdmin) {
          throw new Error('You are not authorized to view the points table');
        }

        // Fetch global points table with club names
        console.log('Fetching global points table...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await axios.get('http://localhost:5000/api/points-table', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('Points table response:', response.data);

        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid response format from server');
        }

        if (response.data.length === 0) {
          setError('No members found in any club');
          setRankings([]);
          return;
        }

        const processedRankings = response.data.map((user, index) => ({
          id: user.userId || user._id || 'unknown',
          name: user.name || 'Unknown',
          rollNo: user.rollNo || 'N/A',
          totalPoints: user.totalPoints || 0,
          clubNames: Array.isArray(user.clubName) ? user.clubName.join(', ') : user.clubName || 'None',
          rank: index + 1,
          avatar: user.avatar || 'https://via.placeholder.com/60/60',
          level: user.totalPoints >= 900 ? 'Platinum' :
            user.totalPoints >= 800 ? 'Gold' :
            user.totalPoints >= 700 ? 'Silver' : 'Bronze'
        }));

        setRankings(processedRankings);
      } catch (err) {
        console.error('Error fetching points table:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        });
        if (err.name === 'AbortError') {
          setError('Request timed out. Please try again later.');
        } else {
          setError(err.response?.data?.error || err.message || 'Failed to load points table. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPointsTable();
  }, []); // Run on mount

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <FaTrophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <FaMedal className="w-6 h-6 text-gray-400" />;
      case 3: return <FaAward className="w-6 h-6 text-amber-600" />;
      default: return <FaTrophy className="w-5 h-5 text-gray-400" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'platinum': return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'silver': return 'bg-gradient-to-r from-gray-200 to-gray-400 text-gray-800';
      default: return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
    }
  };

  const filteredRankings = rankings
    .filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.clubNames.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      if (sortBy === 'name' || sortBy === 'rollNo' || sortBy === 'clubNames') {
        return a[sortBy].localeCompare(b[sortBy]) * multiplier;
      }
      return (a[sortBy] - b[sortBy]) * multiplier;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-[Poppins] flex items-center justify-center">
        <FaSpinner className="text-6xl text-teal-600 animate-spin" style={{ color: '#456882' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-[Poppins] flex items-center justify-center">
        <div className="text-red-600 text-lg flex items-center space-x-2">
          <FaExclamationTriangle className="w-6 h-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-[Poppins]">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <FaTrophy className="w-12 h-12 mr-4 text-teal-600" style={{ color: '#456882' }} />
              <h1 className="text-4xl font-bold text-gray-800">Global Points Table</h1>
            </div>
            <p className="text-xl text-gray-600">Track Performance Across All Clubs</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm border彼此

System: * The user has requested to modify the existing `RankingSystem.jsx` to include club names for each member in a global ranking system. The key changes made to the original artifact include:
1. Added `clubNames` to the `processedRankings` object, joining the `user.clubName` array (or string) with commas.
2. Updated the search filter to include `clubNames` in the search criteria.
3. Modified the UI to display club names alongside each member's details.
4. Added `clubNames` as a sortable field in the sort dropdown.
5. Included the `FaUsers` icon for visual representation of clubs in the UI.

The artifact assumes the backend API (`/api/points-table`) returns `clubName` as part of the user data, either as an array or string. The code handles both cases by joining array elements with commas or using the string directly, defaulting to 'None' if no club data is available. The UI now shows club names in a new column or section for each member, and the search functionality includes club names for filtering.

The artifact_id is new (`8f3a9c2e-4b1f-4a7d-9e2a-3b7c5d9f1a2b`) as this is a modified version of the original code, not an update to an existing artifact in the conversation history. The contentType is set to `text/jsx` to reflect the React JSX format, and the title is `RankingSystem.jsx` to indicate the file type.