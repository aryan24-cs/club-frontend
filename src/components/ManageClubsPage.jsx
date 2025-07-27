import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaBuilding, FaSpinner, FaEdit, FaTrash } from "react-icons/fa";
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
        src={club.icon || "https://via.placeholder.com/400x200"}
        alt={club.name || "Club Icon"}
        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/400x200";
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
    <p className="text-gray-500 text-sm">Members: {club.memberCount || 0}</p>
    <div className="flex gap-2 mt-3">
      <Link
        to={`/clubs/${club._id}/edit`} // Changed to use _id for consistency
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
          axios.get("http://localhost:5000/api/auth/user", config),
          axios.get("http://localhost:5000/api/clubs", config),
        ]);

        const userData = userResponse.data;
        setUser(userData);

        // Debug logging
        console.log("ManageClubsPage - User:", {
          _id: userData._id,
          name: userData.name,
          isAdmin: userData.isAdmin,
          headCoordinatorClubs: userData.headCoordinatorClubs,
        });
        console.log("ManageClubsPage - All Clubs:", clubsResponse.data);

        // Filter clubs based on user role
        let filteredClubs = [];
        if (userData.isAdmin) {
          // Global admin sees all clubs
          filteredClubs = clubsResponse.data;
          console.log("ManageClubsPage - Showing all clubs for global admin");
        } else if (
          clubsResponse.data.some((club) =>
            club.superAdmins?.some(
              (admin) => admin?._id?.toString() === userData._id?.toString()
            )
          )
        ) {
          // SuperAdmin sees clubs where they are listed in superAdmins
          filteredClubs = clubsResponse.data.filter((club) =>
            club.superAdmins?.some(
              (admin) => admin?._id?.toString() === userData._id?.toString()
            )
          );
          console.log(
            "ManageClubsPage - Showing clubs for SuperAdmin based on superAdmins"
          );
        } else if (userData.headCoordinatorClubs?.length > 0) {
          // Admin sees clubs in headCoordinatorClubs
          filteredClubs = clubsResponse.data.filter((club) =>
            userData.headCoordinatorClubs.includes(club.name)
          );
          console.log(
            "ManageClubsPage - Showing clubs for Admin based on headCoordinatorClubs"
          );
        } else {
          console.log("ManageClubsPage - No eligible clubs found for user");
        }

        // Fetch member counts for filtered clubs
        const clubsWithMembers = await Promise.all(
          filteredClubs.map(async (club) => {
            try {
              const membersResponse = await axios.get(
                `http://localhost:5000/api/clubs/${club._id}/members`,
                config
              );
              return { ...club, memberCount: membersResponse.data.length };
            } catch (err) {
              console.warn(
                `Failed to fetch members for club ${club.name}:`,
                err
              );
              return { ...club, memberCount: 0 };
            }
          })
        );

        setClubs(clubsWithMembers);
        console.log(
          "ManageClubsPage - Filtered Clubs with Members:",
          clubsWithMembers
        );

        if (clubsWithMembers.length === 0) {
          setError("No clubs found for your role.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.error || "Failed to load clubs.");
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          setError("Session expired or unauthorized. Please log in again.");
          navigate("/login");
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
      await axios.delete(`http://localhost:5000/api/clubs/${clubId}`, config);
      setClubs((prev) => prev.filter((club) => club._id !== clubId));
      setError("Club deleted successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete club.");
    }
  };

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
      <Navbar user={user} role={user?.isAdmin ? "admin" : "superAdmin"} />
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-12 bg-gradient-to-br from-[#456882]/10 to-gray-50"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#456882]">
            Manage Clubs
          </h2>
          {clubs.length === 0 ? (
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
              {clubs.map((club) => (
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
