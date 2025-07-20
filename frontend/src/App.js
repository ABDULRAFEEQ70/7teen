import React, { useState, useContext, createContext, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  Building2,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Bell,
  Search,
  Plus,
  Settings,
  LogOut,
  Menu,
  Home,
  FileText,
  Pill,
  Receipt,
  Users2,
  Activity,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle,
  Star,
  ShoppingBag,
  Stethoscope,
  Calendar,
  BarChart3,
  PieChart,
  Zap,
  Shield,
  Crown,
  Sparkles,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  ChevronDown,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building,
  CreditCard,
  Wallet,
  UserCheck,
  Tablets,
  FlaskConical,
  Truck,
  MessageSquare
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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('pharma-theme');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleTheme = () => {
    setIsDark(!isDark);
    localStorage.setItem('pharma-theme', JSON.stringify(!isDark));
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
  const [tenant, setTenant] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pharma-token'));
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (token) {
      const userData = localStorage.getItem('pharma-user');
      const tenantData = localStorage.getItem('pharma-tenant');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      if (tenantData) {
        setTenant(JSON.parse(tenantData));
      }
      loadNotifications();
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

  const login = async (email, password, subdomain) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { 
        email, 
        password, 
        subdomain: subdomain || null 
      });
      const { access_token, user: userData, tenant: tenantData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      setTenant(tenantData);
      localStorage.setItem('pharma-token', access_token);
      localStorage.setItem('pharma-user', JSON.stringify(userData));
      if (tenantData) {
        localStorage.setItem('pharma-tenant', JSON.stringify(tenantData));
      }
      
      toast.success(`Welcome to PharmaCloud, ${userData.name}!`);
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const registerTenant = async (tenantData) => {
    try {
      const response = await axios.post(`${API}/auth/register-tenant`, tenantData);
      toast.success('Pharmacy registered successfully! You can now create your first user account.');
      return { success: true, data: response.data };
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
      return { success: false, error: error.response?.data?.detail || 'Registration failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setTenant(null);
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('pharma-token');
    localStorage.removeItem('pharma-user');
    localStorage.removeItem('pharma-tenant');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      tenant,
      token, 
      login, 
      registerTenant,
      logout, 
      notifications, 
      unreadCount,
      loadNotifications
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

// Components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
    />
  </div>
);

const StatCard = ({ title, value, icon: Icon, change, changeType, color = "blue", onClick }) => {
  const colors = {
    blue: "from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600",
    green: "from-green-500 to-green-600 bg-green-50 dark:bg-green-900/20 text-green-600",
    yellow: "from-yellow-500 to-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600",
    red: "from-red-500 to-red-600 bg-red-50 dark:bg-red-900/20 text-red-600",
    purple: "from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600",
    indigo: "from-indigo-500 to-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600",
  };

  const [gradientColor, bgColor, textColor] = colors[color].split(' ');

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${bgColor} rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-300 hover:shadow-xl`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {changeType === 'increase' ? '↗' : '↘'} {change}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-4 bg-gradient-to-br ${gradientColor} rounded-xl shadow-lg`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

const NotificationDropdown = () => {
  const { notifications, unreadCount } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'low_stock': return <Package className="h-4 w-4" />;
      case 'expiry_alert': return <Clock className="h-4 w-4" />;
      case 'prescription_ready': return <CheckCircle className="h-4 w-4" />;
      case 'payment_due': return <DollarSign className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {unreadCount} unread
                </span>
              </div>
            </div>
            
            <div>
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
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

const SubscriptionBadge = ({ plan, status }) => {
  const planConfig = {
    starter: { color: 'bg-blue-100 text-blue-800', icon: Building, label: 'Starter' },
    professional: { color: 'bg-purple-100 text-purple-800', icon: Star, label: 'Professional' },
    enterprise: { color: 'bg-yellow-100 text-yellow-800', icon: Crown, label: 'Enterprise' }
  };

  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', label: 'Active' },
    trialing: { color: 'bg-blue-100 text-blue-800', label: 'Trial' },
    past_due: { color: 'bg-red-100 text-red-800', label: 'Past Due' },
    canceled: { color: 'bg-gray-100 text-gray-800', label: 'Canceled' }
  };

  const planInfo = planConfig[plan] || planConfig.starter;
  const statusInfo = statusConfig[status] || statusConfig.active;
  const PlanIcon = planInfo.icon;

  return (
    <div className="flex items-center space-x-2">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planInfo.color}`}>
        <PlanIcon className="h-3 w-3 mr-1" />
        {planInfo.label}
      </span>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    </div>
  );
};

const LoginForm = () => {
  const { login } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    subdomain: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(formData.email, formData.password, formData.subdomain);
    setLoading(false);
  };

  const demoAccounts = [
    { 
      role: 'Pharmacy Owner', 
      email: 'owner@mainstreetpharmacy.com', 
      password: 'Owner123!',
      subdomain: 'mainstreet'
    },
    { 
      role: 'Pharmacist', 
      email: 'pharmacist@mainstreetpharmacy.com', 
      password: 'Pharm123!',
      subdomain: 'mainstreet'
    },
    { 
      role: 'Cashier', 
      email: 'cashier@mainstreetpharmacy.com', 
      password: 'Cash123!',
      subdomain: 'mainstreet'
    }
  ];

  if (isRegistering) {
    return <TenantRegistrationForm onBack={() => setIsRegistering(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-10 transform translate-x-16 -translate-y-16"></div>
        
        <div className="relative">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Pill className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              PharmaCloud
            </h1>
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              Advanced Pharmacy SaaS Platform
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Pharmacy Subdomain (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-10"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                  placeholder="mainstreet"
                />
                <Building className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave empty for demo accounts</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                />
                <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                />
                <Shield className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-semibold disabled:opacity-50 transform hover:scale-105 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  Signing in...
                </div>
              ) : (
                'Sign In to PharmaCloud'
              )}
            </button>
          </form>
          
          <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
              Demo Accounts
            </h3>
            <div className="space-y-2">
              {demoAccounts.map((account, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({
                    email: account.email,
                    password: account.password,
                    subdomain: account.subdomain
                  })}
                  className="w-full text-left p-3 hover:bg-white dark:hover:bg-gray-500 rounded-xl text-sm transition duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                >
                  <div className="font-medium text-gray-800 dark:text-gray-200">{account.role}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">{account.email}</div>
                  <div className="text-blue-600 dark:text-blue-400 text-xs">@{account.subdomain}</div>
                </motion.button>
              ))}
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegistering(true)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-sm transition duration-200"
            >
              New to PharmaCloud? Start Your Free Trial →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const TenantRegistrationForm = ({ onBack }) => {
  const { registerTenant } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    subscription_plan: 'starter'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await registerTenant(formData);
    if (result.success) {
      // After successful registration, go back to login
      setTimeout(() => {
        onBack();
      }, 2000);
    }
    
    setLoading(false);
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$29/month',
      features: ['1 Store', 'Basic Inventory', 'POS System', 'Customer Management'],
      icon: Building,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$79/month',
      features: ['3 Stores', 'Advanced Analytics', 'Staff Management', 'Integrations'],
      icon: Star,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$199/month',
      features: ['Unlimited Stores', 'API Access', 'White Label', 'Priority Support'],
      icon: Crown,
      color: 'from-yellow-500 to-yellow-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-4xl"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Start Your Pharmacy Journey
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Join thousands of pharmacies already using PharmaCloud
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Pharmacy Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Main Street Pharmacy"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Subdomain
              </label>
              <div className="flex">
                <input
                  type="text"
                  required
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-l-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                  placeholder="mainstreet"
                />
                <span className="px-4 py-3 bg-gray-100 dark:bg-gray-600 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-xl text-gray-500 dark:text-gray-400 text-sm">
                  .pharmacloud.com
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Choose Your Plan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const isSelected = formData.subscription_plan === plan.id;
                
                return (
                  <motion.div
                    key={plan.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
                    }`}
                    onClick={() => setFormData({ ...formData, subscription_plan: plan.id })}
                  >
                    <div className="text-center">
                      <div className={`mx-auto w-12 h-12 bg-gradient-to-r ${plan.color} rounded-xl flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{plan.name}</h4>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{plan.price}</p>
                      <div className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ✨ 14-day free trial • No credit card required
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition duration-200 font-medium"
            >
              ← Back to Login
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 font-semibold disabled:opacity-50 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  Creating Pharmacy...
                </div>
              ) : (
                'Start Free Trial'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const { user, tenant, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['pharmacy_owner', 'pharmacy_manager', 'pharmacist', 'cashier'] },
    { id: 'pos', label: 'Point of Sale', icon: ShoppingCart, roles: ['cashier', 'pharmacist', 'pharmacy_technician'] },
    { id: 'inventory', label: 'Inventory', icon: Package, roles: ['pharmacy_owner', 'pharmacy_manager', 'pharmacist'] },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText, roles: ['pharmacist', 'pharmacy_technician', 'pharmacy_manager'] },
    { id: 'customers', label: 'Customers', icon: Users, roles: ['pharmacy_owner', 'pharmacy_manager', 'cashier', 'pharmacist'] },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, roles: ['pharmacy_owner', 'pharmacy_manager'] },
    { id: 'reports', label: 'Analytics & Reports', icon: BarChart3, roles: ['pharmacy_owner', 'pharmacy_manager'] },
    { id: 'staff', label: 'Staff Management', icon: Users2, roles: ['pharmacy_owner', 'pharmacy_manager'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['pharmacy_owner', 'pharmacy_manager'] },
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
        className={`fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-800 shadow-xl z-50 lg:relative lg:translate-x-0 border-r border-gray-200 dark:border-gray-700 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Pill className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">PharmaCloud</h2>
                {tenant && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">{tenant.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          {tenant && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <SubscriptionBadge plan={tenant.subscription_plan} status={tenant.subscription_status} />
            </div>
          )}

          {/* User Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-semibold text-sm">{user?.name?.charAt(0)}</span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.01, x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-white rounded-full shadow"
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
              className="w-full flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              {isDark ? <RefreshCw className="h-5 w-5 mr-3" /> : <RefreshCw className="h-5 w-5 mr-3" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden transition-colors"
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
          <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          <NotificationDropdown />
          
          <div className="flex items-center ml-4">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-medium text-sm">{user?.name?.charAt(0)}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const PharmacyDashboard = () => {
  const { user, tenant, token } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  const loadDashboardData = async () => {
    setLoading(true);
    const result = await apiCall('/dashboard/stats', 'GET', null, token);
    if (result.success) {
      setStats(result.data);
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  // Mock data for charts
  const salesData = [
    { name: 'Mon', sales: 1200, prescriptions: 45 },
    { name: 'Tue', sales: 1900, prescriptions: 52 },
    { name: 'Wed', sales: 800, prescriptions: 38 },
    { name: 'Thu', sales: 1600, prescriptions: 48 },
    { name: 'Fri', sales: 2100, prescriptions: 65 },
    { name: 'Sat', sales: 2400, prescriptions: 72 },
    { name: 'Sun', sales: 1100, prescriptions: 28 }
  ];

  const categoryData = [
    { name: 'Prescription', value: 60, color: '#3B82F6' },
    { name: 'Over Counter', value: 25, color: '#10B981' },
    { name: 'Supplements', value: 15, color: '#F59E0B' }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome to {tenant?.name || 'PharmaCloud'}!
            </h1>
            <p className="text-blue-100 text-lg">
              Your pharmacy operations at a glance
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
              <Pill className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Revenue"
          value={`$${(stats.today_revenue || 0).toLocaleString()}`}
          icon={DollarSign}
          change={15}
          changeType="increase"
          color="green"
        />
        <StatCard
          title="Total Customers"
          value={stats.total_customers || 0}
          icon={Users}
          change={8}
          changeType="increase"
          color="blue"
        />
        <StatCard
          title="Pending Prescriptions"
          value={stats.pending_prescriptions || 0}
          icon={FileText}
          color="yellow"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.low_stock_items || 0}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Weekly Sales Trend</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Sales
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                Prescriptions
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} dot={{ r: 6 }} />
              <Line yAxisId="right" type="monotone" dataKey="prescriptions" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl text-center shadow-lg"
          >
            <ShoppingCart className="h-8 w-8 mx-auto mb-3" />
            <span className="text-sm font-semibold">New Sale</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl text-center shadow-lg"
          >
            <Plus className="h-8 w-8 mx-auto mb-3" />
            <span className="text-sm font-semibold">Add Medicine</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl text-center shadow-lg"
          >
            <FileText className="h-8 w-8 mx-auto mb-3" />
            <span className="text-sm font-semibold">Fill Prescription</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl text-center shadow-lg"
          >
            <Users className="h-8 w-8 mx-auto mb-3" />
            <span className="text-sm font-semibold">Add Customer</span>
          </motion.button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { icon: ShoppingCart, text: 'Sale completed for $45.99', time: '5 minutes ago', color: 'text-green-600' },
            { icon: Package, text: 'Low stock alert: Paracetamol 500mg', time: '12 minutes ago', color: 'text-red-600' },
            { icon: Users, text: 'New customer registered: John Doe', time: '1 hour ago', color: 'text-blue-600' },
            { icon: FileText, text: 'Prescription filled: RX-2024-001', time: '2 hours ago', color: 'text-purple-600' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className={`p-2 ${activity.color.replace('text-', 'bg-').replace('-600', '-100')} rounded-lg mr-4`}>
                <activity.icon className={`h-5 w-5 ${activity.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white font-medium">{activity.text}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <PharmacyDashboard />;
      case 'pos':
        return <div className="p-8 text-center">🛒 Point of Sale System - Coming Soon</div>;
      case 'inventory':
        return <div className="p-8 text-center">📦 Inventory Management - Coming Soon</div>;
      case 'prescriptions':
        return <div className="p-8 text-center">📄 Prescription Management - Coming Soon</div>;
      case 'customers':
        return <div className="p-8 text-center">👥 Customer Management - Coming Soon</div>;
      case 'suppliers':
        return <div className="p-8 text-center">🚛 Supplier Management - Coming Soon</div>;
      case 'reports':
        return <div className="p-8 text-center">📊 Analytics & Reports - Coming Soon</div>;
      case 'staff':
        return <div className="p-8 text-center">👨‍💼 Staff Management - Coming Soon</div>;
      case 'settings':
        return <div className="p-8 text-center">⚙️ Settings - Coming Soon</div>;
      default:
        return <PharmacyDashboard />;
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
          
          <main className="flex-1 p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
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