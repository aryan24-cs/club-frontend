import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditClubPage = () => {
  const { clubName } = useParams();
  const [club, setClub] = useState(null);
  const [user, setUser] = useState(null);
  const [icon, setIcon] = useState(null);
  const [banner, setBanner] = useState(null);
  const [iconPreview, setIconPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [headCoordinators, setHeadCoordinators] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [contactEmailFocused, setContactEmailFocused] = useState(false);
  const [headCoordinatorsFocused, setHeadCoordinatorsFocused] = useState(false);
  const navigate = useNavigate();

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

  // Fetch user and club details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          navigate('/login');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [userResponse, clubResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/user', config),
          axios.get(`http://localhost:5000/api/clubs?name=${clubName}`, config),
        ]);

        const userData = userResponse.data;
        setUser({
          ...userData,
          isACEMStudent: userData.isACEMStudent || false,
          rollNo: userData.rollNo || 'N/A',
        });

        const clubData = clubResponse.data[0];
        if (!clubData) {
          setError('Club not found.');
          setLoading(false);
          return;
        }

        // Check authorization
        const isAuthorized =
          clubData.creator?._id?.toString() === userData._id?.toString() ||
          clubData.superAdmins?.some(
            (admin) => admin?._id?.toString() === userData._id?.toString()
          ) ||
          userData.headCoordinatorClubs?.includes(clubData.name);

        if (!isAuthorized) {
          setError('You are not authorized to edit this club.');
          navigate('/manage-clubs');
          return;
        }

        setClub(clubData);
        setIconPreview(clubData.icon);
        setBannerPreview(clubData.banner || '');
        setDescription(clubData.description);
        setCategory(clubData.category);
        setContactEmail(clubData.contactEmail || '');
        setHeadCoordinators(clubData.headCoordinators?.join(', ') || '');
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          setError('Session expired or unauthorized. Please log in again.');
          navigate('/login');
        } else {
          setError(err.response?.data?.error || 'Failed to load club details.');
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [clubName, navigate]);

  // Handle file input changes
  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('Icon must be a JPEG or PNG image');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Icon file size must be less than 5MB');
        return;
      }
      setIcon(file);
      setIconPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('Banner must be a JPEG or PNG image');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Banner file size must be less than 5MB');
        return;
      }
      setBanner(file);
      setBannerPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (iconPreview && icon) URL.revokeObjectURL(iconPreview);
      if (bannerPreview && banner) URL.revokeObjectURL(bannerPreview);
    };
  }, [iconPreview, bannerPreview, icon, banner]);

  const labelVariants = {
    resting: { y: 8, fontSize: '0.875rem', color: '#4B5563' },
    floating: { y: -8, fontSize: '0.75rem', color: '#DC143C' },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      if (icon) formData.append('icon', icon);
      if (banner) formData.append('banner', banner);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('contactEmail', contactEmail);
      formData.append('headCoordinators', headCoordinators);

      await axios.patch(`http://localhost:5000/api/clubs/${club._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate(`/clubs/${clubName}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update club.');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="text-center py-12 text-gray-600">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;
  if (!club) return <div className="text-center py-12 text-gray-600">Club not found.</div>;

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
          Edit {club.name}
        </h2>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="text-red-500 text-sm text-center mb-4"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-gray-600 font-medium">Club Name (Read-only)</label>
            <input
              type="text"
              value={club.name}
              disabled
              className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border-b-2 border-gray-300 bg-gray-100"
              aria-label="Club Name"
            />
          </div>
          <div>
            <label htmlFor="icon" className="block text-gray-600 font-medium">
              Club Icon (JPEG/PNG, max 5MB)
            </label>
            <input
              id="icon"
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleIconChange}
              className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border-b-2 border-red-600 focus:outline-none focus:border-red-700"
              aria-label="Club Icon"
            />
            {iconPreview && (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={iconPreview}
                alt="Icon preview"
                className="mt-2 w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-full"
              />
            )}
          </div>
          <div>
            <label htmlFor="banner" className="block text-gray-600 font-medium">
              Club Banner (JPEG/PNG, max 5MB, Optional)
            </label>
            <input
              id="banner"
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleBannerChange}
              className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border-b-2 border-red-600 focus:outline-none focus:border-red-700"
              aria-label="Club Banner"
            />
            {bannerPreview && (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={bannerPreview}
                alt="Banner preview"
                className="mt-2 w-full h-32 sm:h-40 object-cover rounded-lg"
              />
            )}
          </div>
          <div className="relative">
            <motion.label
              htmlFor="description"
              className="absolute left-4 top-2 sm:top-3 text-gray-600 font-medium pointer-events-none"
              animate={descriptionFocused || description ? 'floating' : 'resting'}
              variants={labelVariants}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              Description
            </motion.label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setDescriptionFocused(true)}
              onBlur={() => setDescriptionFocused(false)}
              className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border-b-2 border-red-600 focus:outline-none focus:border-red-700"
              required
              aria-label="Club Description"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-gray-600 font-medium">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border-b-2 border-red-600 focus:outline-none focus:border-red-700"
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
          <div className="relative">
            <motion.label
              htmlFor="contactEmail"
              className="absolute left-4 top-2 sm:top-3 text-gray-600 font-medium pointer-events-none"
              animate={contactEmailFocused || contactEmail ? 'floating' : 'resting'}
              variants={labelVariants}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              Contact Email (Optional)
            </motion.label>
            <input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              onFocus={() => setContactEmailFocused(true)}
              onBlur={() => setContactEmailFocused(false)}
              className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border-b-2 border-red-600 focus:outline-none focus:border-red-700"
              aria-label="Contact Email"
            />
          </div>
          <div className="relative">
            <motion.label
              htmlFor="headCoordinators"
              className="absolute left-4 top-2 sm:top-3 text-gray-600 font-medium pointer-events-none"
              animate={headCoordinatorsFocused || headCoordinators ? 'floating' : 'resting'}
              variants={labelVariants}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              Head Coordinators (Comma-separated emails, Optional)
            </motion.label>
            <input
              id="headCoordinators"
              type="text"
              value={headCoordinators}
              onChange={(e) => setHeadCoordinators(e.target.value)}
              onFocus={() => setHeadCoordinatorsFocused(true)}
              onBlur={() => setHeadCoordinatorsFocused(false)}
              className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border-b-2 border-red-600 focus:outline-none focus:border-red-700"
              placeholder="email1@example.com, email2@example.com"
              aria-label="Head Coordinators"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 sm:py-3 bg-red-600 text-white rounded-full font-semibold text-sm sm:text-base hover:bg-red-700 disabled:opacity-50"
            aria-label="Update Club"
          >
            {submitting ? 'Updating...' : 'Update Club'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default EditClubPage;
