import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setError('Failed to send OTP. Try again.');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter the OTP');
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
      setError('Invalid OTP. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg"
      >
        <h2 className="text-3xl font-bold text-red-600 text-center mb-6">Signup</h2>
        <div className="space-y-6">
          {!otpSent ? (
            <>
              <div>
                <label className="block text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 border border-red-600 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Mobile Number</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-4 py-2 border border-red-600 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </motion.button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-gray-700 mb-2">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-2 border border-red-600 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </motion.button>
            </>
          )}
          <p className="text-center text-gray-700">
            Already have an account?{' '}
            <Link to="/login" className="text-red-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;