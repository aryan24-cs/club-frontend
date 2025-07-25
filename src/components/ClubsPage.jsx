import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/clubs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClubs(response.data);
        setFilteredClubs(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load clubs. Please try again.',err);
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  useEffect(() => {
    setFilteredClubs(
      clubs.filter((club) =>
        club.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, clubs]);

  return (
    <div className="min-h-screen bg-white py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-red-600">Explore Our Clubs</h1>
        <p className="text-gray-600 mt-2">Discover vibrant communities at ACEM!</p>
        <input
          type="text"
          placeholder="Search clubs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-4 w-full max-w-md px-4 py-2 border-2 border-red-600 rounded-full focus:outline-none focus:border-red-700"
        />
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-64 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 text-center"
        >
          {error}
        </motion.p>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredClubs.map((club) => (
              <motion.div
                key={club._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <img
                  src={club.icon}
                  alt={club.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-red-600">{club.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {club.description.slice(0, 50)}...
                  </p>
                  <Link
                    to={`/clubs/${club.name.toLowerCase()}`}
                    className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    Explore
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default ClubsPage;