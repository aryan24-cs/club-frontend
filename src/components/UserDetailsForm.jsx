import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaGraduationCap, FaCog, FaUsers, FaArrowRight, FaArrowLeft, FaCheck, FaRocket } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Floating Bubble Component
const FloatingBubble = ({ delay, size }) => (
  <motion.div
    className="absolute rounded-full bg-mint opacity-50"
    style={{
      width: size,
      height: size,
      backgroundColor: '#CFFFE2',
      willChange: 'transform, opacity',
    }}
    initial={{ x: `${Math.random() * 100 - 50}vw`, y: '100vh', opacity: 0.5 }}
    animate={{
      x: [`${Math.random() * 100 - 50}vw`, `${Math.random() * 100 - 50 + (Math.random() * 20 - 10)}vw`],
      y: '-10vh',
      opacity: [0.5, 0.7, 0],
    }}
    transition={{
      duration: 8 + Math.random() * 4,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'easeOut',
      delay: delay,
    }}
    whileHover={{ scale: 1.3, opacity: 0.8 }}
  />
);

const UserDetailsForm = () => {
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [selectedClubs, setSelectedClubs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [progress, setProgress] = useState(25);
  const [completedSteps, setCompletedSteps] = useState([]);
  const navigate = useNavigate();

  const courses = ['BTech', 'BCA', 'BBA', 'MBA'];
  const clubs = [
    { name: 'Technitude', icon: '💻', description: 'Tech enthusiasts unite' },
    { name: 'Kalakriti', icon: '🎨', description: 'Art and creativity' },
    { name: 'Sahitya', icon: '📚', description: 'Literature society' },
    { name: 'Rhythm', icon: '🎵', description: 'Music and dance' },
    { name: 'Entrepreneurship', icon: '🚀', description: 'Business minds' },
  ];

  useEffect(() => {
    setProgress((currentQuestion / 4) * 100);
    if (currentQuestion > 1 && !completedSteps.includes(currentQuestion - 1)) {
      setCompletedSteps(prev => [...prev, currentQuestion - 1]);
    }
  }, [currentQuestion]);

  useEffect(() => {
    const createRipple = (e) => {
      const ripple = document.createElement('div');
      const size = 60;
      const pos = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - pos.left - size / 2;
      const y = e.clientY - pos.top - size / 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.className = 'ripple-effect';
      ripple.style.background = 'rgba(69, 104, 130, 0.3)'; // Teal-based ripple

      e.currentTarget.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    };

    const buttons = document.querySelectorAll('.ripple-btn');
    buttons.forEach(btn => btn.addEventListener('click', createRipple));

    return () => {
      buttons.forEach(btn => btn.removeEventListener('click', createRipple));
    };
  }, [currentQuestion]);

  const questionVariants = {
    initial: { opacity: 0, x: 100, scale: 0.8 },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      x: -100,
      scale: 0.8,
      transition: { duration: 0.4, ease: 'easeInOut' },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
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
    setCurrentQuestion(prev => prev + 1);
  };

  const handlePrevQuestion = () => {
    setError('');
    setCurrentQuestion(prev => prev - 1);
  };

  const handleClubSelection = (club) => {
    setSelectedClubs(prev =>
      prev.includes(club) ? prev.filter(c => c !== club) : [...prev, club]
    );
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to submit details');
        setLoading(false);
        navigate('/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.post(
        'http://localhost:5000/api/auth/user-details',
        {
          semester,
          course,
          specialization,
          isClubMember: selectedClubs.length > 0,
          clubName: selectedClubs,
        },
        config
      );

      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to submit details');
    }
  };

  const handleSkipToClubs = () => {
    setError('');
    navigate('/clubs');
  };

  const getStepIcon = (step) => {
    const icons = [FaUser, FaGraduationCap, FaCog, FaUsers];
    const Icon = icons[step - 1];
    return <Icon className="text-lg" />;
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
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-full mb-4" style={{ backgroundColor: '#456882' }}>
                <FaUser className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">What's your semester?</h3>
              <p className="text-gray-600">Help us understand your academic level</p>
            </motion.div>

            <motion.div variants={itemVariants} className="relative">
              <div className="relative">
                <input
                  type="number"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="Enter semester (1-8)"
                  className="w-full px-6 py-4 text-lg border-0 border-b-3 border-gray-300 bg-transparent focus:border-teal-600 focus:outline-none transition-all duration-300 text-center font-semibold"
                  min="1"
                  max="8"
                  style={{ borderBottomColor: '#456882' }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-teal-600"
                  initial={{ width: 0 }}
                  animate={{ width: semester ? '100%' : '0%' }}
                  transition={{ duration: 0.3 }}
                  style={{ backgroundColor: '#456882' }}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextQuestion}
                className="ripple-btn relative overflow-hidden px-8 py-3 bg-teal-600 text-white rounded-full font-semibold flex items-center gap-2 transition-all duration-300"
                style={{ backgroundColor: '#456882' }}
              >
                Next <FaArrowRight />
              </motion.button>
            </motion.div>
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
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-full mb-4" style={{ backgroundColor: '#456882' }}>
                <FaGraduationCap className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Select your course</h3>
              <p className="text-gray-600">What are you studying?</p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map((courseOption, index) => (
                <motion.button
                  key={courseOption}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCourse(courseOption)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    course === courseOption
                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                      : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                  }`}
                  style={{ borderColor: course === courseOption ? '#456882' : '#d1d5db' }}
                >
                  <div className="text-lg font-semibold">{courseOption}</div>
                  {course === courseOption && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-2"
                    >
                      <FaCheck className="text-teal-600 mx-auto" style={{ color: '#456882' }} />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevQuestion}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-full font-semibold flex items-center gap-2 hover:bg-gray-50 transition-all"
              >
                <FaArrowLeft /> Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextQuestion}
                className="ripple-btn relative overflow-hidden px-8 py-3 bg-teal-600 text-white rounded-full font-semibold flex items-center gap-2"
                style={{ backgroundColor: '#456882' }}
              >
                Next <FaArrowRight />
              </motion.button>
            </motion.div>
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
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-full mb-4" style={{ backgroundColor: '#456882' }}>
                <FaCog className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Your specialization?</h3>
              <p className="text-gray-600">What's your field of study?</p>
            </motion.div>

            <motion.div variants={itemVariants} className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g., Computer Science, Mechanical Engineering"
                  className="w-full px-6 py-4 text-lg border-0 border-b-3 border-gray-300 bg-transparent focus:border-teal-600 focus:outline-none transition-all duration-300 text-center"
                  style={{ borderBottomColor: '#456882' }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-teal-600"
                  initial={{ width: 0 }}
                  animate={{ width: specialization ? '100%' : '0%' }}
                  transition={{ duration: 0.3 }}
                  style={{ backgroundColor: '#456882' }}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevQuestion}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-full font-semibold flex items-center gap-2 hover:bg-gray-50 transition-all"
              >
                <FaArrowLeft /> Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextQuestion}
                className="ripple-btn relative overflow-hidden px-8 py-3 bg-teal-600 text-white rounded-full font-semibold flex items-center gap-2"
                style={{ backgroundColor: '#456882' }}
              >
                Next <FaArrowRight />
              </motion.button>
            </motion.div>
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
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-full mb-4" style={{ backgroundColor: '#456882' }}>
                <FaUsers className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Join clubs that interest you</h3>
              <p className="text-gray-600">You can select multiple clubs</p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {clubs.map((club, index) => (
                <motion.div
                  key={club.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedClubs.includes(club.name)
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleClubSelection(club.name)}
                  style={{ borderColor: selectedClubs.includes(club.name) ? '#456882' : '#d1d5db' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{club.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-800">{club.name}</div>
                        <div className="text-sm text-gray-600">{club.description}</div>
                      </div>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: selectedClubs.includes(club.name) ? 1 : 0 }}
                      className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#456882' }}
                    >
                      <FaCheck className="text-white text-xs" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevQuestion}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-full font-semibold flex items-center gap-2 hover:bg-gray-50 transition-all"
              >
                <FaArrowLeft /> Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={loading}
                className="ripple-btn relative overflow-hidden px-8 py-3 bg-teal-600 text-white rounded-full font-semibold flex items-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: '#456882' }}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    Complete <FaRocket />
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-50 flex items-center justify-center p-4 relative overflow-hidden font-[Poppins]">
      <FloatingBubble delay={0} size="20px" />
      <FloatingBubble delay={2} size="15px" />
      <FloatingBubble delay={4} size="25px" />

      <style jsx>{`
        .ripple-effect {
          position: absolute;
          border-radius: 50%;
          background: rgba(69, 104, 130, 0.3);
          transform: scale(0);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        }

        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }

        .border-b-3 {
          border-bottom-width: 3px;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-2xl"
      >
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Complete Your Profile</h1>
          <div className="relative w-full h-2 bg-gray-200 rounded-full mb-6">
            <motion.div
              className="absolute top-0 left-0 h-full bg-teal-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ backgroundColor: '#456882' }}
            />
          </div>
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((step) => (
              <motion.div
                key={step}
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  step === currentQuestion
                    ? 'border-teal-600 bg-teal-600 text-white'
                    : completedSteps.includes(step)
                    ? 'border-teal-600 bg-teal-600 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}
                whileHover={{ scale: 1.1 }}
                style={{ borderColor: step === currentQuestion || completedSteps.includes(step) ? '#456882' : '#d1d5db' }}
              >
                {completedSteps.includes(step) ? (
                  <FaCheck />
                ) : (
                  getStepIcon(step)
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg"
                style={{ borderColor: '#456882' }}
              >
                <p className="text-teal-600 text-center font-medium" style={{ color: '#456882' }}>{error}</p>
              </motion.div>
            )}
            {renderQuestion()}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSkipToClubs}
            className="text-gray-500 hover:text-teal-600 transition-colors font-medium"
            style={{ color: '#456882' }}
          >
            Skip to Clubs →
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserDetailsForm;