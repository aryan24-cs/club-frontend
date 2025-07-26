import React, { useState, useEffect, memo, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Mail,
  User,
  MessageSquare,
  Search,
  Filter,
  ChevronDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Reply,
  Archive,
  Trash2,
  Calendar,
  Users,
  MessageCircle,
  Download,
  RefreshCw,
  Star,
  MoreHorizontal,
  Send,
  ArrowLeft,
} from "lucide-react";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-red-600 mb-4">Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Stats Card Component
const StatsCard = memo(({ title, value, icon: Icon, color = "text-[#456882]", bgColor = "bg-white", trend = null }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`${bgColor} rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-300 hover:shadow-md`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {trend && (
          <p className={`text-xs mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? '↗' : '↘'} {trend.value} from last week
          </p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-[#456882] to-[#5a7a98] flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
));

// Message Card Component
const MessageCard = memo(({ message, onView, onReply, onMarkRead, onArchive, onDelete, index }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'read': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'replied': return 'bg-green-100 text-green-700 border-green-200';
      case 'archived': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-md group
        ${message.status === 'new' ? 'border-l-4 border-l-blue-500' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-[#456882] to-[#5a7a98] rounded-xl flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
            {message.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{message.name}</h3>
              {message.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
            </div>
            <p className="text-sm text-gray-600 truncate">{message.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(message.status)}`}>
                {message.status}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(message.priority)}`}>
                {message.priority} priority
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(message)}
            className="p-2 text-gray-400 hover:text-[#456882] hover:bg-gray-100 rounded-lg transition-colors"
            title="View message"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onReply(message)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Reply"
          >
            <Reply className="w-4 h-4" />
          </button>
          <div className="relative group/more">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all duration-200 z-10">
              <button
                onClick={() => onMarkRead(message)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as {message.status === 'read' ? 'unread' : 'read'}
              </button>
              <button
                onClick={() => onArchive(message)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Archive className="w-4 h-4" />
                Archive
              </button>
              <button
                onClick={() => onDelete(message)}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-700 line-clamp-2">{message.message}</p>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(message.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        {message.club && (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
            {message.club}
          </span>
        )}
      </div>
    </motion.div>
  );
});

// Message Detail Modal Component
const MessageDetailModal = memo(({ message, isOpen, onClose, onReply }) => {
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    
    setIsReplying(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Reply sent:', replyText);
      setReplyText('');
      onReply(message, replyText);
      onClose();
    } catch (err) {
      console.error('Reply error:', err);
    } finally {
      setIsReplying(false);
    }
  };

  if (!isOpen || !message) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Message Details</h2>
                <p className="text-sm text-gray-600">From {message.name}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#456882] to-[#5a7a98] rounded-lg flex items-center justify-center text-white font-semibold">
                  {message.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{message.name}</h3>
                  <p className="text-sm text-gray-600">{message.email}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-3">
                {new Date(message.createdAt).toLocaleString()}
              </div>
              <div className="text-gray-800 whitespace-pre-wrap">
                {message.message}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reply to {message.name}</h3>
            <div className="space-y-4">
              <div>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#456882] focus:border-[#456882] transition-all duration-300 resize-none"
                  rows="6"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || isReplying}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300
                    ${!replyText.trim() || isReplying
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#456882] text-white hover:bg-[#334d5e] shadow-lg hover:shadow-xl'
                    }
                  `}
                >
                  {isReplying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Reply
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

const AdminContactPanel = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Sample data - replace with your actual API calls
  const [sampleMessages] = useState([
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@college.edu',
      message: 'I am having trouble accessing the coding club dashboard. The login page keeps redirecting me back to the homepage. Can you please help me resolve this issue?',
      status: 'new',
      priority: 'high',
      createdAt: new Date().toISOString(),
      club: 'Coding Club',
      isStarred: true,
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob@college.edu',
      message: 'Hello, I would like to know more about the photography club events and how to participate in upcoming workshops.',
      status: 'read',
      priority: 'medium',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      club: 'Photography Club',
      isStarred: false,
    },
    {
      id: 3,
      name: 'Carol Davis',
      email: 'carol@college.edu',
      message: 'The attendance system is not working properly. When I try to mark attendance, it shows a server error.',
      status: 'replied',
      priority: 'high',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      club: 'Drama Club',
      isStarred: false,
    },
    {
      id: 4,
      name: 'David Wilson',
      email: 'david@college.edu',
      message: 'Can you provide information about membership fees and payment options for joining multiple clubs?',
      status: 'read',
      priority: 'low',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      club: null,
      isStarred: false,
    },
    {
      id: 5,
      name: 'Eve Brown',
      email: 'eve@college.edu',
      message: 'I accidentally deleted my profile information. Is there a way to recover it or do I need to re-enter everything?',
      status: 'new',
      priority: 'medium',
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      club: 'Music Club',
      isStarred: false,
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          navigate('/login');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch user data
        const userResponse = await axios.get('http://localhost:5000/api/auth/user', config);
        setUser(userResponse.data);

        // Check if user is admin
        if (!userResponse.data.isAdmin) {
          setError('You do not have admin access.');
          navigate('/dashboard');
          return;
        }

        // Fetch contact messages
        // const messagesResponse = await axios.get('http://localhost:5000/api/admin/contact-messages', config);
        // setMessages(messagesResponse.data);
        
        // For now, use sample data
        setMessages(sampleMessages);

        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          setError('Session expired or unauthorized. Please log in again.');
          navigate('/login');
        } else {
          setError(err.response?.data?.error || 'Failed to load data.');
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, sampleMessages]);

  const stats = useMemo(() => {
    const total = messages.length;
    const newMessages = messages.filter(m => m.status === 'new').length;
    const replied = messages.filter(m => m.status === 'replied').length;
    const highPriority = messages.filter(m => m.priority === 'high').length;
    
    return {
      total,
      new: newMessages,
      replied,
      highPriority,
    };
  }, [messages]);

  const filteredMessages = useMemo(() => {
    return messages.filter(message => {
      const matchesSearch = message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           message.message.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || message.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [messages, searchTerm, statusFilter, priorityFilter]);

  const handleViewMessage = useCallback((message) => {
    setSelectedMessage(message);
    setShowDetailModal(true);
    
    // Mark as read if it's new
    if (message.status === 'new') {
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, status: 'read' } : m
      ));
    }
  }, []);

  const handleReplyMessage = useCallback((message, replyText = '') => {
    if (replyText) {
      // Update message status to replied
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, status: 'replied' } : m
      ));
      setSuccess(`Reply sent to ${message.name} successfully!`);
    } else {
      setSelectedMessage(message);
      setShowDetailModal(true);
    }
  }, []);

  const handleMarkRead = useCallback((message) => {
    const newStatus = message.status === 'read' ? 'new' : 'read';
    setMessages(prev => prev.map(m => 
      m.id === message.id ? { ...m, status: newStatus } : m
    ));
    setSuccess(`Message marked as ${newStatus}!`);
  }, []);

  const handleArchiveMessage = useCallback((message) => {
    setMessages(prev => prev.map(m => 
      m.id === message.id ? { ...m, status: 'archived' } : m
    ));
    setSuccess(`Message from ${message.name} archived!`);
  }, []);

  const handleDeleteMessage = useCallback((message) => {
    if (window.confirm(`Delete message from ${message.name}? This cannot be undone.`)) {
      setMessages(prev => prev.filter(m => m.id !== message.id));
      setSuccess(`Message from ${message.name} deleted!`);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Messages refreshed successfully!');
    } catch (err) {
      setError('Failed to refresh messages.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExportMessages = useCallback(() => {
    const csvContent = [
      ['Name', 'Email', 'Status', 'Priority', 'Club', 'Date', 'Message'],
      ...filteredMessages.map(message => [
        message.name,
        message.email,
        message.status,
        message.priority,
        message.club || 'N/A',
        new Date(message.createdAt).toLocaleDateString(),
        message.message.replace(/,/g, ';') // Replace commas to avoid CSV issues
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contact_messages_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }, [filteredMessages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-white shadow-sm"></div>
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-[#456882] flex items-center gap-3">
                  <MessageCircle className="w-8 h-8" />
                  Contact Management
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage and respond to user messages and support requests
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button
                  onClick={handleExportMessages}
                  className="flex items-center gap-2 px-4 py-2 bg-[#456882] text-white rounded-xl hover:bg-[#334d5e] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
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
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700 flex-1">{error}</p>
                  <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
                    <XCircle className="w-5 h-5" />
                  </button>
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
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700 flex-1">{success}</p>
                  <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Messages"
              value={stats.total}
              icon={MessageSquare}
            />
            <StatsCard
              title="New Messages"
              value={stats.new}
              icon={Mail}
              color="text-blue-600"
            />
            <StatsCard
              title="Replied"
              value={stats.replied}
              icon={CheckCircle}
              color="text-green-600"
            />
            <StatsCard
              title="High Priority"
              value={stats.highPriority}
              icon={AlertTriangle}
              color="text-red-600"
            />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#456882] focus:border-[#456882] transition-all duration-300"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#456882] focus:border-[#456882] bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#456882] focus:border-[#456882] bg-white"
                  >
                    <option value="all">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Messages ({filteredMessages.length})
              </h2>
              {filteredMessages.length !== messages.length && (
                <p className="text-sm text-gray-600">
                  Showing {filteredMessages.length} of {messages.length} messages
                </p>
              )}
            </div>
            
            {filteredMessages.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Try adjusting your filters or search terms.'
                    : 'No contact messages have been received yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMessages.map((message, index) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    index={index}
                    onView={handleViewMessage}
                    onReply={handleReplyMessage}
                    onMarkRead={handleMarkRead}
                    onArchive={handleArchiveMessage}
                    onDelete={handleDeleteMessage}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination could go here if needed */}
          {filteredMessages.length > 10 && (
            <div className="mt-8 flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-3">
                <p className="text-sm text-gray-600">
                  Showing all {filteredMessages.length} messages
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Message Detail Modal */}
        <AnimatePresence>
          <MessageDetailModal
            message={selectedMessage}
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedMessage(null);
            }}
            onReply={handleReplyMessage}
          />
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default AdminContactPanel;