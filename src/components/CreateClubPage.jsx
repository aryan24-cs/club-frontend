import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { FaImage, FaSpinner } from "react-icons/fa";
import Navbar from "../components/Navbar";

const CreateClubPage = () => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(null);
  const [banner, setBanner] = useState(null);
  const [iconPreview, setIconPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [headCoordinators, setHeadCoordinators] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdClub, setCreatedClub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [contactEmailFocused, setContactEmailFocused] = useState(false);
  const [headCoordinatorsFocused, setHeadCoordinatorsFocused] = useState(false);

  const maxDescriptionLength = 500;
  const descriptionLength = description.length;

  const validateEmails = (emails) => {
    if (!emails) return true;
    const emailArray = emails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailArray.every((email) => emailRegex.test(email));
  };

  useEffect(() => {
    const createRipple = (e) => {
      const ripple = document.createElement("span");
      const diameter = 20;
      const radius = diameter / 2;
      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${e.clientX - radius}px`;
      ripple.style.top = `${e.clientY - radius}px`;
      ripple.style.position = "fixed";
      ripple.style.borderRadius = "50%";
      ripple.style.backgroundColor = "rgba(69, 104, 130, 0.2)";
      ripple.style.pointerEvents = "none";
      ripple.style.zIndex = "10000";
      ripple.style.animation = "ripple 0.8s ease-out";
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 800);
    };
    document.addEventListener("click", createRipple);
    return () => document.removeEventListener("click", createRipple);
  }, []);

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setError("Icon must be a JPEG or PNG image");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Icon file size must be less than 5MB");
        return;
      }
      setIcon(file);
      setIconPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setError("Banner must be a JPEG or PNG image");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Banner file size must be less than 5MB");
        return;
      }
      setBanner(file);
      setBannerPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  useEffect(() => {
    return () => {
      if (iconPreview) URL.revokeObjectURL(iconPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [iconPreview, bannerPreview]);

  const labelVariants = {
    resting: { y: 0, fontSize: "0.875rem", color: "#6B7280" },
    floating: { y: -20, fontSize: "0.75rem", color: "#456882" },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!name) {
      setError("Club name is required");
      setLoading(false);
      return;
    }
    if (!icon) {
      setError("Club icon is required");
      setLoading(false);
      return;
    }
    if (description.length > maxDescriptionLength) {
      setError(
        `Description must be ${maxDescriptionLength} characters or less`
      );
      setLoading(false);
      return;
    }
    if (!category) {
      setError("Category is required");
      setLoading(false);
      return;
    }
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      setError("Invalid contact email");
      setLoading(false);
      return;
    }
    if (headCoordinators && !validateEmails(headCoordinators)) {
      setError("Invalid head coordinator email(s)");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to create a club");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("icon", icon);
      if (banner) formData.append("banner", banner);
      formData.append("description", description);
      formData.append("category", category);
      if (contactEmail) formData.append("contactEmail", contactEmail);
      if (headCoordinators)
        formData.append("headCoordinators", headCoordinators);

      const response = await axios.post(
        "https://club-manager-chi.vercel.app/api/clubs",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess("Club created successfully!");
      setCreatedClub(response.data.club);
      setName("");
      setIcon(null);
      setBanner(null);
      setIconPreview("");
      setBannerPreview("");
      setDescription("");
      setCategory("");
      setContactEmail("");
      setHeadCoordinators("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create club.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(5);
            opacity: 0;
          }
        }
        [style*="animation: ripple"] {
          animation: ripple 0.8s ease-out;
        }
      `}</style>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold text-[#456882] text-center mb-8">
            Create a New Club
          </h2>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-3"
              >
                <span className="text-lg">⚠️</span>
                <p className="text-sm font-medium">{error}</p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setError("")}
                  className="ml-auto text-red-600 font-bold text-lg"
                  aria-label="Dismiss error"
                >
                  ×
                </motion.button>
              </motion.div>
            )}
            {success && createdClub && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-50 text-green-600 p-6 rounded-lg mb-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-lg">✅</span>
                  <p className="text-sm font-medium">{success}</p>
                </div>
                <h3 className="text-xl font-semibold text-[#456882] mb-4">
                  {createdClub.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {createdClub.icon && (
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Club Icon
                      </p>
                      <img
                        src={createdClub.icon}
                        alt={`${createdClub.name} icon`}
                        className="w-32 h-32 object-cover rounded-full mx-auto"
                      />
                    </div>
                  )}
                  {createdClub.banner && (
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Club Banner
                      </p>
                      <img
                        src={createdClub.banner}
                        alt={`${createdClub.name} banner`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCreatedClub(null)}
                  className="mt-4 px-4 py-2 bg-[#456882] text-white rounded-lg font-medium"
                >
                  Create Another Club
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          {!createdClub && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="relative">
                    <motion.label
                      htmlFor="name"
                      className="absolute left-3 top-3 text-gray-500 font-medium transition-all"
                      animate={nameFocused || name ? "floating" : "resting"}
                      variants={labelVariants}
                      transition={{ duration: 0.2 }}
                    >
                      Club Name
                    </motion.label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(!!name)}
                      className="w-full p-3 pt-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] focus:ring-offset-2"
                      required
                      aria-label="Club Name"
                    />
                  </div>
                  <div className="relative">
                    <motion.label
                      htmlFor="description"
                      className="absolute left-3 top-3 text-gray-500 font-medium transition-all"
                      animate={
                        descriptionFocused || description
                          ? "floating"
                          : "resting"
                      }
                      variants={labelVariants}
                      transition={{ duration: 0.2 }}
                    >
                      Description
                    </motion.label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) =>
                        setDescription(
                          e.target.value.slice(0, maxDescriptionLength)
                        )
                      }
                      onFocus={() => setDescriptionFocused(true)}
                      onBlur={() => setDescriptionFocused(!!description)}
                      className="w-full p-3 pt-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] focus:ring-offset-2 resize-none"
                      rows="4"
                      required
                      aria-label="Club Description"
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {descriptionLength}/{maxDescriptionLength}
                    </div>
                  </div>
                  <div className="relative">
                    <motion.label
                      htmlFor="category"
                      className="absolute left-3 top-3 text-gray-500 font-medium transition-all"
                      animate={category ? "floating" : "resting"}
                      variants={labelVariants}
                      transition={{ duration: 0.2 }}
                    >
                      Category
                    </motion.label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-3 pt-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] focus:ring-offset-2"
                      required
                      aria-label="Club Category"
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      <option value="Technical">Technical</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Literary">Literary</option>
                      <option value="Entrepreneurial">Entrepreneurial</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <label
                      htmlFor="icon"
                      className="block text-gray-600 font-medium mb-3"
                    >
                      <FaImage className="inline-block mr-2 text-[#456882]" />
                      Club Icon (JPEG/PNG, max 5MB)
                    </label>
                    <input
                      id="icon"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleIconChange}
                      className="w-full p-2 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#456882] file:text-white file:hover:bg-[#3a536b]"
                      required
                      aria-label="Club Icon"
                    />
                    {iconPreview && (
                      <motion.img
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={iconPreview}
                        alt="Club icon preview"
                        className="mt-4 w-24 h-24 object-cover rounded-full mx-auto"
                      />
                    )}
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <label
                      htmlFor="banner"
                      className="block text-gray-600 font-medium mb-3"
                    >
                      <FaImage className="inline-block mr-2 text-[#456882]" />
                      Club Banner (JPEG/PNG, max 5MB, Optional)
                    </label>
                    <input
                      id="banner"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleBannerChange}
                      className="w-full p-2 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#456882] file:text-white file:hover:bg-[#3a536b]"
                      aria-label="Club Banner"
                    />
                    {bannerPreview && (
                      <motion.img
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={bannerPreview}
                        alt="Club banner preview"
                        className="mt-4 w-full h-40 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="relative">
                <motion.label
                  htmlFor="contactEmail"
                  className="absolute left-3 top-3 text-gray-500 font-medium transition-all"
                  animate={
                    contactEmailFocused || contactEmail ? "floating" : "resting"
                  }
                  variants={labelVariants}
                  transition={{ duration: 0.2 }}
                >
                  Contact Email (Optional)
                </motion.label>
                <input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  onFocus={() => setContactEmailFocused(true)}
                  onBlur={() => setContactEmailFocused(!!contactEmail)}
                  className="w-full p-3 pt-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] focus:ring-offset-2"
                  aria-label="Contact Email"
                />
              </div>
              <div className="relative">
                <motion.label
                  htmlFor="headCoordinators"
                  className="absolute left-3 top-3 text-gray-500 font-medium transition-all"
                  animate={
                    headCoordinatorsFocused || headCoordinators
                      ? "floating"
                      : "resting"
                  }
                  variants={labelVariants}
                  transition={{ duration: 0.2 }}
                >
                  Head Coordinators (Comma-separated emails, Optional)
                </motion.label>
                <input
                  id="headCoordinators"
                  type="text"
                  value={headCoordinators}
                  onChange={(e) => setHeadCoordinators(e.target.value)}
                  onFocus={() => setHeadCoordinatorsFocused(true)}
                  onBlur={() => setHeadCoordinatorsFocused(!!headCoordinators)}
                  className="w-full p-3 pt-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] focus:ring-offset-2"
                  placeholder="email1@example.com, email2@example.com"
                  aria-label="Head Coordinators"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#456882] text-white rounded-lg font-medium text-base hover:bg-[#3a536b] disabled:bg-[#6b8299] disabled:cursor-not-allowed flex items-center justify-center"
                aria-label="Create Club"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Club"
                )}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CreateClubPage;
