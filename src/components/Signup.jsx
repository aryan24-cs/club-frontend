import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const OtpInput = ({ otp, setOtp, otpFocused, setOtpFocused }) => {
  const inputRefs = useRef([]);
  const OTP_LENGTH = 6;

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join(""));
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData("text").slice(0, OTP_LENGTH);
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
            value={otp[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setOtpFocused(index)}
            onBlur={() => setOtpFocused(null)}
            className={`w-10 h-10 text-center text-lg border-2 rounded-md focus:outline-none transition ${
              otpFocused === index ? "border-red-600" : "border-gray-300"
            }`}
          />
        ))}
    </div>
  );
};

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState(""); // Added mobile state
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [mobileFocused, setMobileFocused] = useState(false); // Added mobile focus state
  const [otpFocused, setOtpFocused] = useState(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!name) {
      setError("Please enter your name");
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/send-otp", { email });
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP. Try again.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp || !/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email,
        otp,
      });
      setOtpVerified(true);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP. Try again.");
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", {
        name,
        email,
        mobile, // Include mobile in the signup payload
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Try again.");
    }
    setLoading(false);
  };

  const labelVariants = {
    resting: { y: 12, fontSize: "1rem", color: "#4B5563" },
    floating: { y: -12, fontSize: "0.75rem", color: "#DC143C" },
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl"
      >
        <h2 className="text-3xl font-bold text-red-600 text-center mb-8">
          Signup
        </h2>
        <div className="space-y-6">
          {!otpSent ? (
            <>
              <div className="relative">
                <motion.label
                  className="absolute left-4 top-3 text-gray-700 font-medium pointer-events-none"
                  animate={nameFocused || name ? "floating" : "resting"}
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
                  animate={emailFocused || email ? "floating" : "resting"}
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
                  className="w-full px-4 py-3 border-b-2 border-red-600 text-gray-900 bg-transparent focus:outline-none focus:border-red-700 transition"
                />
              </div>
              <div className="relative">
                <motion.label
                  className="absolute left-4 top-3 text-gray-700 font-medium pointer-events-none"
                  animate={mobileFocused || mobile ? "floating" : "resting"}
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
                  // placeholder="Enter 10-digit mobile number"
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
                {loading ? "Sending..." : "Send OTP"}
              </motion.button>
            </>
          ) : !otpVerified ? (
            <>
              <div className="relative">
                <motion.label
                  className="text-gray-700 font-medium text-center block mb-2"
                  animate={otpFocused !== null || otp ? "floating" : "resting"}
                  variants={labelVariants}
                  transition={{ duration: 0.2 }}
                >
                  Enter OTP
                </motion.label>
                <OtpInput
                  otp={otp}
                  setOtp={setOtp}
                  otpFocused={otpFocused}
                  setOtpFocused={setOtpFocused}
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
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </motion.button>
            </>
          ) : (
            <>
              <div className="relative">
                <motion.label
                  className="absolute left-4 top-3 text-gray-700 font-medium pointer-events-none"
                  animate={passwordFocused || password ? "floating" : "resting"}
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
                onClick={handleSignup}
                disabled={loading}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading ? "Signing Up..." : "Complete Signup"}
              </motion.button>
            </>
          )}
          <p className="text-center text-gray-700">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-red-600 hover:underline font-medium"
            >
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
