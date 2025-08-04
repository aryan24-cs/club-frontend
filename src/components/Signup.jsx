import React, { useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUsers,
  FaEnvelope,
  FaLock,
  FaSpinner,
  FaCheckCircle,
  FaArrowLeft,
  FaUniversity,
} from "react-icons/fa";

// Floating Particle Component
const FloatingParticle = ({ delay, duration }) => {
  return (
    <motion.div
      className="absolute w-2 h-2 bg-[#456882] rounded-full opacity-20"
      initial={{
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 20,
        opacity: 0,
      }}
      animate={{
        x: Math.random() * window.innerWidth,
        y: -20,
        opacity: [0, 0.6, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "linear",
      }}
    />
  );
};

// Animated Background Grid
const AnimatedGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-10">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#456882"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};

// OTP Input Component
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
    <div className="flex gap-3 justify-center">
      {Array(OTP_LENGTH)
        .fill()
        .map((_, index) => (
          <motion.input
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
            whileFocus={{ scale: 1.05 }}
            whileHover={{ scale: 1.02 }}
            className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#456882]/50 transition-all duration-300 bg-white/80 backdrop-blur-sm ${
              otpFocused === index
                ? "border-[#456882] shadow-lg bg-white"
                : otp[index]
                ? "border-green-500 bg-green-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
    </div>
  );
};

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [isACEMStudent, setIsACEMStudent] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [collegeFocused, setCollegeFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigate = useNavigate();

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 500], [0, -50]);
  const smoothY = useSpring(bgY, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const handleSendOtp = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!name) {
      setError("Please enter your name");
      return;
    }
    if (!isACEMStudent && !collegeName) {
      setError("Please enter your college name");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await axios.post("https://club-manager-chi.vercel.app/api/auth/send-otp", { email });
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
      await axios.post("https://club-manager-chi.vercel.app/api/auth/verify-otp", {
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
      const res = await axios.post("https://club-manager-chi.vercel.app/api/auth/signup", {
        name,
        email,
        password,
        isACEMStudent,
        collegeName: isACEMStudent ? "" : collegeName, // Send empty string for ACEM students
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("isACEMStudent", JSON.stringify(isACEMStudent));
      localStorage.setItem("collegeName", collegeName);
      navigate("/user-details");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Signup failed. Please try again or contact support."
      );
    }
    setLoading(false);
  };

  const labelVariants = {
    resting: { y: 0, scale: 1, color: "#6B7280" },
    floating: { y: -24, scale: 0.85, color: "#456882" },
  };

  const steps = ["Enter Details", "Verify OTP", "Set Password"];
  const currentStep = !otpSent ? 0 : !otpVerified ? 1 : 2;

  const particles = Array.from({ length: 12 }, (_, i) => ({
    delay: i * 1.5,
    duration: 12 + Math.random() * 8,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center relative overflow-hidden font-sans">
      {/* Floating Particles */}
      {particles.map((particle, index) => (
        <FloatingParticle key={index} {...particle} />
      ))}

      {/* Animated Background Elements */}
      <motion.div
        style={{ y: smoothY }}
        className="absolute inset-0 overflow-hidden"
      >
        <AnimatedGrid />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 right-20 w-32 h-32 bg-[#456882] opacity-5 rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 left-20 w-24 h-24 bg-[#456882] opacity-5 rounded-full"
        />
      </motion.div>

      {/* Back to Home Button */}
      <motion.button
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        whileHover={{ scale: 1.02, x: 5 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 z-20 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#456882]/20 text-[#456882] hover:bg-white/90 transition-all duration-300 shadow-lg"
      >
        <FaArrowLeft />
        <span className="font-medium">Back to Home</span>
      </motion.button>

      {/* Main Signup Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="w-full max-w-md mx-4 relative z-10"
      >
        {/* Glass Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#456882] to-[#5a7a95]"></div>

          {/* Club Logo */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="relative"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#456882] to-[#5a7a95] rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl">
                <FaUsers />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <FaCheckCircle className="text-white text-xs" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-[#456882] mb-2">
              Join ACEM Clubs
            </h2>
            <p className="text-gray-600">
              Create your account to join our vibrant community
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex justify-between mb-8 relative"
          >
            <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 rounded-full">
              <motion.div
                className="h-full bg-gradient-to-r from-[#456882] to-[#5a7a95] rounded-full"
                initial={{ width: "0%" }}
                animate={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center relative z-10"
              >
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold relative ${
                    index <= currentStep ? "bg-[#456882]" : "bg-gray-300"
                  }`}
                  animate={{
                    scale: index === currentStep ? 1.1 : 1,
                    boxShadow:
                      index === currentStep
                        ? "0 4px 15px rgba(69, 104, 130, 0.3)"
                        : "none",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {index < currentStep ? (
                    <FaCheckCircle className="text-sm" />
                  ) : (
                    index + 1
                  )}
                  {index === currentStep && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[#456882]"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                <span className="text-xs text-gray-600 mt-2 font-medium">
                  {step}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Form Content */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {!otpSent ? (
                <motion.div
                  key="details-form"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Name Input */}
                  <div className="relative">
                    <motion.div
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      animate={{
                        color: nameFocused || name ? "#456882" : "#9CA3AF",
                      }}
                    >
                      <FaUsers />
                    </motion.div>
                    <motion.label
                      className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium pointer-events-none transition-all duration-300"
                      animate={nameFocused || name ? "floating" : "resting"}
                      variants={labelVariants}
                    >
                      Full Name
                    </motion.label>
                    <motion.input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                      whileFocus={{ scale: 1.02 }}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 bg-gray-50/50 focus:outline-none focus:border-[#456882] focus:ring-2 focus:ring-[#456882]/20 transition-all duration-300"
                      aria-label="Full Name"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="relative">
                    <motion.div
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      animate={{
                        color: emailFocused || email ? "#456882" : "#9CA3AF",
                      }}
                    >
                      <FaEnvelope />
                    </motion.div>
                    <motion.label
                      className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium pointer-events-none transition-all duration-300"
                      animate={emailFocused || email ? "floating" : "resting"}
                      variants={labelVariants}
                    >
                      Email Address
                    </motion.label>
                    <motion.input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      whileFocus={{ scale: 1.02 }}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 bg-gray-50/50 focus:outline-none focus:border-[#456882] focus:ring-2 focus:ring-[#456882]/20 transition-all duration-300"
                      aria-label="Email Address"
                    />
                  </div>

                  {/* College Name Input (for non-ACEM students) */}
                  {!isACEMStudent && (
                    <div className="relative">
                      <motion.div
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                        animate={{
                          color:
                            collegeFocused || collegeName
                              ? "#456882"
                              : "#9CA3AF",
                        }}
                      >
                        <FaUniversity />
                      </motion.div>
                      <motion.label
                        className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium pointer-events-none transition-all duration-300"
                        animate={
                          collegeFocused || collegeName ? "floating" : "resting"
                        }
                        variants={labelVariants}
                      >
                        College Name
                      </motion.label>
                      <motion.input
                        type="text"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        onFocus={() => setCollegeFocused(true)}
                        onBlur={() => setCollegeFocused(false)}
                        whileFocus={{ scale: 1.02 }}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 bg-gray-50/50 focus:outline-none focus:border-[#456882] focus:ring-2 focus:ring-[#456882]/20 transition-all duration-300"
                        aria-label="College Name"
                      />
                    </div>
                  )}

                  {/* ACEM Student Checkbox */}
                  <div className="relative flex items-center">
                    <motion.input
                      type="checkbox"
                      checked={isACEMStudent}
                      onChange={(e) => {
                        setIsACEMStudent(e.target.checked);
                        if (e.target.checked) setCollegeName(""); // Clear college name if ACEM student
                      }}
                      className="h-5 w-5 text-[#456882] border-gray-300 rounded focus:ring-[#456882]/50"
                      aria-label="ACEM Student Status"
                    />
                    <motion.label
                      className="ml-2 text-gray-600 font-medium"
                      animate={{ color: isACEMStudent ? "#456882" : "#6B7280" }}
                      transition={{ duration: 0.2 }}
                    >
                      I am an ACEM student
                    </motion.label>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <p className="text-red-600 text-sm font-medium text-center">
                          {error}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Send OTP Button */}
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 25px rgba(69, 104, 130, 0.2)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center relative overflow-hidden"
                    aria-label="Send OTP"
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.8 }}
                    />
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="flex items-center gap-2"
                        >
                          <FaSpinner />
                        </motion.div>
                        <div>Sending...</div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FaEnvelope />
                        Send OTP
                      </div>
                    )}
                  </motion.button>
                </motion.div>
              ) : !otpVerified ? (
                <motion.div
                  key="otp-form"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-2xl mb-4"
                    >
                      <FaEnvelope />
                    </motion.div>
                    <p className="text-gray-600">We've sent a 6-digit OTP to</p>
                    <p className="font-semibold text-[#456882]">{email}</p>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-center text-gray-700 font-medium text-sm">
                      Enter Verification Code
                    </label>
                    <OtpInput
                      otp={otp}
                      setOtp={setOtp}
                      otpFocused={otpFocused}
                      setOtpFocused={setOtpFocused}
                    />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <p className="text-red-600 text-sm font-medium text-center">
                          {error}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 25px rgba(69, 104, 130, 0.2)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center relative overflow-hidden"
                    aria-label="Verify OTP"
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.8 }}
                    />
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="flex items-center gap-2"
                        >
                          <FaSpinner />
                        </motion.div>
                        Verifying...
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FaCheckCircle />
                        Verify OTP
                      </div>
                    )}
                  </motion.button>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="text-center"
                  >
                    <button
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-[#456882] hover:text-[#5a7a95] font-medium hover:underline transition-all duration-300 disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="password-form"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="relative">
                    <motion.div
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      animate={{
                        color:
                          passwordFocused || password ? "#456882" : "#9CA3AF",
                      }}
                    >
                      <FaLock />
                    </motion.div>
                    <motion.label
                      className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium pointer-events-none transition-all duration-300"
                      animate={
                        passwordFocused || password ? "floating" : "resting"
                      }
                      variants={labelVariants}
                    >
                      Create Password
                    </motion.label>
                    <motion.input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      whileFocus={{ scale: 1.02 }}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 bg-gray-50/50 focus:outline-none focus:border-[#456882] focus:ring-2 focus:ring-[#456882]/20 transition-all duration-300"
                      aria-label="Create Password"
                    />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <p className="text-red-600 text-sm font-medium text-center">
                          {error}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 25px rgba(69, 104, 130, 0.2)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSignup}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center relative overflow-hidden"
                    aria-label="Complete Signup"
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.8 }}
                    />
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="flex items-center gap-2"
                        >
                          <FaSpinner />
                        </motion.div>
                        Signing Up...
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FaUsers />
                        Complete Signup
                      </div>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center pt-6 border-t border-gray-200"
            >
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#456882] hover:text-[#5a7a95] font-semibold hover:underline transition-all duration-300"
                >
                  Login
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
