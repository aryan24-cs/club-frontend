import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  Camera, 
  Star, 
  Award,
  CheckCircle,
  AlertCircle,
  Save,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import axios from "axios";

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [event, setEvent] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    club: "",
    banner: null,
    category: "",
    eventType: "Intra-College",
    hasRegistrationFee: false,
    acemFee: "",
    nonAcemFee: "",
  });
  
  const [clubs, setClubs] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepErrors, setStepErrors] = useState({});

  const steps = [
    { 
      title: 'Event Basics', 
      icon: Star,
      description: 'Tell us about your event'
    },
    { 
      title: 'Schedule & Location', 
      icon: Calendar,
      description: 'When and where it happens'
    },
    { 
      title: 'Club & Pricing', 
      icon: Users,
      description: 'Organization details'
    },
    { 
      title: 'Visual & Launch', 
      icon: Camera,
      description: 'Final touches'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [userResponse, clubsResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/user", config),
          axios.get("http://localhost:5000/api/clubs", config),
        ]);

        const userData = userResponse.data;
        setUser({
          ...userData,
          isACEMStudent: userData.isACEMStudent || false,
          rollNo: userData.rollNo || "N/A",
        });

        const isGlobalAdmin = userData.isAdmin;
        const isSuperAdmin = clubsResponse.data.some((club) =>
          club.superAdmins?.some(
            (admin) => admin?._id?.toString() === userData._id?.toString()
          )
        );
        const isHeadCoordinator = userData.headCoordinatorClubs?.length > 0;

        let filteredClubs = [];
        if (isGlobalAdmin) {
          filteredClubs = clubsResponse.data;
        } else if (isSuperAdmin) {
          filteredClubs = clubsResponse.data.filter((club) =>
            club.superAdmins?.some(
              (admin) => admin?._id?.toString() === userData._id?.toString()
            )
          );
        } else if (isHeadCoordinator) {
          filteredClubs = clubsResponse.data.filter((club) =>
            userData.headCoordinatorClubs?.includes(club.name)
          );
        }

        setClubs(filteredClubs);
        if (filteredClubs.length === 0) {
          setError("You do not have permission to create events.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.error || "Failed to load data.");
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === "banner" && files && files[0]) {
      if (files[0].size > 5 * 1024 * 1024) {
        setError("Banner image must be less than 5MB.");
        return;
      }
    }
    const newValue = type === "checkbox" ? checked : files ? files[0] : value;
    setEvent((prev) => ({
      ...prev,
      [name]: newValue,
      ...(name === "eventType" && value === "Intra-College" ? { hasRegistrationFee: false, acemFee: "", nonAcemFee: "" } : {}),
    }));
    
    // Clear errors when user starts typing
    if (stepErrors[name]) {
      setStepErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    if (error) setError("");
  };

  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 0:
        if (!event.title.trim()) errors.title = "Event title is required";
        if (!event.category) errors.category = "Please select a category";
        if (!event.description.trim()) errors.description = "Description is required";
        break;
      case 1:
        if (!event.date) errors.date = "Event date is required";
        if (!event.time) errors.time = "Event time is required";
        if (!event.location.trim()) errors.location = "Location is required";
        break;
      case 2:
        if (!event.club) errors.club = "Please select a club";
        if (event.eventType === "Inter-College" && event.hasRegistrationFee) {
          if (!event.acemFee || event.acemFee < 0) errors.acemFee = "Valid ACEM fee is required";
          if (!event.nonAcemFee || event.nonAcemFee < 0) errors.nonAcemFee = "Valid Non-ACEM fee is required";
        }
        break;
    }
    
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    
    try {
      setIsSubmitting(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        return;
      }

      if (
        !event.title ||
        !event.date ||
        !event.time ||
        !event.location ||
        !event.description ||
        !event.club ||
        !event.category ||
        !event.eventType
      ) {
        throw new Error("All required fields must be filled.");
      }

      if (!["Seminar", "Competition"].includes(event.category)) {
        throw new Error("Invalid category. Please select Seminar or Competition.");
      }

      if (!["Intra-College", "Inter-College"].includes(event.eventType)) {
        throw new Error("Invalid event type.");
      }

      if (event.eventType === "Inter-College" && event.hasRegistrationFee) {
        if (!event.acemFee || !event.nonAcemFee || event.acemFee < 0 || event.nonAcemFee < 0) {
          throw new Error("Valid registration fees are required for Inter-College events.");
        }
      }

      const formData = new FormData();
      Object.entries(event).forEach(([key, value]) => {
        if (key === "banner" && value) {
          formData.append(key, value);
        } else if (value !== null && value !== undefined && key !== "banner") {
          formData.append(key, value);
        }
      });

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };
      await axios.post("http://localhost:5000/api/events", formData, config);
      setError("");
      setSuccess("Event created successfully!");
      setTimeout(() => {
        navigate("/admin/events");
      }, 2000);
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err.response?.data?.error || err.message || "Failed to create event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#456882] to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#456882] mb-2">Create Something Amazing</h3>
              <p className="text-gray-600">Let's start with the basics of your event</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#456882]" />
                    Event Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={event.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                      stepErrors.title 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-[#456882]'
                    } focus:outline-none focus:ring-2 focus:ring-[#456882]/20`}
                    placeholder="Enter an exciting event title..."
                  />
                  {stepErrors.title && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {stepErrors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#456882]" />
                    Event Category
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {['Seminar', 'Competition'].map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setEvent(prev => ({ ...prev, category }))}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          event.category === category
                            ? 'border-[#456882] bg-[#456882]/5 text-[#456882]'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="font-medium">{category}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {category === 'Seminar' ? 'Educational sessions' : 'Competitive events'}
                        </div>
                      </button>
                    ))}
                  </div>
                  {stepErrors.category && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {stepErrors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#456882]" />
                    Event Description
                  </label>
                  <textarea
                    name="description"
                    value={event.description}
                    onChange={handleInputChange}
                    rows="4"
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all resize-none ${
                      stepErrors.description 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-[#456882]'
                    } focus:outline-none focus:ring-2 focus:ring-[#456882]/20`}
                    placeholder="Describe what makes your event special..."
                  />
                  {stepErrors.description && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {stepErrors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#456882] to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#456882] mb-2">When & Where</h3>
              <p className="text-gray-600">Set the perfect time and place for your event</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#456882]" />
                      Event Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={event.date}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        stepErrors.date 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-[#456882]'
                      } focus:outline-none focus:ring-2 focus:ring-[#456882]/20`}
                    />
                    {stepErrors.date && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {stepErrors.date}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#456882]" />
                      Event Time
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={event.time}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        stepErrors.time 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-[#456882]'
                      } focus:outline-none focus:ring-2 focus:ring-[#456882]/20`}
                    />
                    {stepErrors.time && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {stepErrors.time}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#456882]" />
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={event.location}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                      stepErrors.location 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-[#456882]'
                    } focus:outline-none focus:ring-2 focus:ring-[#456882]/20`}
                    placeholder="Where will this amazing event take place?"
                  />
                  {stepErrors.location && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {stepErrors.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#456882] to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#456882] mb-2">Organization Details</h3>
              <p className="text-gray-600">Choose your club and set pricing details</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#456882]" />
                    Select Club
                  </label>
                  <select
                    name="club"
                    value={event.club}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                      stepErrors.club 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-[#456882]'
                    } focus:outline-none focus:ring-2 focus:ring-[#456882]/20`}
                  >
                    <option value="">Select organizing club</option>
                    {clubs.map((club) => (
                      <option key={club._id} value={club._id}>
                        {club.name || "Unknown Club"}
                      </option>
                    ))}
                  </select>
                  {stepErrors.club && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {stepErrors.club}
                    </p>
                  )}
                </div>

                <div className="bg-gradient-to-r from-[#456882]/5 to-indigo-50 p-6 rounded-xl border border-[#456882]/20">
                  <h4 className="font-semibold text-[#456882] mb-4">Event Type</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {['Intra-College', 'Inter-College'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setEvent(prev => ({ ...prev, eventType: type }))}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          event.eventType === type
                            ? 'border-[#456882] bg-[#456882] text-white'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="font-medium">{type}</div>
                        <div className={`text-xs mt-1 ${
                          event.eventType === type ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {type === 'Intra-College' ? 'Within our college' : 'Open to all colleges'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {event.eventType === 'Inter-College' && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Registration Fee</h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="hasRegistrationFee"
                          checked={event.hasRegistrationFee}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-[#456882] border-gray-300 rounded focus:ring-[#456882]"
                        />
                        <span className="text-sm font-medium text-gray-700">Has Registration Fee</span>
                      </label>
                    </div>

                    {event.hasRegistrationFee && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-gray-700 text-sm font-semibold mb-2">
                            ACEM Student Fee (₹)
                          </label>
                          <input
                            type="number"
                            name="acemFee"
                            value={event.acemFee}
                            onChange={handleInputChange}
                            min="0"
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                              stepErrors.acemFee 
                                ? 'border-red-300 focus:border-red-500' 
                                : 'border-gray-200 focus:border-[#456882]'
                            } focus:outline-none focus:ring-2 focus:ring-[#456882]/20`}
                            placeholder="0"
                          />
                          {stepErrors.acemFee && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {stepErrors.acemFee}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-semibold mb-2">
                            Non-ACEM Student Fee (₹)
                          </label>
                          <input
                            type="number"
                            name="nonAcemFee"
                            value={event.nonAcemFee}
                            onChange={handleInputChange}
                            min="0"
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                              stepErrors.nonAcemFee 
                                ? 'border-red-300 focus:border-red-500' 
                                : 'border-gray-200 focus:border-[#456882]'
                            } focus:outline-none focus:ring-2 focus:ring-[#456882]/20`}
                            placeholder="0"
                          />
                          {stepErrors.nonAcemFee && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {stepErrors.nonAcemFee}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#456882] to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#456882] mb-2">Final Touches</h3>
              <p className="text-gray-600">Add a banner and review your event</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <label className="block text-gray-700 text-sm font-semibold mb-3 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#456882]" />
                    Event Banner (Optional)
                  </label>
                  <div className="relative border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                    <Camera className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Drop your banner image here</p>
                    <p className="text-sm text-gray-500 mb-4">or click to browse (Max 5MB)</p>
                    <input
                      type="file"
                      name="banner"
                      onChange={handleInputChange}
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {event.banner && (
                      <p className="text-sm text-green-600 font-medium">
                        ✓ {event.banner.name} selected
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#456882]/5 to-slate-50 p-6 rounded-xl border border-[#456882]/20">
                  <h4 className="font-semibold text-[#456882] mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Event Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div><strong>Title:</strong> {event.title || 'Not set'}</div>
                      <div><strong>Category:</strong> {event.category || 'Not selected'}</div>
                      <div><strong>Type:</strong> {event.eventType}</div>
                      <div><strong>Club:</strong> {clubs.find(c => c._id === event.club)?.name || 'Not selected'}</div>
                    </div>
                    <div className="space-y-2">
                      <div><strong>Date:</strong> {event.date || 'Not set'}</div>
                      <div><strong>Time:</strong> {event.time || 'Not set'}</div>
                      <div><strong>Location:</strong> {event.location || 'Not set'}</div>
                      <div><strong>Banner:</strong> {event.banner ? '✓ Added' : '✗ Not added'}</div>
                    </div>
                  </div>
                  {event.hasRegistrationFee && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm">
                        <strong>Registration Fees:</strong> ACEM: ₹{event.acemFee || 0}, Non-ACEM: ₹{event.nonAcemFee || 0}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#456882] mx-auto mb-4"></div>
          <p className="text-[#456882] font-medium">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (error && !clubs.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#456882] text-white px-6 py-2 rounded-lg hover:bg-[#334d5e] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-[Poppins]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#456882]">Create New Event</h1>
              <p className="text-gray-600 mt-1">Bring your ideas to life</p>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    currentStep === index
                      ? 'bg-[#456882] border-[#456882] text-white'
                      : currentStep > index
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {currentStep > index ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 transition-colors ${
                      currentStep > index ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#456882]">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#456882] to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{steps[currentStep].description}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {/* Success Display */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}

        {/* Step Content */}
        <form onSubmit={handleSubmit} noValidate>
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-[#456882] hover:bg-[#456882]/5 border border-[#456882]/20'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: steps.length }, (_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-[#456882] w-8'
                      : index < currentStep
                      ? 'bg-green-500 w-2'
                      : 'bg-gray-300 w-2'
                  }`}
                />
              ))}
            </div>

            {currentStep === steps.length - 1 ? (
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
                  isSubmitting
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#456882] to-indigo-600 text-white hover:from-[#334d5e] hover:to-indigo-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Event
                  </>
                )}
              </motion.button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#456882] to-indigo-600 text-white hover:from-[#334d5e] hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEventPage;