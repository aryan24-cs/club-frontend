import React, { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaSpinner, FaClock } from "react-icons/fa";
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
const MembershipRequestCard = memo(
  ({ request, handleApprove, handleReject, isLoading }) => (
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
        Club: {request.clubId?.name || "Unknown Club"}
      </p>
      <p className="text-gray-600 text-sm mb-2">
        Status: {request.status || "Pending"}
      </p>
      {request.status === "pending" && (
        <div className="flex gap-2">
          <motion.button
            onClick={() => handleApprove(request._id)}
            disabled={isLoading[request._id]}
            whileHover={{ scale: isLoading[request._id] ? 1 : 1.05 }}
            whileTap={{ scale: isLoading[request._id] ? 1 : 0.95 }}
            className={`px-4 py-1 rounded-full font-semibold transition ${
              isLoading[request._id]
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-[#456882] text-white hover:bg-[#334d5e]"
            }`}
            aria-label={`Approve request for ${request.userId?.name} to join ${request.clubId?.name}`}
          >
            {isLoading[request._id] ? (
              <FaSpinner className="animate-spin inline-block mr-2" />
            ) : (
              "Approve"
            )}
          </motion.button>
          <motion.button
            onClick={() => handleReject(request._id)}
            disabled={isLoading[request._id]}
            whileHover={{ scale: isLoading[request._id] ? 1 : 1.05 }}
            whileTap={{ scale: isLoading[request._id] ? 1 : 0.95 }}
            className={`px-4 py-1 rounded-full font-semibold transition ${
              isLoading[request._id]
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
            aria-label={`Reject request for ${request.userId?.name} to join ${request.clubId?.name}`}
          >
            {isLoading[request._id] ? (
              <FaSpinner className="animate-spin inline-block mr-2" />
            ) : (
              "Reject"
            )}
          </motion.button>
        </div>
      )}
    </motion.div>
  )
);

// Memoized RequestHistoryCard Component
const RequestHistoryCard = memo(({ request }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ type: "spring", stiffness: 100, damping: 15 }}
    whileHover={{ scale: 1.03, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
    className="p-6 bg-white rounded-xl shadow-md border border-gray-200"
  >
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-lg font-semibold text-gray-900">
          {request.userId?.name || "Unknown User"}
        </h4>
        <p className="text-gray-600 text-sm mb-2">
          Club: {request.clubId?.name || "Unknown Club"}
        </p>
        <p className="text-gray-600 text-sm mb-2">
          Date:{" "}
          {new Date(request.updatedAt || request.createdAt).toLocaleString()}
        </p>
      </div>
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          request.status === "pending"
            ? "bg-yellow-100 text-yellow-700"
            : request.status === "approved"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {request.status}
      </span>
    </div>
  </motion.div>
));

// Memoized UserCard Component
const UserCard = memo(
  ({ user, handleUpdateRole, handleDeleteUser, isLoading }) => (
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
          disabled={isLoading[user._id] || user.role === "superAdmin"}
          whileHover={{
            scale: isLoading[user._id] || user.role === "superAdmin" ? 1 : 1.05,
          }}
          whileTap={{
            scale: isLoading[user._id] || user.role === "superAdmin" ? 1 : 0.95,
          }}
          className={`px-4 py-1 rounded-full font-semibold transition ${
            isLoading[user._id] || user.role === "superAdmin"
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
          disabled={isLoading[user._id] || user.role === "superAdmin"}
          whileHover={{
            scale: isLoading[user._id] || user.role === "superAdmin" ? 1 : 1.05,
          }}
          whileTap={{
            scale: isLoading[user._id] || user.role === "superAdmin" ? 1 : 0.95,
          }}
          className={`px-4 py-1 rounded-full font-semibold transition ${
            isLoading[user._id] || user.role === "superAdmin"
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
  )
);

const ManageUsers = () => {
  const [user, setUser] = useState(null);
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [allMembershipRequests, setAllMembershipRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
        const [
          userResponse,
          clubsResponse,
          requestsResponse,
          allRequestsResponse,
        ] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/user", config),
          axios.get("http://localhost:5000/api/clubs", config),
          axios.get("http://localhost:5000/api/membership-requests", config),
          axios.get(
            "http://localhost:5000/api/membership-requests?all=true",
            config
          ),
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

        // Filter clubs for super admins and admins
        const managedClubs = clubsResponse.data.filter(
          (club) =>
            club.creator?._id?.toString() === userData._id?.toString() ||
            club.superAdmins?.some(
              (admin) => admin?._id?.toString() === userData._id?.toString()
            ) ||
            userData.headCoordinatorClubs?.includes(club.name)
        );

        console.log("ManageUsers - Managed Clubs:", managedClubs);

        // Determine user role
        const isGlobalAdmin = userData.isAdmin;
        const isSuperAdmin = managedClubs.some(
          (club) =>
            club.creator?._id?.toString() === userData._id?.toString() ||
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
        let filteredAllRequests = allRequestsResponse.data;
        if (isGlobalAdmin) {
          console.log(
            "ManageUsers - Showing all membership requests for global admin"
          );
        } else if (isSuperAdmin || isAdmin) {
          const managedClubIds = managedClubs.map((club) =>
            club._id.toString()
          );
          filteredRequests = requestsResponse.data.filter(
            (request) =>
              request.clubId &&
              managedClubIds.includes(request.clubId._id.toString())
          );
          filteredAllRequests = allRequestsResponse.data.filter(
            (request) =>
              request.clubId &&
              managedClubIds.includes(request.clubId._id.toString())
          );
          console.log(
            "ManageUsers - Filtered membership requests:",
            filteredRequests
          );
          console.log(
            "ManageUsers - Filtered all membership requests:",
            filteredAllRequests
          );
        } else {
          filteredRequests = [];
          filteredAllRequests = [];
          console.log("ManageUsers - No membership requests for user");
        }

        setMembershipRequests(filteredRequests);
        setAllMembershipRequests(
          filteredAllRequests.sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt) -
              new Date(a.updatedAt || a.createdAt)
          )
        );

        // Fetch and filter users
        const managedClubIds = managedClubs.map((club) => club._id.toString());
        const clubMembersPromises = managedClubIds.map((clubId) =>
          axios.get(`http://localhost:5000/api/clubs/${clubId}/members`, config)
        );
        const clubMembersResponses = await Promise.all(
          clubMembersPromises.map((promise) =>
            promise.catch((err) => {
              console.error(`Error fetching members for club:`, err);
              return { data: [] };
            })
          )
        );

        // Collect all users from members, superAdmins, and creator
        const allUsers = new Map();
        managedClubs.forEach((club) => {
          // Add members
          const membersResponse = clubMembersResponses.find(
            (res, index) => managedClubIds[index] === club._id.toString()
          );
          membersResponse?.data.forEach((member) => {
            allUsers.set(member._id.toString(), {
              _id: member._id,
              name: member.name,
              email: member.email,
              role: member.role || "user",
            });
          });

          // Add superAdmins
          club.superAdmins?.forEach((admin) => {
            allUsers.set(admin._id.toString(), {
              _id: admin._id,
              name: admin.name,
              email: admin.email,
              role: "superAdmin",
            });
          });

          // Add creator
          if (club.creator) {
            allUsers.set(club.creator._id.toString(), {
              _id: club.creator._id,
              name: club.creator.name,
              email: club.creator.email,
              role: "superAdmin",
            });
          }
        });

        const filteredUsers = Array.from(allUsers.values());
        console.log("ManageUsers - Filtered users:", filteredUsers);
        setUsers(filteredUsers);

        // Set error if no data is available
        if (
          managedClubs.length === 0 &&
          filteredUsers.length === 0 &&
          filteredRequests.length === 0
        ) {
          setError(
            "You do not have access to manage any clubs, users, or membership requests."
          );
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching data:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
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
        prev.filter((req) => req._id !== requestId)
      );
      setAllMembershipRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: "approved" } : req
        )
      );
      setSuccess("Request approved successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to approve request.");
      setTimeout(() => setError(""), 3000);
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
        prev.filter((req) => req._id !== requestId)
      );
      setAllMembershipRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: "rejected" } : req
        )
      );
      setSuccess("Request rejected successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reject request.");
      setTimeout(() => setError(""), 3000);
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
      setSuccess(`User role updated to ${newRole}.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update user role.");
      setTimeout(() => setError(""), 3000);
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
      setSuccess("User deleted successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete user.");
      setTimeout(() => setError(""), 3000);
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
        <div className="container mx-auto px-2 sm:px-4 py-12">
          {/* Membership Requests */}
          <section className="mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-bold text-center mb-8 text-[#456882]"
            >
              Membership Requests
              {membershipRequests.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                  {membershipRequests.length} pending
                </span>
              )}
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
          </section>

          {/* Request History */}
          <section className="mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-bold text-center mb-8 text-[#456882]"
            >
              Membership Request History
              {allMembershipRequests.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  {allMembershipRequests.length} total
                </span>
              )}
            </motion.h2>
            {allMembershipRequests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center bg-gray-100 p-6 rounded-xl"
              >
                <p className="text-gray-700 mb-4 text-lg">
                  No request history available.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
                {allMembershipRequests.map((request) => (
                  <RequestHistoryCard key={request._id} request={request} />
                ))}
              </div>
            )}
          </section>

          {/* Manage Users */}
          <section className="bg-gradient-to-br from-[#456882]/10 to-gray-50 py-12">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-bold text-center mb-8 text-[#456882]"
            >
              Manage Users
              {users.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  {users.length} users
                </span>
              )}
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
          </section>

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed bottom-4 right-4 bg-red-600 text-white rounded-lg p-4 shadow-lg"
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
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed bottom-4 right-4 bg-[#456882] text-white rounded-lg p-4 shadow-lg"
              >
                <p className="text-sm">{success}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-2 text-white underline"
                  onClick={() => setSuccess("")}
                  aria-label="Dismiss success"
                >
                  Dismiss
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ManageUsers;
