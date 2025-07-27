import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8 text-[#456882]">
          <h2 className="text-2xl font-bold">Something went wrong.</h2>
          <p>Please try refreshing the page or contact support.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 px-6 py-2 bg-[#456882] text-white rounded-full"
            onClick={() => window.location.reload()}
          >
            Retry
          </motion.button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Memoized MembershipRequestCard Component
const MembershipRequestCard = ({
  request,
  handleApprove,
  handleReject,
  isLoading,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ type: "spring", stiffness: 100, damping: 15 }}
    whileHover={{ scale: 1.03, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
    className="p-6 bg-white rounded-xl shadow-md border border-gray-200"
  >
    <div className="flex items-center gap-3 mb-3">
      <FaUser className="text-[#456882] text-xl" />
      <h4 className="text-lg font-semibold text-gray-900">
        {request.userId?.name || "Unknown User"}
      </h4>
    </div>
    <p className="text-gray-600 text-sm mb-2">
      Email: {request.userId?.email || "N/A"}
    </p>
    <p className="text-gray-600 text-sm mb-2">
      Club: {request.clubName || "Unknown Club"}
    </p>
    <p className="text-gray-600 text-sm mb-2">
      Status: {request.status || "Pending"}
    </p>
    <div className="flex gap-2">
      <motion.button
        onClick={() => handleApprove(request._id)}
        disabled={request.status !== "pending" || isLoading[request._id]}
        whileHover={{
          scale:
            request.status === "pending" && !isLoading[request._id] ? 1.05 : 1,
        }}
        whileTap={{
          scale:
            request.status === "pending" && !isLoading[request._id] ? 0.95 : 1,
        }}
        className={`px-4 py-1 rounded-full font-semibold transition ${
          request.status !== "pending" || isLoading[request._id]
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : "bg-[#456882] text-white hover:bg-[#334d5e]"
        }`}
        aria-label={`Approve request for ${request.userId?.name} to join ${request.clubName}`}
      >
        {isLoading[request._id] && request.status === "pending" ? (
          <FaSpinner className="animate-spin inline-block mr-2" />
        ) : (
          "Approve"
        )}
      </motion.button>
      <motion.button
        onClick={() => handleReject(request._id)}
        disabled={request.status !== "pending" || isLoading[request._id]}
        whileHover={{
          scale:
            request.status === "pending" && !isLoading[request._id] ? 1.05 : 1,
        }}
        whileTap={{
          scale:
            request.status === "pending" && !isLoading[request._id] ? 0.95 : 1,
        }}
        className={`px-4 py-1 rounded-full font-semibold transition ${
          request.status !== "pending" || isLoading[request._id]
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : "bg-red-600 text-white hover:bg-red-700"
        }`}
        aria-label={`Reject request for ${request.userId?.name} to join ${request.clubName}`}
      >
        {isLoading[request._id] && request.status === "pending" ? (
          <FaSpinner className="animate-spin inline-block mr-2" />
        ) : (
          "Reject"
        )}
      </motion.button>
    </div>
  </motion.div>
);

// Memoized UserCard Component
const UserCard = ({ user, handleUpdateRole, handleDeleteUser, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ type: "spring", stiffness: 100, damping: 15 }}
    whileHover={{ scale: 1.03, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
    className="p-6 bg-white rounded-xl shadow-md border border-gray-200"
  >
    <div className="flex items-center gap-3 mb-3">
      <FaUser className="text-[#456882] text-xl" />
      <h4 className="text-lg font-semibold text-gray-900">
        {user.name || "Unknown User"}
      </h4>
    </div>
    <p className="text-gray-600 text-sm mb-2">Email: {user.email || "N/A"}</p>
    <p className="text-gray-600 text-sm mb-2">Role: {user.role || "User"}</p>
    <div className="flex gap-2">
      <motion.button
        onClick={() =>
          handleUpdateRole(user._id, user.role === "user" ? "admin" : "user")
        }
        disabled={isLoading[user._id]}
        whileHover={{ scale: isLoading[user._id] ? 1 : 1.05 }}
        whileTap={{ scale: isLoading[user._id] ? 1 : 0.95 }}
        className={`px-4 py-1 rounded-full font-semibold transition ${
          isLoading[user._id]
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : "bg-[#456882] text-white hover:bg-[#334d5e]"
        }`}
        aria-label={`Change role for ${user.name}`}
      >
        {isLoading[user._id] ? (
          <FaSpinner className="animate-spin inline-block mr-2" />
        ) : (
          "Change Role"
        )}
      </motion.button>
      <motion.button
        onClick={() => handleDeleteUser(user._id)}
        disabled={isLoading[user._id]}
        whileHover={{ scale: isLoading[user._id] ? 1 : 1.05 }}
        whileTap={{ scale: isLoading[user._id] ? 1 : 0.95 }}
        className={`px-4 py-1 rounded-full font-semibold transition ${
          isLoading[user._id]
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : "bg-red-600 text-white hover:bg-red-700"
        }`}
        aria-label={`Delete ${user.name}`}
      >
        {isLoading[user._id] ? (
          <FaSpinner className="animate-spin inline-block mr-2" />
        ) : (
          "Delete"
        )}
      </motion.button>
    </div>
  </motion.div>
);

const ManageUsers = () => {
  const [user, setUser] = useState(null);
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const navigate = useNavigate();

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
        const [userResponse, clubsResponse, requestsResponse, usersResponse] =
          await Promise.all([
            axios.get("http://localhost:5000/api/auth/user", config),
            axios.get("http://localhost:5000/api/clubs", config),
            axios
              .get("http://localhost:5000/api/membership-requests", config)
              .catch(() => ({ data: [] })),
            axios
              .get("http://localhost:5000/api/users", config)
              .catch(() => ({ data: [] })),
          ]);

        const userData = userResponse.data;
        setUser(userData);

        // Debug logging
        console.log("ManageUsers - User:", {
          _id: userData._id,
          name: userData.name,
          isAdmin: userData.isAdmin,
          headCoordinatorClubs: userData.headCoordinatorClubs,
        });
        console.log("ManageUsers - All Clubs:", clubsResponse.data);

        // Determine user role
        const isGlobalAdmin = userData.isAdmin;
        const isSuperAdmin = clubsResponse.data.some((club) =>
          club.superAdmins?.some(
            (admin) => admin?._id?.toString() === userData._id?.toString()
          )
        );
        const isAdmin = userData.headCoordinatorClubs?.length > 0;

        console.log("ManageUsers - Roles:", {
          isGlobalAdmin,
          isSuperAdmin,
          isAdmin,
        });

        // Filter membership requests
        let filteredRequests = requestsResponse.data;
        if (isGlobalAdmin) {
          // Global admin sees all requests
          console.log(
            "ManageUsers - Showing all membership requests for global admin"
          );
        } else if (isSuperAdmin) {
          // SuperAdmin sees requests for clubs they manage
          const managedClubIds = clubsResponse.data
            .filter((club) =>
              club.superAdmins?.some(
                (admin) => admin?._id?.toString() === userData._id?.toString()
              )
            )
            .map((club) => club._id.toString());
          filteredRequests = requestsResponse.data.filter((request) =>
            managedClubIds.includes(request.clubId?.toString())
          );
          console.log(
            "ManageUsers - Filtered membership requests for SuperAdmin:",
            filteredRequests
          );
        } else if (isAdmin) {
          // Admin sees requests for clubs in headCoordinatorClubs
          const managedClubNames = userData.headCoordinatorClubs || [];
          filteredRequests = requestsResponse.data.filter((request) =>
            managedClubNames.includes(request.clubName)
          );
          console.log(
            "ManageUsers - Filtered membership requests for Admin:",
            filteredRequests
          );
        } else {
          filteredRequests = [];
          console.log("ManageUsers - No membership requests for user");
        }

        setMembershipRequests(filteredRequests);

        // Filter users
        let filteredUsers = usersResponse.data;
        if (isGlobalAdmin) {
          // Global admin sees all users
          console.log("ManageUsers - Showing all users for global admin");
        } else if (isSuperAdmin) {
          // SuperAdmin sees users who are members of their managed clubs
          const managedClubIds = clubsResponse.data
            .filter((club) =>
              club.superAdmins?.some(
                (admin) => admin?._id?.toString() === userData._id?.toString()
              )
            )
            .map((club) => club._id.toString());
          const clubMembersPromises = managedClubIds.map((clubId) =>
            axios
              .get(`http://localhost:5000/api/clubs/${clubId}/members`, config)
              .catch(() => ({ data: [] }))
          );
          const clubMembersResponses = await Promise.all(clubMembersPromises);
          const memberIds = new Set(
            clubMembersResponses.flatMap((res) =>
              res.data.map((member) => member._id?.toString())
            )
          );
          filteredUsers = usersResponse.data.filter((u) =>
            memberIds.has(u._id?.toString())
          );
          console.log(
            "ManageUsers - Filtered users for SuperAdmin:",
            filteredUsers
          );
        } else if (isAdmin) {
          // Admin sees users based on backend filtering (assumed to be headCoordinatorClubs)
          console.log(
            "ManageUsers - Showing users for Admin (backend filtered)"
          );
        } else {
          filteredUsers = [];
          console.log("ManageUsers - No users for user");
        }

        setUsers(filteredUsers);

        if (filteredUsers.length === 0 && filteredRequests.length === 0) {
          setError("No users or membership requests found for your role.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          setError("Session expired or unauthorized. Please log in again.");
          navigate("/login");
        } else {
          setError(
            err.response?.data?.error ||
              "Failed to load data. Please try again."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleApprove = async (requestId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [requestId]: true }));
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.patch(
        `http://localhost:5000/api/membership-requests/${requestId}`,
        { status: "approved" },
        config
      );
      setMembershipRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: "approved" } : req
        )
      );
      setError(response.data.message || "Request approved successfully.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to approve request.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleReject = async (requestId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [requestId]: true }));
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.patch(
        `http://localhost:5000/api/membership-requests/${requestId}`,
        { status: "rejected" },
        config
      );
      setMembershipRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: "rejected" } : req
        )
      );
      setError(response.data.message || "Request rejected successfully.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reject request.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }));
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.patch(
        `http://localhost:5000/api/users/${userId}`,
        { role: newRole },
        config
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      setError(response.data.message || `User role updated to ${newRole}.`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update user role.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }));
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.delete(
        `http://localhost:5000/api/users/${userId}`,
        config
      );
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setError(response.data.message || "User deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete user.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-[Poppins]">
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
        <section className="py-12 bg-white">
          <div className="container mx-auto px-2 sm:px-4">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-bold text-center mb-8 text-[#456882]"
            >
              Membership Requests
            </motion.h2>
            {membershipRequests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center bg-gray-100 p-6 rounded-xl"
              >
                <p className="text-gray-700 mb-4 text-lg">
                  No pending membership requests.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
                {membershipRequests.map((request) => (
                  <MembershipRequestCard
                    key={request._id}
                    request={request}
                    handleApprove={handleApprove}
                    handleReject={handleReject}
                    isLoading={actionLoading}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
        <section className="py-12 bg-gradient-to-br from-[#456882]/10 to-gray-50">
          <div className="container mx-auto px-2 sm:px-4">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-bold text-center mb-8 text-[#456882]"
            >
              Manage Users
            </motion.h2>
            {users.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center bg-gray-100 p-6 rounded-xl"
              >
                <p className="text-gray-700 mb-4 text-lg">No users found.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
                {users.map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    handleUpdateRole={handleUpdateRole}
                    handleDeleteUser={handleDeleteUser}
                    isLoading={actionLoading}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
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
    </ErrorBoundary>
  );
};

export default ManageUsers;
