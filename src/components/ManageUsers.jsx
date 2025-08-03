import React, { useEffect, useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaSpinner } from "react-icons/fa";
import { Search, ChevronDown } from "lucide-react";
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#456882] rounded-lg flex items-center justify-center text-white text-sm font-semibold">
            {request.userId?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              {request.userId?.name || "Unknown User"}
            </h4>
            <p className="text-xs text-gray-500">
              Club: {request.clubId?.name || "Unknown Club"}
            </p>
            <p className="text-xs text-gray-500">
              Email: {request.userId?.email || "N/A"}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            request.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : request.status === "approved"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {request.status || "Pending"}
        </span>
      </div>
      {request.status === "pending" && (
        <div className="flex gap-2 mt-2">
          <motion.button
            onClick={() => handleApprove(request._id)}
            disabled={isLoading[request._id]}
            whileHover={{ scale: isLoading[request._id] ? 1 : 1.05 }}
            whileTap={{ scale: isLoading[request._id] ? 1 : 0.95 }}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-1 rounded-lg text-xs text-white font-medium transition ${
              isLoading[request._id]
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
            aria-label={`Approve request for ${request.userId?.name || "user"} to join ${request.clubId?.name || "club"}`}
          >
            {isLoading[request._id] ? (
              <FaSpinner className="animate-spin w-3 h-3" />
            ) : (
              "Approve"
            )}
          </motion.button>
          <motion.button
            onClick={() => handleReject(request._id)}
            disabled={isLoading[request._id]}
            whileHover={{ scale: isLoading[request._id] ? 1 : 1.05 }}
            whileTap={{ scale: isLoading[request._id] ? 1 : 0.95 }}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-1 rounded-lg text-xs text-white font-medium transition ${
              isLoading[request._id]
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
            aria-label={`Reject request for ${request.userId?.name || "user"} to join ${request.clubId?.name || "club"}`}
          >
            {isLoading[request._id] ? (
              <FaSpinner className="animate-spin w-3 h-3" />
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
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
  >
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-sm font-semibold text-gray-900">
          {request.userId?.name || "Unknown User"}
        </h4>
        <p className="text-xs text-gray-500">
          Club: {request.clubId?.name || "Unknown Club"}
        </p>
        <p className="text-xs text-gray-500">
          Date: {new Date(request.updatedAt || request.createdAt).toLocaleString()}
        </p>
      </div>
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          request.status === "pending"
            ? "bg-yellow-100 text-yellow-700"
            : request.status === "approved"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {request.status || "Unknown"}
      </span>
    </div>
  </motion.div>
));

// Memoized UserCard Component
const UserCard = memo(
  ({ user, handleUpdateRole, handleDeleteUser, isLoading }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FaUser className="text-[#456882] w-5 h-5" />
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              {user.name || "Unknown User"}
            </h4>
            <p className="text-xs text-gray-500">Email: {user.email || "N/A"}</p>
            <p className="text-xs text-gray-500">Role: {user.role || "User"}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
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
          className={`flex-1 flex items-center justify-center gap-1 px-3 py-1 rounded-lg text-xs text-white font-medium transition ${
            isLoading[user._id] || user.role === "superAdmin"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#456882] hover:bg-[#334d5e]"
          }`}
          aria-label={`Change role for ${user.name || "user"}`}
        >
          {isLoading[user._id] ? (
            <FaSpinner className="animate-spin w-3 h-3" />
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
          className={`flex-1 flex items-center justify-center gap-1 px-3 py-1 rounded-lg text-xs text-white font-medium transition ${
            isLoading[user._id] || user.role === "superAdmin"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
          aria-label={`Delete ${user.name || "user"}`}
        >
          {isLoading[user._id] ? (
            <FaSpinner className="animate-spin w-3 h-3" />
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
  const [clubs, setClubs] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
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
        console.log("Fetching data with token:", token.slice(0, 10) + "...");

        // Fetch user, clubs, and requests in parallel
        const [
          userResponse,
          clubsResponse,
          requestsResponse,
          allRequestsResponse,
        ] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/user", config).catch((err) => {
            console.error("Error fetching user:", err.response?.data || err.message);
            throw err;
          }),
          axios.get("http://localhost:5000/api/clubs", config).catch((err) => {
            console.error("Error fetching clubs:", err.response?.data || err.message);
            return { data: [] };
          }),
          axios.get("http://localhost:5000/api/membership-requests?all=true", config).catch((err) => {
            console.error("Error fetching membership requests:", err.response?.data || err.message);
            return { data: [] };
          }),
          axios.get("http://localhost:5000/api/membership-requests?all=true", config).catch((err) => {
            console.error("Error fetching all membership requests:", err.response?.data || err.message);
            return { data: [] };
          }),
        ]);

        const userData = userResponse.data;
        setUser(userData);
        console.log("User Data:", {
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          isAdmin: userData.isAdmin,
          headCoordinatorClubs: userData.headCoordinatorClubs || [],
        });

        // Filter clubs user can manage
        const managedClubs = clubsResponse.data.filter(
          (club) =>
            (club.creator?._id?.toString() === userData._id?.toString()) ||
            (club.superAdmins?.some(
              (admin) => admin?._id?.toString() === userData._id?.toString()
            )) ||
            (userData.headCoordinatorClubs?.some((clubName) =>
              clubName.toLowerCase() === club.name?.toLowerCase()
            ))
        );
        setClubs(managedClubs);
        console.log("Managed Clubs:", managedClubs.map(c => ({
          _id: c._id,
          name: c.name,
          creator: c.creator?._id,
          superAdmins: c.superAdmins?.map(a => a._id),
        })));

        // Determine user roles
        const isGlobalAdmin = userData.isAdmin === true;
        const isSuperAdmin = managedClubs.some(
          (club) =>
            (club.creator?._id?.toString() === userData._id?.toString()) ||
            (club.superAdmins?.some(
              (admin) => admin?._id?.toString() === userData._id?.toString()
            ))
        );
        const isAdmin = userData.headCoordinatorClubs?.length > 0;
        console.log("Roles:", { isGlobalAdmin, isSuperAdmin, isAdmin });

        // Filter membership requests
        let filteredRequests = requestsResponse.data.filter(
          (request) => request.clubId?._id && request.userId?._id && request.status === "pending"
        );
        let filteredAllRequests = allRequestsResponse.data.filter(
          (request) => request.clubId?._id && request.userId?._id
        );

        if (!isGlobalAdmin) {
          const managedClubIds = managedClubs.map((club) => club._id?.toString());
          console.log("Managed Club IDs:", managedClubIds);
          filteredRequests = filteredRequests.filter(
            (request) =>
              request.clubId?._id && managedClubIds.includes(request.clubId._id.toString())
          );
          filteredAllRequests = filteredAllRequests.filter(
            (request) =>
              request.clubId?._id && managedClubIds.includes(request.clubId._id.toString())
          );
        }

        console.log("Filtered Pending Requests:", filteredRequests.map(r => ({
          _id: r._id,
          user: r.userId?.name,
          club: r.clubId?.name,
          status: r.status,
        })));
        console.log("Filtered All Requests:", filteredAllRequests.map(r => ({
          _id: r._id,
          user: r.userId?.name,
          club: r.clubId?.name,
          status: r.status,
        })));

        setMembershipRequests(filteredRequests);
        setAllMembershipRequests(
          filteredAllRequests.sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt) -
              new Date(a.updatedAt || a.createdAt)
          )
        );

        // Fetch users
        let allUsers = [];
        if (isGlobalAdmin) {
          const usersResponse = await axios.get("http://localhost:5000/api/users", config).catch((err) => {
            console.error("Error fetching users:", err.response?.data || err.message);
            return { data: [] };
          });
          allUsers = usersResponse.data.filter(
            (u) => u._id && u.name && u.email
          ).map((u) => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            role: u.role || "user",
          }));
        } else {
          const managedClubIds = managedClubs.map((club) => club._id.toString());
          console.log("Fetching members for clubs:", managedClubIds);
          const clubMembersPromises = managedClubIds.map((clubId) =>
            axios.get(`http://localhost:5000/api/clubs/${clubId}/members`, config).catch((err) => {
              console.error(`Error fetching members for club ${clubId}:`, err.response?.data || err.message);
              return { data: [] };
            })
          );

          const clubMembersResponses = await Promise.all(clubMembersPromises);
          const usersMap = new Map();
          managedClubs.forEach((club, index) => {
            const membersResponse = clubMembersResponses[index];
            console.log(`Members for club ${club._id} (${club.name}):`, membersResponse.data);
            membersResponse.data.forEach((member) => {
              if (member._id && member.name && member.email) {
                usersMap.set(member._id.toString(), {
                  _id: member._id,
                  name: member.name,
                  email: member.email,
                  role: member.role || "user",
                });
              }
            });

            if (club.superAdmins?.length > 0) {
              club.superAdmins.forEach((admin) => {
                if (admin._id && admin.name && admin.email) {
                  usersMap.set(admin._id.toString(), {
                    _id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: "superAdmin",
                  });
                }
              });
            }

            if (club.creator?._id && club.creator.name && club.creator.email) {
              usersMap.set(club.creator._id.toString(), {
                _id: club.creator._id,
                name: club.creator.name,
                email: club.creator.email,
                role: "superAdmin",
              });
            }
          });
          allUsers = Array.from(usersMap.values());
        }

        console.log("Filtered Users:", allUsers.map(u => ({
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
        })));
        setUsers(allUsers);

        if (managedClubs.length === 0 && allUsers.length === 0 && filteredRequests.length === 0) {
          setError("You do not have access to manage any clubs, users, or membership requests.");
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching data:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          setError("Session expired or unauthorized. Please log in again.");
          navigate("/login");
        } else {
          setError(err.response?.data?.error || "Failed to load data. Please try again.");
        }
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleApprove = async (requestId) => {
    if (!requestId || typeof requestId !== "string") {
      setError("Invalid request ID.");
      return;
    }
    try {
      setActionLoading((prev) => ({ ...prev, [requestId]: true }));
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      console.log("Approving request:", { requestId, status: "approved" });
      const response = await axios.patch(
        `http://localhost:5000/api/membership-requests/${requestId}`,
        { status: "approved" },
        config
      );
      console.log("Approve response:", response.data);
      const request = allMembershipRequests.find((req) => req._id === requestId);
      if (request) {
        setClubs((prev) =>
          prev.map((club) =>
            club._id === request.clubId?._id
              ? { ...club, memberCount: (club.memberCount || 0) + 1 }
              : club
          )
        );
      }
      setMembershipRequests((prev) =>
        prev.filter((req) => req._id !== requestId)
      );
      setAllMembershipRequests((prev) =>
        prev.map((req) =>
          req._id === requestId
            ? { ...req, status: "approved", updatedAt: new Date() }
            : req
        ).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      );
      setSuccess("Request approved successfully.");
    } catch (err) {
      console.error("Approve error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMessage = err.response?.data?.error || "Failed to approve request.";
      setError(errorMessage);
      if (errorMessage.includes("Club") && errorMessage.includes("not found")) {
        setMembershipRequests((prev) => prev.filter((req) => req._id !== requestId));
        setAllMembershipRequests((prev) => prev.filter((req) => req._id !== requestId));
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleReject = async (requestId) => {
    if (!requestId || typeof requestId !== "string") {
      setError("Invalid request ID.");
      return;
    }
    try {
      setActionLoading((prev) => ({ ...prev, [requestId]: true }));
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      console.log("Rejecting request:", { requestId, status: "rejected" });
      const response = await axios.patch(
        `http://localhost:5000/api/membership-requests/${requestId}`,
        { status: "rejected" },
        config
      );
      console.log("Reject response:", response.data);
      setMembershipRequests((prev) =>
        prev.filter((req) => req._id !== requestId)
      );
      setAllMembershipRequests((prev) =>
        prev.map((req) =>
          req._id === requestId
            ? { ...req, status: "rejected", updatedAt: new Date() }
            : req
        ).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      );
      setSuccess("Request rejected successfully.");
    } catch (err) {
      console.error("Reject error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMessage = err.response?.data?.error || "Failed to reject request.";
      setError(errorMessage);
      if (errorMessage.includes("Club") && errorMessage.includes("not found")) {
        setMembershipRequests((prev) => prev.filter((req) => req._id !== requestId));
        setAllMembershipRequests((prev) => prev.filter((req) => req._id !== requestId));
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }));
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      console.log("Updating role:", { userId, newRole });
      const response = await axios.patch(
        `http://localhost:5000/api/users/${userId}`,
        { role: newRole },
        config
      );
      console.log("Update role response:", response.data);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      setSuccess(`User role updated to ${newRole}.`);
    } catch (err) {
      console.error("Update role error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
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
      console.log("Deleting user:", { userId });
      const response = await axios.delete(
        `http://localhost:5000/api/users/${userId}`,
        config
      );
      console.log("Delete user response:", response.data);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setSuccess("User deleted successfully.");
    } catch (err) {
      console.error("Delete user error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.error || "Failed to delete user.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Memoized filtered data
  const filteredRequests = useMemo(
    () =>
      membershipRequests.filter(
        (request) =>
          request.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.clubId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [membershipRequests, searchTerm]
  );

  const filteredAllRequests = useMemo(
    () =>
      allMembershipRequests.filter(
        (request) =>
          request.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.clubId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      ).sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      ),
    [allMembershipRequests, searchTerm]
  );

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [users, searchTerm]
  );

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
        <Navbar user={user} role={user?.isAdmin ? "admin" : user?.role || "user"} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-[#456882]">
                  Manage Users
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome, {user?.name || "Admin"}! Manage membership requests and users.
                </p>
              </div>
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users or requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#456882] focus:border-[#456882]"
                />
              </div>
            </div>
          </motion.div>

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <p className="text-sm text-red-700">{error}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setError("")}
                    className="ml-auto text-red-600"
                  >
                    Dismiss
                  </motion.button>
                </div>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <p className="text-sm text-green-700">{success}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSuccess("")}
                    className="ml-auto text-green-600"
                  >
                    Dismiss
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Membership Requests */}
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Membership Requests
              {filteredRequests.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                  {filteredRequests.length} pending
                </span>
              )}
            </h2>
            {filteredRequests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <p className="text-sm text-gray-500">
                  No pending membership requests.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRequests.map((request) => (
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Membership Request History
              {filteredAllRequests.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  {filteredAllRequests.length} total
                </span>
              )}
            </h2>
            {filteredAllRequests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <p className="text-sm text-gray-500">
                  No request history available.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAllRequests.map((request) => (
                  <RequestHistoryCard key={request._id} request={request} />
                ))}
              </div>
            )}
          </section>

          {/* Manage Users */}
          <section className="bg-gradient-to-br  py-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Manage Users
              {filteredUsers.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  {filteredUsers.length} users
                </span>
              )}
            </h2>
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <p className="text-sm text-gray-500">No users found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
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
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ManageUsers;
