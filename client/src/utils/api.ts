import axios, { AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse } from '../types';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Generic API methods
export const apiClient = {
  get: <T>(url: string, params?: any): Promise<AxiosResponse<T>> => {
    return api.get(url, { params });
  },
  
  post: <T>(url: string, data?: any): Promise<AxiosResponse<T>> => {
    return api.post(url, data);
  },
  
  put: <T>(url: string, data?: any): Promise<AxiosResponse<T>> => {
    return api.put(url, data);
  },
  
  delete: <T>(url: string): Promise<AxiosResponse<T>> => {
    return api.delete(url);
  },
  
  patch: <T>(url: string, data?: any): Promise<AxiosResponse<T>> => {
    return api.patch(url, data);
  }
};

// Auth API
export const authAPI = {
  login: (email: string, password: string) => 
    apiClient.post('/auth/login', { email, password }),
  
  register: (userData: any) => 
    apiClient.post('/auth/register', userData),
  
  getCurrentUser: () => 
    apiClient.get('/auth/me'),
  
  updateProfile: (userData: any) => 
    apiClient.put('/auth/profile', userData),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.put('/auth/change-password', { currentPassword, newPassword }),
  
  getUsers: (params?: any) => 
    apiClient.get('/auth/users', params),
  
  updateUserStatus: (userId: string, isActive: boolean) =>
    apiClient.put(`/auth/users/${userId}/status`, { isActive })
};

// Patients API
export const patientsAPI = {
  getPatients: (params?: any) => 
    apiClient.get('/patients', params),
  
  getPatientById: (id: string) => 
    apiClient.get(`/patients/${id}`),
  
  updatePatient: (id: string, data: any) => 
    apiClient.put(`/patients/${id}`, data),
  
  getPatientAppointments: (id: string, params?: any) => 
    apiClient.get(`/patients/${id}/appointments`, params),
  
  getPatientMedicalRecords: (id: string, params?: any) => 
    apiClient.get(`/patients/${id}/medical-records`, params),
  
  getPatientSummary: (id: string) => 
    apiClient.get(`/patients/${id}/summary`),
  
  getPatientsStats: () => 
    apiClient.get('/patients/stats/overview')
};

// Doctors API
export const doctorsAPI = {
  getDoctors: (params?: any) => 
    apiClient.get('/doctors', params),
  
  getDoctorById: (id: string) => 
    apiClient.get(`/doctors/${id}`)
};

// Appointments API
export const appointmentsAPI = {
  getAppointments: (params?: any) => 
    apiClient.get('/appointments', params),
  
  getAppointmentById: (id: string) => 
    apiClient.get(`/appointments/${id}`),
  
  createAppointment: (data: any) => 
    apiClient.post('/appointments', data),
  
  updateAppointment: (id: string, data: any) => 
    apiClient.put(`/appointments/${id}`, data),
  
  cancelAppointment: (id: string) => 
    apiClient.delete(`/appointments/${id}`),
  
  getDoctorAvailability: (doctorId: string, date: string) => 
    apiClient.get(`/appointments/doctor/${doctorId}/availability`, { date }),
  
  getAppointmentStats: (params?: any) => 
    apiClient.get('/appointments/stats', params)
};

// Medical Records API
export const medicalRecordsAPI = {
  getMedicalRecords: (params?: any) => 
    apiClient.get('/medical-records', params),
  
  createMedicalRecord: (data: any) => 
    apiClient.post('/medical-records', data),
  
  getMedicalRecordById: (id: string) => 
    apiClient.get(`/medical-records/${id}`),
  
  updateMedicalRecord: (id: string, data: any) => 
    apiClient.put(`/medical-records/${id}`, data)
};

// Departments API
export const departmentsAPI = {
  getDepartments: () => 
    apiClient.get('/departments'),
  
  createDepartment: (data: any) => 
    apiClient.post('/departments', data),
  
  getDepartmentById: (id: string) => 
    apiClient.get(`/departments/${id}`),
  
  updateDepartment: (id: string, data: any) => 
    apiClient.put(`/departments/${id}`, data)
};

// Inventory API
export const inventoryAPI = {
  getInventoryItems: (params?: any) => 
    apiClient.get('/inventory', params),
  
  createInventoryItem: (data: any) => 
    apiClient.post('/inventory', data),
  
  getInventoryItemById: (id: string) => 
    apiClient.get(`/inventory/${id}`),
  
  updateInventoryItem: (id: string, data: any) => 
    apiClient.put(`/inventory/${id}`, data),
  
  deleteInventoryItem: (id: string) => 
    apiClient.delete(`/inventory/${id}`),
  
  getInventoryStats: () => 
    apiClient.get('/inventory/stats')
};

// Billing API
export const billingAPI = {
  getBills: (params?: any) => 
    apiClient.get('/billing', params),
  
  createBill: (data: any) => 
    apiClient.post('/billing', data),
  
  getBillById: (id: string) => 
    apiClient.get(`/billing/${id}`),
  
  updateBill: (id: string, data: any) => 
    apiClient.put(`/billing/${id}`, data),
  
  addPayment: (id: string, data: any) => 
    apiClient.post(`/billing/${id}/payment`, data),
  
  getBillingStats: () => 
    apiClient.get('/billing/stats')
};

// Staff API
export const staffAPI = {
  getStaff: (params?: any) => 
    apiClient.get('/staff', params),
  
  getStaffById: (id: string) => 
    apiClient.get(`/staff/${id}`),
  
  updateStaff: (id: string, data: any) => 
    apiClient.put(`/staff/${id}`, data)
};

// Dashboard API
export const dashboardAPI = {
  getDashboardStats: () => 
    apiClient.get('/dashboard/stats')
};

export default api;