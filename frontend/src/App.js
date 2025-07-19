import React, { useState, useContext, createContext, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  Calendar,
  Users,
  Activity,
  DollarSign,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Video,
  MessageCircle,
  Stethoscope,
  Pill,
  TestTube,
  TrendingUp,
  AlertTriangle,
  Check,
  X,
  Plus,
  Edit,
  Trash2,
  Eye,
  Moon,
  Sun,
  Menu,
  Home,
  FileText,
  Settings,
  LogOut,
  Clock,
  MapPin,
  Phone,
  Mail,
  Heart,
  Shield,
  Star,
  ChevronDown,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleTheme = () => {
    setIsDark(!isDark);
    localStorage.setItem('theme', JSON.stringify(!isDark));
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (token) {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
        loadNotifications();
      }
    }
  }, [token]);

  const loadNotifications = async () => {
    try {
      const response = await axios.get(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success(`Welcome back, ${userData.name}!`);
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API}/auth/register`, userData);
      const { access_token, user: newUser } = response.data;
      
      setToken(access_token);
      setUser(newUser);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast.success(`Welcome to the system, ${newUser.name}!`);
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
      return { success: false, error: error.response?.data?.detail || 'Registration failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await axios.put(`${API}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      notifications, 
      unreadCount,
      loadNotifications,
      markNotificationRead 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// API Helper
const apiCall = async (endpoint, method = 'GET', data = null, token = null) => {
  const config = {
    method,
    url: `${API}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || 'Request failed' };
  }
};

// Enhanced Components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
    />
  </div>
);

const SearchBar = ({ onSearch, placeholder = "Search..." }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <div className="relative">
      <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600">
        <div className="pl-4">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="flex-1 px-4 py-3 bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <Filter className="h-5 w-5" />
        </button>
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition duration-200"
        >
          Search
        </button>
      </div>
      
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 p-4 z-10"
        >
          <div className="grid grid-cols-2 gap-4">
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>All Categories</option>
              <option>Patients</option>
              <option>Doctors</option>
              <option>Appointments</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Pending</option>
            </select>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const NotificationCenter = () => {
  const { notifications, unreadCount, markNotificationRead } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'appointment_reminder': return <Calendar className="h-4 w-4" />;
      case 'lab_result_ready': return <TestTube className="h-4 w-4" />;
      case 'bill_due': return <DollarSign className="h-4 w-4" />;
      case 'low_stock': return <AlertTriangle className="h-4 w-4" />;
      case 'emergency': return <Shield className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">{unreadCount} unread</span>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    green: "bg-green-500 text-green-600 bg-green-50 dark:bg-green-900/20",
    yellow: "bg-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
    red: "bg-red-500 text-red-600 bg-red-50 dark:bg-red-900/20",
    purple: "bg-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-900/20",
  };

  const [bgColor, textColor, cardBg] = colors[color].split(' ');

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`${cardBg} rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className={`h-4 w-4 ${trend === 'up' ? 'text-green-500' : 'text-red-500'} mr-1`} />
              <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue}% vs last month
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className={`h-8 w-8 text-white`} />
        </div>
      </div>
    </motion.div>
  );
};

const ChartContainer = ({ title, children, actions = null }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {actions && <div className="flex space-x-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
};

const LoginForm = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(formData.email, formData.password);
    setLoading(false);
  };

  const demoAccounts = [
    { role: 'Admin', email: 'admin@cityhospital.com', password: 'AdminPass123!' },
    { role: 'Doctor', email: 'cardio.smith@cityhospital.com', password: 'DocPass123!' },
    { role: 'Patient', email: 'john.patient@email.com', password: 'PatientPass123!' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Hospital Management</h1>
          <p className="text-gray-600 dark:text-gray-300">Advanced Healthcare System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Demo Accounts:</h3>
          <div className="grid gap-2">
            {demoAccounts.map((account, index) => (
              <button
                key={index}
                onClick={() => setFormData({ email: account.email, password: account.password })}
                className="text-left p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm transition duration-200"
              >
                <div className="font-medium text-gray-800 dark:text-gray-200">{account.role}</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs">{account.email}</div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: Home },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'patients', label: 'Patients', icon: Users, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'medical-records', label: 'Medical Records', icon: FileText },
    { id: 'lab-tests', label: 'Lab Tests', icon: TestTube },
    { id: 'inventory', label: 'Inventory', icon: Pill, roles: ['admin', 'nurse', 'pharmacist'] },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, roles: ['admin', 'doctor'] },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">HospitalCare</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">Management System</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">{user?.name?.charAt(0)}</span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="ml-auto w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isDark ? <Sun className="h-5 w-5 mr-3" /> : <Moon className="h-5 w-5 mr-3" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, loadNotifications } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="ml-4 lg:ml-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Welcome back, {user?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={loadNotifications}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          
          <NotificationCenter />
          
          <div className="flex items-center ml-4">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">{user?.name?.charAt(0)}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const AdvancedDashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    loadDashboardData();
  }, [token, timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    
    // Load stats
    const statsResult = await apiCall('/dashboard/stats', 'GET', null, token);
    if (statsResult.success) {
      setStats(statsResult.data);
    }
    
    // Load analytics
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(timeRange));
    
    const analyticsResult = await apiCall(
      `/analytics?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`,
      'GET',
      null,
      token
    );
    if (analyticsResult.success) {
      setAnalytics(analyticsResult.data);
    }
    
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  const chartData = analytics?.appointments_by_day?.map(item => ({
    date: new Date(item._id).toLocaleDateString(),
    appointments: item.count,
    revenue: analytics?.revenue_by_day?.find(r => r._id === item._id)?.total || 0
  })) || [];

  const pieData = analytics?.lab_tests_by_status?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.role === 'admin' && (
          <>
            <StatCard
              title="Total Patients"
              value={stats.total_patients || 0}
              icon={Users}
              color="blue"
              trend="up"
              trendValue={12}
            />
            <StatCard
              title="Total Revenue"
              value={`$${(stats.total_revenue || 0).toLocaleString()}`}
              icon={DollarSign}
              color="green"
              trend="up"
              trendValue={8}
            />
            <StatCard
              title="Appointments Today"
              value={stats.today_appointments || 0}
              icon={Calendar}
              color="purple"
              trend="up"
              trendValue={15}
            />
            <StatCard
              title="Low Stock Items"
              value={stats.low_stock_items || 0}
              icon={AlertTriangle}
              color="red"
              trend="down"
              trendValue={5}
            />
          </>
        )}
        
        {user?.role === 'patient' && (
          <>
            <StatCard
              title="My Appointments"
              value={stats.my_appointments || 0}
              icon={Calendar}
              color="blue"
            />
            <StatCard
              title="Upcoming"
              value={stats.upcoming_appointments || 0}
              icon={Clock}
              color="green"
            />
            <StatCard
              title="Medical Records"
              value={stats.my_medical_records || 0}
              icon={FileText}
              color="purple"
            />
            <StatCard
              title="Pending Bills"
              value={stats.pending_bills || 0}
              icon={DollarSign}
              color="yellow"
            />
          </>
        )}
        
        {user?.role === 'doctor' && (
          <>
            <StatCard
              title="My Patients"
              value={stats.my_patients || 0}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Today's Appointments"
              value={stats.today_appointments || 0}
              icon={Calendar}
              color="green"
            />
            <StatCard
              title="Lab Tests Ordered"
              value={stats.my_lab_tests || 0}
              icon={TestTube}
              color="purple"
            />
            <StatCard
              title="Total Appointments"
              value={stats.my_appointments || 0}
              icon={Activity}
              color="yellow"
            />
          </>
        )}
      </div>

      {/* Charts Section */}
      {(user?.role === 'admin' || user?.role === 'doctor') && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointments Trend */}
          <ChartContainer
            title="Appointments & Revenue Trend"
            actions={
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="appointments" stroke="#3B82F6" strokeWidth={2} />
                {user?.role === 'admin' && (
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Lab Tests Status */}
          <ChartContainer title="Lab Tests by Status">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {user?.role === 'patient' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-center"
              >
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <span className="text-sm font-medium">Book Appointment</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-center"
              >
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <span className="text-sm font-medium">View Records</span>
              </motion.button>
            </>
          )}
          
          {user?.role === 'doctor' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-center"
              >
                <Users className="h-8 w-8 mx-auto mb-2" />
                <span className="text-sm font-medium">View Patients</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-center"
              >
                <TestTube className="h-8 w-8 mx-auto mb-2" />
                <span className="text-sm font-medium">Order Lab Test</span>
              </motion.button>
            </>
          )}
          
          {user?.role === 'admin' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-center"
              >
                <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                <span className="text-sm font-medium">View Reports</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg text-center"
              >
                <Settings className="h-8 w-8 mx-auto mb-2" />
                <span className="text-sm font-medium">System Settings</span>
              </motion.button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdvancedDashboard />;
      case 'appointments':
        return <div className="p-8 text-center">🚧 Appointments Management - Coming Soon</div>;
      case 'patients':
        return <div className="p-8 text-center">👥 Patient Management - Coming Soon</div>;
      case 'doctors':
        return <div className="p-8 text-center">👨‍⚕️ Doctor Management - Coming Soon</div>;
      case 'medical-records':
        return <div className="p-8 text-center">📋 Medical Records - Coming Soon</div>;
      case 'lab-tests':
        return <div className="p-8 text-center">🧪 Lab Tests - Coming Soon</div>;
      case 'inventory':
        return <div className="p-8 text-center">💊 Inventory Management - Coming Soon</div>;
      case 'billing':
        return <div className="p-8 text-center">💰 Billing System - Coming Soon</div>;
      case 'analytics':
        return <div className="p-8 text-center">📊 Advanced Analytics - Coming Soon</div>;
      case 'settings':
        return <div className="p-8 text-center">⚙️ Settings - Coming Soon</div>;
      default:
        return <AdvancedDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <div className="flex-1 flex flex-col">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          <main className="flex-1 p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
};

const AppContent = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

  return <Dashboard />;
};

export default App;