import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaImage, FaSpinner } from "react-icons/fa";

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
  const [loading, setLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [contactEmailFocused, setContactEmailFocused] = useState(false);
  const [headCoordinatorsFocused, setHeadCoordinatorsFocused] = useState(false);
  const navigate = useNavigate();

  // Character counter for description
  const maxDescriptionLength = 500;
  const descriptionLength = description.length;

  // Validate head coordinators' emails
  const validateEmails = (emails) => {
    if (!emails) return true;
    const emailArray = emails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailArray.every((email) => emailRegex.test(email));
  };

  // Water ripple effect
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

  // Handle file input changes
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

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (iconPreview) URL.revokeObjectURL(iconPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [iconPreview, bannerPreview]);

  const labelVariants = {
    resting: { y: -28, fontSize: "0.75rem", color: "#6B7280" },
    floating: { y: -28, fontSize: "0.75rem", color: "#456882" },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Client-side validation
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
      const formData = new FormData();
      formData.append("name", name);
      formData.append("icon", icon);
      if (banner) formData.append("banner", banner);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("contactEmail", contactEmail);
      formData.append("headCoordinators", headCoordinators);

      await axios.post("http://localhost:5000/api/clubs", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/clubs");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create club.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      <style>
        {`
          @keyframes ripple {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(5); opacity: 0; }
          }
          [style*="animation: ripple"] {
            animation: ripple 0.8s ease-out;
          }
        `}
      </style>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white rounded-xl shadow-lg p-6 sm:p-8"
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
                className="bg-red-100 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2"
              >
                <span>⚠️</span>
                <p className="text-sm">{error}</p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setError("")}
                  className="ml-auto text-red-600 font-bold"
                  aria-label="Dismiss error"
                >
                  ×
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="relative">
                  <motion.label
                    htmlFor="name"
                    className="block text-gray-500 font-medium mb-1"
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
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] focus:ring-offset-2"
                    required
                    aria-label="Club Name"
                  />
                </div>
                <div className="relative mt-6">
                  <motion.label
                    htmlFor="description"
                    className="block text-gray-500 font-medium mb-1"
                    animate={
                      descriptionFocused || description ? "floating" : "resting"
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
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] focus:ring-offset-2 resize-none"
                    rows="4"
                    required
                    aria-label="Club Description"
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {descriptionLength}/{maxDescriptionLength}
                  </div>
                </div>
                <div className="relative mt-6">
                  <motion.label
                    htmlFor="category"
                    className="block text-gray-500 font-medium mb-1"
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
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] focus:ring-offset-2"
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
              <div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <label
                    htmlFor="icon"
                    className="block text-gray-600 font-medium mb-2"
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mt-6">
                  <label
                    htmlFor="banner"
                    className="block text-gray-600 font-medium mb-2"
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
                      className="mt-4 w-full h-32 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="relative">
              <motion.label
                htmlFor="contactEmail"
                className="block text-gray-500 font-medium mb-1"
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
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] focus:ring-offset-2"
                aria-label="Contact Email"
              />
            </div>
            <div className="relative">
              <motion.label
                htmlFor="headCoordinators"
                className="block text-gray-500 font-medium mb-1"
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
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#456882] focus:ring-offset-2"
                placeholder="email1@example.com, email2@example.com"
                aria-label="Head Coordinators"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#456882] text-white rounded-full font-semibold text-base hover:bg-[#3a536b] disabled:bg-[#6b8299] disabled:cursor-not-allowed flex items-center justify-center"
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
        </motion.div>
      </div>
    </div>
  );
};

export default CreateClubPage;
