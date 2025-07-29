import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { XCircle, Download, AlertTriangle } from "lucide-react";

// Backend base URL (use environment variable in production)
const BASE_URL =  "http://localhost:5000";

const PresentStudentsModal = ({ isOpen, onClose, recordId, type = "event" }) => {
  const [presentStudents, setPresentStudents] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !recordId) return;

    const fetchPresentStudents = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found.");
        const endpoint = type === "event"
          ? `${BASE_URL}/api/attendance/${recordId}/present`
          : `${BASE_URL}/api/practice-attendance/${recordId}/present`;
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Present students response:", response.data); // Debug log
        const students = Array.isArray(response.data.presentStudents)
          ? response.data.presentStudents.map((student) => ({
              _id: student._id || `student-${Date.now()}`,
              name: student.name || "N/A",
              rollNo: student.rollNo || "N/A",
              email: student.email || "N/A",
              branch: student.branch || "N/A",
              semester: student.semester || "N/A",
            }))
          : [];
        setPresentStudents(students);
        setTitle(
          type === "event"
            ? response.data.event?.title || "Event"
            : response.data.lecture?.title || "Practice Session"
        );
      } catch (err) {
        console.error("Fetch present students error:", err);
        setError(err.response?.data?.error || "Failed to load present students.");
      } finally {
        setLoading(false);
      }
    };

    fetchPresentStudents();
  }, [isOpen, recordId, type]);

  const downloadPresentCSV = () => {
    const headers = ["Name", "Roll No", "Email", "Branch", "Semester"];
    const rows = presentStudents.map((student) => [
      `"${student.name || "N/A"}"`,
      `"${student.rollNo || "N/A"}"`,
      `"${student.email || "N/A"}"`,
      `"${student.branch || "N/A"}"`,
      `"${student.semester || "N/A"}"`,
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `present_students_${type}_${title.replace(/\s+/g, "_")}_${Date.now()}.csv`
    );
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Present Students for {type === "event" ? "Event" : "Practice Session"}: {title || "N/A"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-[#456882] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <p className="text-red-600 text-center py-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </p>
        ) : presentStudents.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No students were marked present for this {type === "event" ? "event" : "practice session"}.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {presentStudents.map((student, index) => (
                <div
                  key={student._id || `student-${index}`}
                  className="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#456882] to-[#5a7a98] rounded-lg flex items-center justify-center text-white text-lg font-semibold mr-3">
                    {student.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {student.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {student.rollNo || "N/A"} • {student.email || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {student.branch || "N/A"} • Sem {student.semester || "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={downloadPresentCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                disabled={presentStudents.length === 0}
              >
                <Download className="w-5 h-5" />
                Download CSV
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PresentStudentsModal;