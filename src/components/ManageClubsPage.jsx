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
    className="p-6 bg-white rounded-lg shadow-md border border-gray-200"
  >
    <div className="flex items-center gap-3 mb-3">
      <FaBuilding
        className="text-teal-600 text-xl"
        style={{ color: "#456882" }}
      />
      <h4 className="text-lg font-semibold text-gray-900">{club.name}</h4>
    </div>
    <p className="text-gray-600 text-sm mb-2">{club.description}</p>
    <p className="text-gray-500 text-sm">Members: {club.memberCount || 0}</p>
    <div className="flex gap-2 mt-3">
      <Link
        to={`/clubs/${club.name}/edit`}
        className="px-4 py-1 rounded-full font-semibold text-teal-600 hover:bg-teal-50 transition"
        style={{ color: "#456882" }}
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
          navigate("/login");
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [userResponse, clubsResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/user", config),
          axios.get("http://localhost:5000/api/clubs", config),
        ]);

        setUser(userResponse.data);
        const filteredClubs = clubsResponse.data
          .filter((club) =>
            userResponse.data.headCoordinatorClubs?.includes(club.name)
          )
          .map(async (club) => {
            try {
              const membersResponse = await axios.get(
                `http://localhost:5000/api/clubs/${club._id}/members`,
                config
              );
              return { ...club, memberCount: membersResponse.data.length };
            } catch {
              return { ...club, memberCount: 0 };
            }
          });
        const clubsWithMembers = await Promise.all(filteredClubs);
        setClubs(clubsWithMembers);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.error || "Failed to load clubs.");
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
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
          <FaSpinner
            className="text-4xl text-teal-600 animate-spin"
            style={{ color: "#456882" }}
          />
        </motion.div>
      )}
      <Navbar user={user} role="admin" />
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-12 bg-gradient-to-br from-teal-50 to-gray-50"
      >
        <div className="container mx-auto px-4">
          <h2
            className="text-3xl font-bold text-center mb-8 text-teal-600"
            style={{ color: "#456882" }}
          >
            Manage Clubs
          </h2>
          {clubs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-gray-700 text-lg">No clubs found.</p>
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
          className="fixed bottom-4 right-4 bg-teal-600 text-white rounded-lg p-4 shadow-lg"
          style={{ backgroundColor: "#456882" }}
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
