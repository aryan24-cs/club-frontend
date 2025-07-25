import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUsers } from 'react-icons/fa';

// Floating Bubble Component (Fragrance-like animation)
const Bubble = ({ size, delay }) => {
  const randomXOffset = Math.random() * 100 - 50; // Random horizontal sway (-50 to 50px)

  return (
    <motion.div
      className="absolute rounded-full bg-mint opacity-50"
      style={{
        width: size,
        height: size,
        backgroundColor: '#CFFFE2',
        willChange: 'transform, opacity',
      }}
      initial={{ x: `${randomXOffset}vw`, y: '100vh', opacity: 0.5 }}
      animate={{
        x: [`${randomXOffset}vw`, `${randomXOffset + (Math.random() * 20 - 10)}vw`], // Slight horizontal sway
        y: '-10vh', // Move to top
        opacity: [0.5, 0.7, 0], // Fade in, then out
      }}
      transition={{
        duration: 8 + Math.random() * 4, // Random duration (8-12s)
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeOut',
        delay: delay,
      }}
      whileHover={{ scale: 1.3, opacity: 0.8 }}
    />
  );
};

// OTP Input Component
const OtpInput = ({ otp, setOtp, otpFocused, setOtpFocused }) => {
  const inputRefs = useRef([]);
  const OTP_LENGTH = 6;

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = otp.split('');
    newOtp[index] = value;
    setOtp(newOtp.join(''));
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData('text').slice(0, OTP_LENGTH);
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData);
      inputRefs.current[OTP_LENGTH - 1].focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array(OTP_LENGTH)
        .fill()
        .map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength={1}
            value={otp[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setOtpFocused(index)}
            onBlur={() => setOtpFocused(null)}
            className={`w-12 h-12 text-center text-lg border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all duration-300 ${
              otpFocused === index ? 'border-teal-600' : 'border-gray-300'
            }`}
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
    </div>
  );
};

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigate = useNavigate();

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 200], [0, -50]); // Parallax effect

  const handleSendOtp = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!name) {
      setError('Please enter your name');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/send-otp', { email });
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Try again.');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp || !/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
      setOtpVerified(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Try again.');
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', {
        name,
        email,
        password,
      });
      localStorage.setItem('token', res.data.token);
      navigate('/user-details');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Try again.');
    }
    setLoading(false);
  };

  const labelVariants = {
    resting: { y: 12, fontSize: '1rem', color: '#4B5563' },
    floating: { y: -12, fontSize: '0.75rem', color: '#456882' },
  };

  // Progress steps
  const steps = ['Enter Details', 'Verify OTP', 'Set Password'];
  const currentStep = !otpSent ? 0 : !otpVerified ? 1 : 2;

  // Bubbles
  const bubbles = Array.from({ length: 8 }, (_, i) => ({
    size: `${15 + Math.random() * 20}px`, // Random size between 15-35px
    delay: i * 0.5, // Staggered delays
  }));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative overflow-hidden font-[Poppins]">
      {/* Background and Bubbles */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: bgY }}
      >
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-100 via-white to-blue-100"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-teal-600/30 to-transparent"></div>
          {bubbles.map((bubble, index) => (
            <Bubble key={index} size={bubble.size} delay={bubble.delay} />
          ))}
        </div>
      </motion.div>

      {/* Signup Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-6 sm:p-8 bg-white rounded-xl shadow-2xl relative z-10"
      >
        {/* Club Icon */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhlQcHePKIv2tzDNPalbDjniC7_AmmGT9Y0A&s"
            alt="Club Icon"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
            aria-hidden="true"
          />
        </motion.div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-teal-600 text-center mb-6" style={{ color: '#456882' }}>
          Join ACEM Clubs
        </h2>

        {/* Progress Indicator */}
        <div className="flex justify-between mb-6">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                  index <= currentStep ? 'bg-teal-600' : 'bg-gray-300'
                }`}
                style={{ backgroundColor: index <= currentStep ? '#456882' : '#D1D5DB' }}
                animate={{ scale: index === currentStep ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {index + 1}
              </motion.div>
              <span className="text-xs text-gray-700 mt-2">{step}</span>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          {!otpSent ? (
            <>
              <div className="relative">
                <motion.label
                  className="absolute left-4 top-3 text-gray-700 font-medium pointer-events-none"
                  animate={nameFocused || name ? 'floating' : 'resting'}
                  variants={labelVariants}
                  transition={{ duration: 0.2 }}
                >
                  Full Name
                </motion.label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600 transition-all duration-300"
                  aria-label="Full Name"
                />
              </div>
              <div className="relative">
                <motion.label
                  className="absolute left-4 top-3 text-gray-700 font-medium pointer-events-none"
                  animate={emailFocused || email ? 'floating' : 'resting'}
                  variants={labelVariants}
                  transition={{ duration: 0.2 }}
                >
                  Email Address
                </motion.label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600 transition-all duration-300"
                  aria-label="Email Address"
                />
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-600 text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full px-4 py-3 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                style={{ backgroundColor: '#456882' }}
                aria-label="Send OTP"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send OTP'
                )}
              </motion.button>
            </>
          ) : !otpVerified ? (
            <>
              <div className="relative">
                <motion.label
                  className="text-gray-700 font-medium text-center block mb-2"
                  animate={otpFocused !== null || otp ? 'floating' : 'resting'}
                  variants={labelVariants}
                  transition={{ duration: 0.2 }}
                >
                  Enter OTP
                </motion.label>
                <OtpInput otp={otp} setOtp={setOtp} otpFocused={otpFocused} setOtpFocused={setOtpFocused} />
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-600 text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full px-4 py-3 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                style={{ backgroundColor: '#456882' }}
                aria-label="Verify OTP"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </motion.button>
            </>
          ) : (
            <>
              <div className="relative">
                <motion.label
                  className="absolute left-4 top-3 text-gray-700 font-medium pointer-events-none"
                  animate={passwordFocused || password ? 'floating' : 'resting'}
                  variants={labelVariants}
                  transition={{ duration: 0.2 }}
                >
                  Create Password
                </motion.label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600 transition-all duration-300"
                  aria-label="Create Password"
                />
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-600 text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignup}
                disabled={loading}
                className="w-full px-4 py-3 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                style={{ backgroundColor: '#456882' }}
                aria-label="Complete Signup"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Signing Up...
                  </>
                ) : (
                  'Complete Signup'
                )}
              </motion.button>
            </>
          )}
          <p className="text-center text-gray-700">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 hover:underline font-medium" style={{ color: '#456882' }}>
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;