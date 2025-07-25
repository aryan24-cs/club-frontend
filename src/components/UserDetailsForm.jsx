import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserDetailsForm = () => {
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [selectedClubs, setSelectedClubs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [semesterFocused, setSemesterFocused] = useState(false);
  const [courseFocused, setCourseFocused] = useState(false);
  const [specializationFocused, setSpecializationFocused] = useState(false);
  const navigate = useNavigate();

  const courses = ['BTech', 'BCA', 'BBA', 'MBA'];
  const clubs = ['Technitude', 'Kalakriti', 'Sahitya', 'Rhythm', 'Entrepreneurship'];

  // Water ripple effect
  useEffect(() => {
    const createRipple = (e) => {
      const ripple = document.createElement('span');
      const diameter = 15;
      const radius = diameter / 2;
      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${e.clientX - radius}px`;
      ripple.style.top = `${e.clientY - radius}px`;
      ripple.style.position = 'fixed';
      ripple.style.borderRadius = '50%';
      ripple.style.backgroundColor = 'rgba(220, 20, 60, 0.3)';
      ripple.style.pointerEvents = 'none';
      ripple.style.zIndex = '9999';
      ripple.style.animation = 'ripple 0.6s ease-out';
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    };

    document.addEventListener('click', createRipple);
    return () => document.removeEventListener('click', createRipple);
  }, []);

  const labelVariants = {
    resting: { y: 8, fontSize: '0.875rem', color: '#4B5563' },
    floating: { y: -8, fontSize: '0.75rem', color: '#DC143C' },
  };

  const questionVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.5, ease: 'easeIn' } },
  };

  const handleNextQuestion = () => {
    if (currentQuestion === 1 && !semester) {
      setError('Please enter your semester');
      return;
    }
    if (currentQuestion === 2 && !course) {
      setError('Please select a course');
      return;
    }
    if (currentQuestion === 3 && !specialization) {
      setError('Please enter your specialization');
      return;
    }
    setError('');
    setCurrentQuestion((prev) => prev + 1);
  };

  const handleClubSelection = (club) => {
    setSelectedClubs((prev) =>
      prev.includes(club) ? prev.filter((c) => c !== club) : [...prev, club]
    );
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/auth/user-details',
        {
          semester,
          course,
          specialization,
          isClubMember: selectedClubs.length > 0,
          clubName: selectedClubs.length > 0 ? selectedClubs : [],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save details. Try again.');
    }
    setLoading(false);
  };

  const renderQuestion = () => {
    switch (currentQuestion) {
      case 1:
        return (
          <motion.div
            key="semester"
            variants={questionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative"
          >
            <motion.label
              htmlFor="semester"
              className="absolute left-4 top-2 sm:top-3 text-gray-600 font-medium pointer-events-none"
              animate={semesterFocused || semester ? 'floating' : 'resting'}
              variants={labelVariants}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              Semester
            </motion.label>
            <input
              id="semester"
              type="number"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              onFocus={() => setSemesterFocused(true)}
              onBlur={() => setSemesterFocused(false)}
              className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border-b-2 border-red-600 text-gray-900 bg-transparent focus:outline-none focus:border-red-700 transition"
              aria-label="Semester"
              min="1"
              max="8"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextQuestion}
              className="mt-4 w-full px-4 py-2 sm:py-3 bg-red-600 text-white rounded-full font-semibold text-sm sm:text-base hover:bg-red-700 transition"
              aria-label="Next question"
            >
              Next
            </motion.button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="course"
            variants={questionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative"
          >
            <motion.label
              htmlFor="course"
              className="absolute left-4 top-2 sm:top-3 text-gray-600 font-medium pointer-events-none"
              animate={courseFocused || course ? 'floating' : 'resting'}
              variants={labelVariants}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              Course
            </motion.label>
            <select
              id="course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              onFocus={() => setCourseFocused(true)}
              onBlur={() => setCourseFocused(false)}
              className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border-b-2 border-red-600 text-gray-900 bg-transparent focus:outline-none focus:border-red-700 transition"
              aria-label="Course"
            >
              <option value="" disabled>
                Select a course
              </option>
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextQuestion}
              className="mt-4 w-full px-4 py-2 sm:py-3 bg-red-600 text-white rounded-full font-semibold text-sm sm:text-base hover:bg-red-700 transition"
              aria-label="Next question"
            >
              Next
            </motion.button>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="specialization"
            variants={questionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative"
          >
            <motion.label
              htmlFor="specialization"
              className="absolute left-4 top-2 sm:top-3 text-gray-600 font-medium pointer-events-none"
              animate={specializationFocused || specialization ? 'floating' : 'resting'}
              variants={labelVariants}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              Specialization (e.g., CSE, ME)
            </motion.label>
            <input
              id="specialization"
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              onFocus={() => setSpecializationFocused(true)}
              onBlur={() => setSpecializationFocused(false)}
              className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border-b-2 border-red-600 text-gray-900 bg-transparent focus:outline-none focus:border-red-700 transition"
              aria-label="Specialization"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextQuestion}
              className="mt-4 w-full px-4 py-2 sm:py-3 bg-red-600 text-white rounded-full font-semibold text-sm sm:text-base hover:bg-red-700 transition"
              aria-label="Next question"
            >
              Next
            </motion.button>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="clubs"
            variants={questionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <h3 className="text-gray-600 font-semibold text-center mb-4 text-sm sm:text-base">
              Select Clubs (You can choose multiple)
            </h3>
            <div className="space-y-3 max-h-48 sm:max-h-64 overflow-y-auto pr-2">
              {clubs.map((club) => (
                <div key={club} className="flex items-center space-x-3">
                  <label className="flex items-center cursor-pointer w-full">
                    <input
                      type="checkbox"
                      id={`club-${club}`}
                      checked={selectedClubs.includes(club)}
                      onChange={() => handleClubSelection(club)}
                      className="hidden"
                      aria-label={`Select ${club}`}
                    />
                    <span
                      className={`w-5 h-5 flex items-center justify-center border-2 rounded-md transition-all duration-200 ${
                        selectedClubs.includes(club)
                          ? 'bg-red-600 border-red-600'
                          : 'border-gray-300 hover:border-red-400'
                      }`}
                    >
                      {selectedClubs.includes(club) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="ml-2 text-gray-700 font-medium hover:text-red-600 transition-colors text-sm sm:text-base">
                      {club}
                    </span>
                  </label>
                </div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={loading}
              className="mt-6 w-full px-4 py-2 sm:py-3 bg-red-600 text-white rounded-full font-semibold text-sm sm:text-base hover:bg-red-700 transition disabled:opacity-50"
              aria-label="Submit details"
            >
              {loading ? 'Submitting...' : 'Submit Details'}
            </motion.button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">
      <style>
        {`
          @keyframes ripple {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(4); opacity: 0; }
          }
          [style*="animation: ripple"] {
            animation: ripple 0.6s ease-out;
          }
        `}
      </style>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="w-full max-w-sm sm:max-w-md md:max-w-lg p-4 sm:p-6 bg-white rounded-lg shadow-md sm:shadow-lg"
      >
        <h2 className="text-2xl sm:text-3xl font-semibold text-red-600 text-center mb-6 sm:mb-8">
          Complete Your Profile
        </h2>
        <div className="space-y-4 sm:space-y-6">
          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="text-red-500 text-sm text-center"
              >
                {error}
              </motion.p>
            )}
            {renderQuestion()}
          </AnimatePresence>
          <p className="text-center text-gray-600 text-sm sm:text-base">
            <Link to="/clubs" className="text-blue-600 hover:underline font-semibold">
              Skip to Clubs
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default UserDetailsForm;