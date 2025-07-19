import React, { useState, useContext, createContext, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

  useEffect(() => {
    if (token) {
      // Verify token and get user info
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
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
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Registration failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
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
const LoginForm = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🏥 Hospital Management</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
            />
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <p><strong>Demo Accounts:</strong></p>
          <p>Admin: admin@cityhospital.com / AdminPass123!</p>
          <p>Doctor: cardio.smith@cityhospital.com / DocPass123!</p>
          <p>Patient: john.patient@email.com / PatientPass123!</p>
        </div>
        
        <div className="mt-6 text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};

const RegisterForm = ({ onBack }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    phone: '',
    address: '',
    date_of_birth: '',
    emergency_contact: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submitData = { ...formData };
    if (submitData.date_of_birth) {
      submitData.date_of_birth = new Date(submitData.date_of_birth).toISOString();
    }

    const result = await register(submitData);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join our hospital management system</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="receptionist">Receptionist</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            />
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={onBack}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

const AppointmentBookingModal = ({ doctor, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    appointment_date: '',
    appointment_time: '',
    reason: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Combine date and time
      const appointmentDateTime = new Date(`${formData.appointment_date}T${formData.appointment_time}:00`);
      
      const appointmentData = {
        doctor_id: doctor.id,
        appointment_date: appointmentDateTime.toISOString(),
        reason: formData.reason,
        notes: formData.notes || null
      };

      const result = await apiCall('/appointments', 'POST', appointmentData, token);
      
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to book appointment');
    }
    
    setLoading(false);
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];
  
  // Generate time slots
  const timeSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(timeString);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Book Appointment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800">{doctor.name}</h3>
          <p className="text-blue-600">{doctor.specialization}</p>
          <p className="text-sm text-blue-500">Fee: ${doctor.consultation_fee}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              required
              min={today}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={formData.appointment_date}
              onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <select
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={formData.appointment_time}
              onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
            >
              <option value="">Select time</option>
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
            <textarea
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Describe your symptoms or reason for visit"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
            <textarea
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information"
            />
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MedicalRecordModal = ({ patient, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    diagnosis: '',
    symptoms: '',
    treatment: '',
    prescriptions: '',
    vital_signs: {
      blood_pressure: '',
      temperature: '',
      heart_rate: '',
      respiratory_rate: ''
    },
    notes: '',
    follow_up_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const recordData = {
        patient_id: patient.id,
        diagnosis: formData.diagnosis,
        symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(s => s),
        treatment: formData.treatment,
        prescriptions: formData.prescriptions ? formData.prescriptions.split('\n').map(p => {
          const parts = p.trim().split(' - ');
          return {
            medication: parts[0] || p.trim(),
            dosage: parts[1] || '',
            frequency: parts[2] || ''
          };
        }).filter(p => p.medication) : [],
        vital_signs: Object.fromEntries(
          Object.entries(formData.vital_signs).filter(([_, value]) => value.trim() !== '')
        ),
        notes: formData.notes || null,
        follow_up_date: formData.follow_up_date ? new Date(formData.follow_up_date).toISOString() : null
      };

      const result = await apiCall('/medical-records', 'POST', recordData, token);
      
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to create medical record');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Add Medical Record</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="mb-4 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800">Patient: {patient.name}</h3>
          <p className="text-green-600">ID: {patient.id}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                placeholder="Primary diagnosis"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms (comma-separated)</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                placeholder="fever, headache, fatigue"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Treatment</label>
            <textarea
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              placeholder="Treatment plan and procedures"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prescriptions (one per line: Medicine - Dosage - Frequency)</label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              value={formData.prescriptions}
              onChange={(e) => setFormData({ ...formData, prescriptions: e.target.value })}
              placeholder="Amoxicillin - 500mg - Twice daily&#10;Paracetamol - 650mg - As needed for fever"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vital Signs</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <input
                type="text"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                value={formData.vital_signs.blood_pressure}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  vital_signs: { ...formData.vital_signs, blood_pressure: e.target.value }
                })}
                placeholder="Blood Pressure"
              />
              <input
                type="text"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                value={formData.vital_signs.temperature}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  vital_signs: { ...formData.vital_signs, temperature: e.target.value }
                })}
                placeholder="Temperature (°F)"
              />
              <input
                type="text"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                value={formData.vital_signs.heart_rate}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  vital_signs: { ...formData.vital_signs, heart_rate: e.target.value }
                })}
                placeholder="Heart Rate (bpm)"
              />
              <input
                type="text"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                value={formData.vital_signs.respiratory_rate}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  vital_signs: { ...formData.vital_signs, respiratory_rate: e.target.value }
                })}
                placeholder="Respiratory Rate"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                value={formData.follow_up_date}
                onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
              />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout, token } = useAuth();
  const [stats, setStats] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  const loadDashboardData = async () => {
    setLoading(true);
    
    // Load stats
    const statsResult = await apiCall('/dashboard/stats', 'GET', null, token);
    if (statsResult.success) {
      setStats(statsResult.data);
    }
    
    // Load appointments
    const appointmentsResult = await apiCall('/appointments/my', 'GET', null, token);
    if (appointmentsResult.success) {
      setAppointments(appointmentsResult.data);
    }
    
    // Load doctors for patients
    if (user.role === 'patient' || user.role === 'admin') {
      const doctorsResult = await apiCall('/doctors', 'GET', null, token);
      if (doctorsResult.success) {
        setDoctors(doctorsResult.data);
      }
    }

    // Load medical records for patients
    if (user.role === 'patient') {
      const recordsResult = await apiCall(`/medical-records/patient/${user.id}`, 'GET', null, token);
      if (recordsResult.success) {
        setMedicalRecords(recordsResult.data);
      }
    }

    // Load inventory for authorized roles
    if (['admin', 'doctor', 'nurse'].includes(user.role)) {
      const inventoryResult = await apiCall('/inventory', 'GET', null, token);
      if (inventoryResult.success) {
        setInventory(inventoryResult.data);
      }
    }

    // Load bills for patients
    if (user.role === 'patient') {
      const billsResult = await apiCall(`/bills/patient/${user.id}`, 'GET', null, token);
      if (billsResult.success) {
        setBills(billsResult.data);
      }
    }
    
    setLoading(false);
  };

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const handleAddMedicalRecord = (patient) => {
    setSelectedPatient(patient);
    setShowMedicalRecordModal(true);
  };

  const StatCard = ({ title, value, color, icon }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value || 0}</p>
        </div>
        <div className={`text-3xl ${color.includes('blue') ? 'text-blue-500' : color.includes('green') ? 'text-green-500' : color.includes('purple') ? 'text-purple-500' : color.includes('red') ? 'text-red-500' : 'text-orange-500'}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const AppointmentCard = ({ appointment }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800">
          {user.role === 'patient' ? appointment.doctor_name : appointment.patient_name}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' :
          appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {appointment.status}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{appointment.reason}</p>
      <p className="text-sm text-gray-500">
        {new Date(appointment.appointment_date).toLocaleDateString()} at{' '}
        {new Date(appointment.appointment_date).toLocaleTimeString()}
      </p>
      {appointment.doctor_specialization && user.role === 'patient' && (
        <p className="text-xs text-blue-600 mt-1">{appointment.doctor_specialization}</p>
      )}
      {user.role === 'doctor' && appointment.status === 'scheduled' && (
        <div className="mt-3 flex space-x-2">
          <button
            onClick={() => handleAddMedicalRecord({ id: appointment.patient_id || appointment.patient_name, name: appointment.patient_name })}
            className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition duration-200"
          >
            Add Medical Record
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏥 Hospital Management</h1>
              <p className="text-sm text-gray-600">Welcome, {user.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                {user.role}
              </span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'appointments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📅 Appointments
            </button>
            {user.role === 'patient' && (
              <>
                <button
                  onClick={() => setActiveTab('doctors')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'doctors'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  👨‍⚕️ Book Appointment
                </button>
                <button
                  onClick={() => setActiveTab('medical-records')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'medical-records'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📋 Medical Records
                </button>
                <button
                  onClick={() => setActiveTab('bills')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'bills'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  💰 Bills
                </button>
              </>
            )}
            {['admin', 'doctor', 'nurse'].includes(user.role) && (
              <button
                onClick={() => setActiveTab('inventory')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inventory'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📦 Inventory
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div>
            {activeTab === 'overview' && (
              <div>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {user.role === 'admin' && (
                    <>
                      <StatCard 
                        title="Total Patients" 
                        value={stats.total_patients} 
                        color="border-blue-500" 
                        icon="👥"
                      />
                      <StatCard 
                        title="Total Doctors" 
                        value={stats.total_doctors} 
                        color="border-green-500" 
                        icon="👨‍⚕️"
                      />
                      <StatCard 
                        title="Today's Appointments" 
                        value={stats.today_appointments} 
                        color="border-purple-500" 
                        icon="📅"
                      />
                      <StatCard 
                        title="Total Revenue" 
                        value={`$${stats.total_revenue?.toLocaleString() || 0}`} 
                        color="border-green-500" 
                        icon="💰"
                      />
                      <StatCard 
                        title="Pending Bills" 
                        value={stats.pending_bills} 
                        color="border-orange-500" 
                        icon="📋"
                      />
                      <StatCard 
                        title="Low Stock Items" 
                        value={stats.low_stock_items} 
                        color="border-red-500" 
                        icon="⚠️"
                      />
                    </>
                  )}
                  {user.role === 'doctor' && (
                    <>
                      <StatCard 
                        title="My Appointments" 
                        value={stats.my_appointments} 
                        color="border-blue-500" 
                        icon="📅"
                      />
                      <StatCard 
                        title="Today's Appointments" 
                        value={stats.today_appointments} 
                        color="border-green-500" 
                        icon="📋"
                      />
                      <StatCard 
                        title="My Patients" 
                        value={stats.my_patients} 
                        color="border-purple-500" 
                        icon="👥"
                      />
                    </>
                  )}
                  {user.role === 'patient' && (
                    <>
                      <StatCard 
                        title="My Appointments" 
                        value={stats.my_appointments} 
                        color="border-blue-500" 
                        icon="📅"
                      />
                      <StatCard 
                        title="Upcoming Appointments" 
                        value={stats.upcoming_appointments} 
                        color="border-green-500" 
                        icon="🕒"
                      />
                      <StatCard 
                        title="My Bills" 
                        value={stats.my_bills} 
                        color="border-purple-500" 
                        icon="💰"
                      />
                      <StatCard 
                        title="Pending Bills" 
                        value={stats.pending_bills} 
                        color="border-red-500" 
                        icon="⚠️"
                      />
                    </>
                  )}
                </div>

                {/* Recent Appointments */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Appointments</h2>
                  <div className="grid gap-4">
                    {appointments.slice(0, 5).map((appointment) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                    {appointments.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No appointments found</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">All Appointments</h2>
                <div className="grid gap-4">
                  {appointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                  {appointments.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No appointments found</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'doctors' && user.role === 'patient' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Available Doctors</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {doctors.map((doctor) => (
                    <div key={doctor.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{doctor.name}</h3>
                      <p className="text-blue-600 font-medium mb-2">{doctor.specialization}</p>
                      <p className="text-sm text-gray-600 mb-2">{doctor.qualification}</p>
                      <p className="text-sm text-gray-600 mb-2">{doctor.experience_years} years experience</p>
                      <p className="text-sm text-gray-600 mb-4">Fee: ${doctor.consultation_fee}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          <p>{doctor.available_from} - {doctor.available_to}</p>
                          <p>{doctor.available_days.join(', ')}</p>
                        </div>
                        <button 
                          onClick={() => handleBookAppointment(doctor)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-sm"
                        >
                          Book Appointment
                        </button>
                      </div>
                    </div>
                  ))}
                  {doctors.length === 0 && (
                    <p className="text-gray-500 text-center py-8 col-span-full">No doctors found</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'medical-records' && user.role === 'patient' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">My Medical Records</h2>
                <div className="space-y-4">
                  {medicalRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{record.diagnosis}</h3>
                        <span className="text-sm text-gray-500">
                          {new Date(record.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Symptoms: {record.symptoms.join(', ')}</p>
                      <p className="text-sm text-gray-700 mb-3">{record.treatment}</p>
                      {record.prescriptions.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Prescriptions:</h4>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {record.prescriptions.map((prescription, index) => (
                              <li key={index}>
                                {prescription.medication} - {prescription.dosage} - {prescription.frequency}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {record.vital_signs && Object.keys(record.vital_signs).length > 0 && (
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          Vitals: {Object.entries(record.vital_signs).map(([key, value]) => 
                            `${key}: ${value}`
                          ).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                  {medicalRecords.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No medical records found</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'inventory' && ['admin', 'doctor', 'nurse'].includes(user.role) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Inventory Management</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min. Threshold</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost/Unit</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventory.map((item) => (
                        <tr key={item.id} className={item.quantity <= item.minimum_threshold ? 'bg-red-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.supplier}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{item.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity} {item.unit}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.minimum_threshold}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.quantity <= item.minimum_threshold 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {item.quantity <= item.minimum_threshold ? 'Low Stock' : 'In Stock'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.cost_per_unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {inventory.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No inventory items found</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'bills' && user.role === 'patient' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">My Bills</h2>
                <div className="space-y-4">
                  {bills.map((bill) => (
                    <div key={bill.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">Bill #{bill.id.slice(-8)}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                          bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {bill.status}
                        </span>
                      </div>
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Items:</h4>
                        <ul className="text-sm text-gray-600">
                          {bill.items.map((item, index) => (
                            <li key={index} className="flex justify-between">
                              <span>{item.description}</span>
                              <span>${item.amount}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtotal:</span>
                          <span>${bill.subtotal}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Tax:</span>
                          <span>${bill.tax_amount}</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold text-gray-800">
                          <span>Total:</span>
                          <span>${bill.total_amount}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Due: {new Date(bill.due_date).toLocaleDateString()}
                          {bill.paid_date && (
                            <span className="ml-2">
                              | Paid: {new Date(bill.paid_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {bills.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No bills found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showBookingModal && selectedDoctor && (
        <AppointmentBookingModal
          doctor={selectedDoctor}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedDoctor(null);
          }}
          onSuccess={loadDashboardData}
        />
      )}

      {showMedicalRecordModal && selectedPatient && (
        <MedicalRecordModal
          patient={selectedPatient}
          onClose={() => {
            setShowMedicalRecordModal(false);
            setSelectedPatient(null);
          }}
          onSuccess={loadDashboardData}
        />
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <AuthProvider>
      <AppContent showRegister={showRegister} setShowRegister={setShowRegister} />
    </AuthProvider>
  );
};

const AppContent = ({ showRegister, setShowRegister }) => {
  const { user } = useAuth();

  if (!user) {
    return showRegister ? (
      <RegisterForm onBack={() => setShowRegister(false)} />
    ) : (
      <div>
        <LoginForm />
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => setShowRegister(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition duration-200 shadow-lg"
          >
            Register
          </button>
        </div>
      </div>
    );
  }

  return <Dashboard />;
};

export default App;