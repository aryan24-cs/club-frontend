import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaBuilding, FaSpinner, FaEdit, FaTrash, FaFilter } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

const ClubCard = ({ club, handleDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 group"
  >
    <div className="relative overflow-hidden mb-4">
      <img
        src={club.icon || "https://content3.jdmagicbox.com/v2/comp/faridabad/c2/011pxx11.xx11.180720042429.n1c2/catalogue/aravali-college-of-engineering-and-management-jasana-faridabad-colleges-5hhqg5d110.jpg"}
        alt={club.name || "Club Icon"}
        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        onError={(e) => {
          e.target.src = "https://content3.jdmagicbox.com/v2/comp/faridabad/c2/011pxx11.xx11.180720042429.n1c2/catalogue/aravali-college-of-engineering-and-management-jasana-faridabad-colleges-5hhqg5d110.jpg";
          console.warn(
            `Failed to load icon for club ${club.name}: ${club.icon}`
          );
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute top-4 left-4">
        <span className="bg-[#456882] text-white px-3 py-1 rounded-full text-sm font-medium">
          {club.category || "General"}
        </span>
      </div>
    </div>
    <div className="flex items-center gap-3 mb-3">
      <FaBuilding className="text-[#456882] text-xl" />
      <h4 className="text-lg font-semibold text-gray-900">{club.name}</h4>
    </div>
    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
      {club.description}
    </p>
    <p className="text-gray-500 text-sm mb-2">Members: {club.memberCount || 0}</p>
    <p className="text-gray-500 text-sm mb-2">
      Created By: {club.createdBy?.name || "Unknown"} (Roll No: {club.createdBy?.rollNo || "N/A"})
    </p>
    <p className="text-gray-500 text-sm mb-3">
      {club.createdBy?.isACEMStudent ? "ACEM Student" : "Non-ACEM Student"}
    </p>
    <div className="flex gap-2 mt-3">
      <Link
        to={`/clubs/${club._id}/edit`}
        className="px-4 py-1 rounded-full font-semibold text-[#456882] hover:bg-[#456882]/10 transition"
        aria-label={`Edit ${club.name}`}
      >
        <FaEdit className="inline-block mr-1" /> Edit
      </Link>
      <motion.button
        onClick={() => handleDelete(club._id)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 py-1 rounded-full font-semibold text-red-600 hover:bg-red-50 transition"
        aria-label={`Delete ${club.name}`}
      >
        <FaTrash className="inline-block mr-1" /> Delete
      </motion.button>
    </div>
  </motion.div>
);

const ManageClubsPage = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [clubFilter, setClubFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          navigate("/login");
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [userResponse, clubsResponse] = await Promise.all([
          axios.get("https://club-manager-chi.vercel.app/api/auth/user", config),
          axios.get("https://club-manager-chi.vercel.app/api/clubs", config),
        ]);

        const userData = userResponse.data;
        setUser({
          ...userData,
          isACEMStudent: userData.isACEMStudent || false,
          rollNo: userData.rollNo || "N/A",
        });

        // Debug logging
        console.log("ManageClubsPage - User:", {
          _id: userData._id,
          name: userData.name,
          isAdmin: userData.isAdmin,
          headCoordinatorClubs: userData.headCoordinatorClubs,
          isACEMStudent: userData.isACEMStudent || false,
          rollNo: userData.rollNo || "N/A",
        });
        console.log("ManageClubsPage - All Clubs:", clubsResponse.data);

        // Filter clubs based on user role
        let managedClubs = [];
        const isHeadCoordinator = (userData.headCoordinatorClubs || []).length > 0;
        if (isHeadCoordinator) {
          managedClubs = clubsResponse.data.filter((club) =>
            userData.headCoordinatorClubs.includes(club.name)
          );
          console.log("ManageClubsPage - Filtered clubs for Head Coordinator:", managedClubs);
        } else {
          // For both global admins and super admins, only show clubs they created or are super admins for
          managedClubs = clubsResponse.data.filter(
            (club) =>
              club.creator?._id?.toString() === userData._id?.toString() ||
              club.superAdmins?.some(
                (admin) => admin?._id?.toString() === userData._id?.toString()
              )
          );
          console.log("ManageClubsPage - Filtered clubs for Admin/Super Admin:", managedClubs);
        }

        // Fetch member counts and enhance clubs with createdBy details
        const clubsWithMembers = await Promise.all(
          managedClubs.map(async (club) => {
            try {
              const membersResponse = await axios.get(
                `https://club-manager-chi.vercel.app/api/clubs/${club._id}/members`,
                config
              );
              return {
                ...club,
                memberCount: membersResponse.data.length,
                createdBy: {
                  name: club.createdBy?.name || "Unknown",
                  rollNo: club.createdBy?.rollNo || "N/A",
                  isACEMStudent: club.createdBy?.isACEMStudent || false,
                },
              };
            } catch (err) {
              console.warn(
                `Failed to fetch members for club ${club.name}:`,
                err
              );
              return {
                ...club,
                memberCount: 0,
                createdBy: {
                  name: club.createdBy?.name || "Unknown",
                  rollNo: club.createdBy?.rollNo || "N/A",
                  isACEMStudent: club.createdBy?.isACEMStudent || false,
                },
              };
            }
          })
        );

        setClubs(clubsWithMembers);
        console.log(
          "ManageClubsPage - Filtered Clubs with Members:",
          clubsWithMembers
        );

        // Set error if no clubs are available
        if (managedClubs.length === 0) {
          setError("You do not have access to manage any clubs.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          setError("Session expired or unauthorized. Please log in again.");
          navigate("/login");
        } else {
          setError(err.response?.data?.error || "Failed to load clubs.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleDelete = async (clubId) => {
    if (!window.confirm("Are you sure you want to delete this club?")) return;
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`https://club-manager-chi.vercel.app/api/clubs/${clubId}`, config);
      setClubs((prev) => prev.filter((club) => club._id !== clubId));
      setError("Club deleted successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete club.");
    }
  };

  // Filter clubs based on category
  const filteredClubs = clubs.filter(
    (club) =>
      clubFilter === "" ||
      club.category.toLowerCase() === clubFilter.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gray-50 font-[Poppins]">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50"
        >
          <FaSpinner className="text-4xl text-[#456882] animate-spin" />
        </motion.div>
      )}
      <Navbar
        user={user}
        role={
          user?.headCoordinatorClubs?.length > 0
            ? "headCoordinator"
            : user?.isAdmin
            ? "admin"
            : "superAdmin"
        }
      />
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-12 bg-gradient-to-br from-[#456882]/10 to-gray-50"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-[#456882]">
              Manage Clubs
            </h2>
            <div className="relative mt-4 sm:mt-0">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <select
                value={clubFilter}
                onChange={(e) => setClubFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-[#456882] focus:border-[#456882] bg-gray-50 text-sm"
                aria-label="Filter clubs by category"
              >
                <option value="">All Categories</option>
                <option value="cultural">Cultural</option>
                <option value="technical">Technical</option>
                <option value="literary">Literary</option>
                <option value="entrepreneurial">Entrepreneurial</option>
              </select>
            </div>
          </div>
          {filteredClubs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-gray-700 text-lg">
                {isLoading
                  ? "Loading clubs..."
                  : "No clubs found for your role."}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <ClubCard
                  key={club._id}
                  club={club}
                  handleDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </motion.section>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed bottom-4 right-4 bg-[#456882] text-white rounded-lg p-4 shadow-lg"
        >
          <p className="text-sm">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-2 text-white underline"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            Dismiss
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default ManageClubsPage;
