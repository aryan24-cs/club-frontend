import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [mobileFocused, setMobileFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!name) {
      setError('Please enter your name');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/send-otp', { mobile });
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
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp-signup', {
        name,
        mobile,
        otp,
      });
      alert('Signup successful! Token: ' + res.data.token);
      // Redirect to login or dashboard
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Try again.');
    }
    setLoading(false);
  };

  // Label animation variants
  const labelVariants = {
    resting: { y: 12, fontSize: '1rem', color: '#4B5563' }, // gray-700
    floating: { y: -12, fontSize: '0.75rem', color: '#DC143C' }, // red-600
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl"
      >
        <h2 className="text-3xl font-bold text-red-600 text-center mb-8">Signup</h2>
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
                  className="w-full px-4 py-3 border-b-2 border-red-600 text-gray-900 bg-transparent focus:outline-none focus:border-red-700 transition"
                />
              </div>
              <div className="relative">
                <motion.label
                  className="absolute left-4 top-3 text-gray-700 font-medium pointer-events-none"
                  animate={mobileFocused || mobile ? 'floating' : 'resting'}
                  variants={labelVariants}
                  transition={{ duration: 0.2 }}
                >
                  Mobile Number
                </motion.label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  onFocus={() => setMobileFocused(true)}
                  onBlur={() => setMobileFocused(false)}
                  className="w-full px-4 py-3 border-b-2 border-red-600 text-gray-900 bg-transparent focus:outline-none focus:border-red-700 transition"
                />
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-600 text-sm"
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
                className="w-full px-4 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </motion.button>
            </>
          ) : (
            <>
              <div className="relative">
                <motion.label
                  className="absolute left-4 top-3 text-gray-700 font-medium pointer-events-none"
                  animate={otpFocused || otp ? 'floating' : 'resting'}
                  variants={labelVariants}
                  transition={{ duration: 0.2 }}
                >
                  Enter OTP
                </motion.label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  onFocus={() => setOtpFocused(true)}
                  onBlur={() => setOtpFocused(false)}
                  className="w-full px-4 py-3 border-b-2 border-red-600 text-gray-900 bg-transparent focus:outline-none focus:border-red-700 transition"
                />
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-600 text-sm"
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
                className="w-full px-4 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </motion.button>
            </>
          )}
          <p className="text-center text-gray-700">
            Already have an account?{' '}
            <Link to="/login" className="text-red-600 hover:underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
export default Signup;