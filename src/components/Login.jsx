import React, { useState, useRef, useEffect } from "react";
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
  FaGraduationCap,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaShieldAlt,
  FaArrowLeft,
  FaCheckCircle,
  FaLock,
  FaEnvelope,
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

// OTP Input Component
const OtpInput = ({ otp, setOtp, otpFocused, setOtpFocused }) => {
  const inputRefs = useRef([]);
  const OTP_LENGTH = 6;

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join("").trim());
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
    const pastedData = e.clipboardData
      .getData("text")
      .slice(0, OTP_LENGTH)
      .replace(/\D/g, "")
      .trim();
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
                ? "border-[#456882] shadowing bg-white"
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [useOtp, setUseOtp] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false); // Fixed typo
  const [resetEmailFocused, setResetEmailFocused] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(null);
  const [resetOtpFocused, setResetOtpFocused] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const navigate = useNavigate();

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 500], [0, -50]);
  const smoothY = useSpring(bgY, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const particles = Array.from({ length: 12 }, (_, i) => ({
    delay: i * 1.5,
    duration: 12 + Math.random() * 8,
  }));

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setError("");
    setLoading(true);
    try {
      console.log("Sending OTP to:", trimmedEmail);
      await axios.post("http://localhost:5000/api/auth/send-otp", {
        email: trimmedEmail,
      });
      setOtpSent(true);
      setSuccess("OTP sent to your email.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Send OTP error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.error || "Failed to send OTP. Try again.");
      setTimeout(() => setError(""), 3000);
    }
    setLoading(false);
  };

  const handlePasswordLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (!password) {
      setError("Please enter a password");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setError("");
    setLoading(true);
    try {
      console.log("Attempting password login for:", trimmedEmail);
      const res = await axios.post(
        "http://localhost:5000/api/auth/login-password",
        { email: trimmedEmail, password }
      );
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Password login error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.error || "Invalid credentials. Try again.");
      setTimeout(() => setError(""), 3000);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    const trimmedOtp = otp.trim();
    if (!trimmedOtp || !/^\d{6}$/.test(trimmedOtp)) {
      setError("Please enter a valid 6-digit OTP");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setError("");
    setLoading(true);
    try {
      console.log("Verifying OTP for:", { email, otp: trimmedOtp });
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-otp-login",
        { email: email.trim().toLowerCase(), otp: trimmedOtp }
      );
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Verify OTP error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.error || "Invalid OTP. Try again.");
      setTimeout(() => setError(""), 3000);
    }
    setLoading(false);
  };

  const handleResetPasswordRequest = async () => {
    const trimmedEmail = resetEmail.trim().toLowerCase();
    if (resendCooldown > 0) {
      setError("Please wait before requesting a new OTP");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      console.log("Requesting password reset OTP for:", trimmedEmail);
      await axios.post(
        "http://localhost:5000/api/auth/reset-password-otp-request",
        { email: trimmedEmail }
      );
      setResetOtpSent(true);
      setSuccess("OTP sent to your email for password reset.");
      setResendCooldown(60);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Reset password OTP request error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.error || "Failed to send OTP. Try again.");
      setTimeout(() => setError(""), 3000);
    }
    setLoading(false);
  };

  const handleVerifyResetOtp = async () => {
    const trimmedOtp = resetOtp.trim();
    const trimmedEmail = resetEmail.trim().toLowerCase();
    if (!trimmedOtp || !/^\d{6}$/.test(trimmedOtp)) {
      setError("Please enter a valid 6-digit OTP");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      console.log("Verifying reset OTP for:", {
        email: trimmedEmail,
        otp: trimmedOtp,
      });
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-reset-otp",
        { email: trimmedEmail, otp: trimmedOtp },
        { headers: { "Content-Type": "application/json" } }
      );
      setShowNewPasswordForm(true);
      setSuccess("OTP verified successfully. Please enter your new password.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Verify reset OTP error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(
        err.response?.data?.error === "Invalid OTP"
          ? "The OTP entered is incorrect. Please check and try again."
          : err.response?.data?.error === "Expired OTP"
          ? "The OTP has expired. Please request a new one."
          : err.response?.data?.error === "No OTP requested or OTP expired"
          ? "No OTP found. Please request a new OTP."
          : err.response?.data?.error || "Failed to verify OTP. Try again."
      );
      setTimeout(() => setError(""), 3000);
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    const trimmedEmail = resetEmail.trim().toLowerCase();
    const trimmedOtp = resetOtp.trim();
    if (!trimmedEmail || !trimmedOtp || !newPassword) {
      setError("Email, OTP, and new password are required");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (!/^\d{6}$/.test(trimmedOtp)) {
      setError("Please enter a valid 6-digit OTP");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      console.log("Resetting password for:", {
        email: trimmedEmail,
        otp: trimmedOtp,
        newPassword: "[provided]",
      });
      await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        { email: trimmedEmail, otp: trimmedOtp, newPassword },
        { headers: { "Content-Type": "application/json" } }
      );
      setSuccess("Password reset successfully. Please log in.");
      setTimeout(() => setSuccess(""), 3000);
      setShowResetForm(false);
      setShowNewPasswordForm(false);
      setResetOtpSent(false);
      setResetEmail("");
      setResetOtp("");
      setNewPassword("");
    } catch (err) {
      console.error("Reset password error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(
        err.response?.data?.error === "Invalid OTP"
          ? "The OTP entered is incorrect. Please check and try again."
          : err.response?.data?.error === "Expired OTP"
          ? "The OTP has expired. Please request a new one."
          : err.response?.data?.error === "No OTP requested or OTP expired"
          ? "No OTP found. Please request a new OTP."
          : err.response?.data?.error === "User not found"
          ? "No account found for this email."
          : err.response?.data?.error || "Failed to reset password. Try again."
      );
      setTimeout(() => setError(""), 3000);
    }
    setLoading(false);
  };

  const handleToggleOtp = async () => {
    setUseOtp(!useOtp);
    setOtp("");
    setOtpSent(false);
    if (!useOtp && email) {
      await handleSendOtp();
    }
  };

  const labelVariants = {
    resting: { y: 0, scale: 1, color: "#6B7280" },
    floating: { y: -24, scale: 0.85, color: "#456882" },
  };

  const steps = ["Enter Email", "Verify OTP", "Login"];
  const resetSteps = ["Enter Email", "Verify OTP", "Set Password"];
  const currentStep = showResetForm
    ? showNewPasswordForm
      ? 2
      : resetOtpSent
      ? 1
      : 0
    : otpSent
    ? 1
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center relative overflow-hidden">
      {particles.map((particle, index) => (
        <FloatingParticle key={index} {...particle} />
      ))}

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

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="w-full max-w-md mx-4 relative z-10"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#456882] to-[#5a7a95]"></div>

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
                <FaGraduationCap />
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-[#456882] mb-2">
              {showResetForm ? "Reset Password" : "Welcome Back"}
            </h2>
            <p className="text-gray-600">
              {showResetForm
                ? "Reset your password to regain access"
                : "Sign in to access your club dashboard"}
            </p>
          </motion.div>

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
                  width: `${
                    ((currentStep + 1) /
                      (showResetForm ? resetSteps.length : steps.length)) *
                    100
                  }%`,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>

            {(showResetForm ? resetSteps : steps).map((step, index) => (
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

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {showResetForm ? (
                resetOtpSent ? (
                  showNewPasswordForm ? (
                    <motion.div
                      key="new-password-form"
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
                          className="w-16 h-16 mx-auto bg-gradient-to-br from-[#456882] to-[#5a7a95] rounded-full flex items-center justify-center text-white text-2xl mb-4"
                        >
                          <FaLock />
                        </motion.div>
                        <p className="text-gray-600">Enter your new password</p>
                      </div>

                      <div className="relative">
                        <motion.div
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                          animate={{
                            color:
                              newPasswordFocused || newPassword
                                ? "#456882"
                                : "#9CA3AF",
                          }}
                        >
                          <FaLock />
                        </motion.div>
                        <motion.label
                          className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium pointer-events-none transition-all duration-300"
                          animate={
                            newPasswordFocused || newPassword
                              ? "floating"
                              : "resting"
                          }
                          variants={labelVariants}
                        >
                          New Password
                        </motion.label>
                        <motion.input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) =>
                            setNewPassword(e.target.value.trim())
                          }
                          onFocus={() => setNewPasswordFocused(true)}
                          onBlur={() => setNewPasswordFocused(false)}
                          whileFocus={{ scale: 1.02 }}
                          className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl text-gray-900 bg-gray-50/50 focus:outline-none focus:border-[#456882] focus:ring-2 focus:ring-[#456882]/20 transition-all duration-300"
                          aria-label="New Password"
                        />
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#456882] transition-colors"
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </motion.button>
                      </div>

                      <AnimatePresence>
                        {success && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="p-3 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <p className="text-green-600 text-sm font-medium text-center">
                              {success}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

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
                        onClick={handleResetPassword}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center relative overflow-hidden"
                        aria-label="Reset Password"
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
                            Resetting...
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <FaLock />
                            Reset Password
                          </div>
                        )}
                      </motion.button>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="text-center"
                      >
                        <button
                          onClick={() => {
                            setShowResetForm(false);
                            setShowNewPasswordForm(false);
                            setResetOtpSent(false);
                            setResetEmail("");
                            setResetOtp("");
                            setNewPassword("");
                            setResendCooldown(0);
                          }}
                          className="text-[#456882] hover:text-[#5a7a95] font-medium hover:underline transition-all duration-300"
                        >
                          Back to Login
                        </button>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="reset-otp-form"
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
                        <p className="text-gray-600">
                          We've sent a 6-digit OTP to
                        </p>
                        <p className="font-semibold text-[#456882]">
                          {resetEmail}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-center text-gray-700 font-medium text-sm">
                          Enter Verification Code
                        </label>
                        <OtpInput
                          otp={resetOtp}
                          setOtp={setResetOtp}
                          otpFocused={resetOtpFocused}
                          setOtpFocused={setResetOtpFocused}
                        />
                      </div>

                      <AnimatePresence>
                        {success && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="p-3 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <p className="text-green-600 text-sm font-medium text-center">
                              {success}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

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
                        onClick={handleVerifyResetOtp}
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
                          onClick={handleResetPasswordRequest}
                          disabled={loading || resendCooldown > 0}
                          className="text-[#456882] hover:text-[#5a7a95] font-medium hover:underline transition-all duration-300 disabled:opacity-50"
                        >
                          {resendCooldown > 0
                            ? `Resend OTP in ${resendCooldown}s`
                            : "Resend OTP"}
                        </button>
                      </motion.div>
                    </motion.div>
                  )
                ) : (
                  <motion.div
                    key="reset-form"
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
                        className="w-16 h-16 mx-auto bg-gradient-to-br from-[#456882] to-[#5a7a95] rounded-full flex items-center justify-center text-white text-2xl mb-4"
                      >
                        <FaLock />
                      </motion.div>
                      <p className="text-gray-600">
                        Enter your email to receive a password reset OTP
                      </p>
                    </div>

                    <div className="relative">
                      <motion.div
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                        animate={{
                          color:
                            resetEmailFocused || resetEmail
                              ? "#456882"
                              : "#9CA3AF",
                        }}
                      >
                        <FaEnvelope />
                      </motion.div>
                      <motion.label
                        className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium pointer-events-none transition-all duration-300"
                        animate={
                          resetEmailFocused || resetEmail
                            ? "floating"
                            : "resting"
                        }
                        variants={labelVariants}
                      >
                        Email Address
                      </motion.label>
                      <motion.input
                        type="email"
                        value={resetEmail}
                        onChange={(e) =>
                          setResetEmail(e.target.value.trim().toLowerCase())
                        }
                        onFocus={() => setResetEmailFocused(true)}
                        onBlur={() => setResetEmailFocused(false)}
                        whileFocus={{ scale: 1.02 }}
                        disabled={resetOtpSent}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 bg-gray-50/50 focus:outline-none focus:border-[#456882] focus:ring-2 focus:ring-[#456882]/20 focus:bg-white transition-all duration-300"
                        aria-label="Reset Email Address"
                      />
                    </div>

                    <AnimatePresence>
                      {success && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <p className="text-green-600 text-sm font-medium text-center">
                            {success}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

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
                      onClick={handleResetPasswordRequest}
                      disabled={loading || resendCooldown > 0}
                      className="w-full py-4 bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center relative overflow-hidden"
                      aria-label="Send Reset OTP"
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
                          Sending...
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FaEnvelope />
                          Send OTP
                        </div>
                      )}
                    </motion.button>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="text-center"
                    >
                      <button
                        onClick={() => {
                          setShowResetForm(false);
                          setResetEmail("");
                          setResetOtp("");
                          setNewPassword("");
                          setResendCooldown(0);
                        }}
                        className="text-[#456882] hover:text-[#5a7a95] font-medium hover:underline transition-all duration-300"
                      >
                        Back to Login
                      </button>
                    </motion.div>
                  </motion.div>
                )
              ) : (
                <motion.div
                  key="email-form"
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
                      onChange={(e) =>
                        setEmail(e.target.value.trim().toLowerCase())
                      }
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      whileFocus={{ scale: 1.02 }}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 bg-gray-50/50 focus:outline-none focus:border-[#456882] focus:ring-2 focus:ring-[#456882]/20 transition-all duration-300"
                      aria-label="Email Address"
                    />
                  </div>

                  {otpSent ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <label className="block text-center text-gray-700 font-medium text-sm">
                        Enter Verification Code
                      </label>
                      <OtpInput
                        otp={otp}
                        setOtp={setOtp}
                        otpFocused={otpFocused}
                        setOtpFocused={setOtpFocused}
                      />
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
                          disabled={loading || resendCooldown > 0}
                          className="text-[#456882] hover:text-[#5a7a95] font-medium hover:underline transition-all duration-300 disabled:opacity-50"
                        >
                          {resendCooldown > 0
                            ? `Resend OTP in ${resendCooldown}s`
                            : "Resend OTP"}
                        </button>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <>
                      {!useOtp && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="relative"
                        >
                          <motion.div
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                            animate={{
                              color:
                                passwordFocused || password
                                  ? "#456882"
                                  : "#9CA3AF",
                            }}
                          >
                            <FaLock />
                          </motion.div>
                          <motion.label
                            className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium pointer-events-none transition-all duration-300"
                            animate={
                              passwordFocused || password
                                ? "floating"
                                : "resting"
                            }
                            variants={labelVariants}
                          >
                            Password
                          </motion.label>
                          <motion.input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value.trim())}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            whileFocus={{ scale: 1.02 }}
                            className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl text-gray-900 bg-gray-50/50 focus:outline-none focus:border-[#456882] focus:ring-2 focus:ring-[#456882]/20 transition-all duration-300"
                            aria-label="Password"
                          />
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#456882] transition-colors"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </motion.button>
                        </motion.div>
                      )}

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
                        onClick={useOtp ? handleSendOtp : handlePasswordLogin}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-[#456882] to-[#5a7a95] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center relative overflow-hidden"
                        aria-label={useOtp ? "Send OTP" : "Login"}
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
                            {useOtp ? "Sending..." : "Logging In..."}
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <FaShieldAlt />
                            {useOtp ? "Send OTP" : "Login"}
                          </div>
                        )}
                      </motion.button>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="text-center space-y-2"
                      >
                        {!useOtp && (
                          <button
                            onClick={() => {
                              setShowResetForm(true);
                              setEmail("");
                              setPassword("");
                              setOtp("");
                              setOtpSent(false);
                              setResendCooldown(0);
                            }}
                            className="text-[#456882] hover:text-[#5a7a95] font-medium hover:underline transition-all duration-300"
                          >
                            Forgot Password?
                          </button>
                        )}
                        <div>
                          <button
                            onClick={handleToggleOtp}
                            disabled={loading}
                            className="text-[#456882] hover:text-[#5a7a95] font-medium hover:underline transition-all duration-300 disabled:opacity-50"
                          >
                            {useOtp
                              ? "Use Password Instead"
                              : "Use OTP Instead"}
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center pt-6 border-t border-gray-200"
            >
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-[#456882] hover:text-[#5a7a95] font-semibold hover:underline transition-all duration-300"
                >
                  Sign Up
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
