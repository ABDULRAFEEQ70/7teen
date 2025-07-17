export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  address: string
  bloodType: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  medicalHistory: string[]
  allergies: string[]
  insurance: {
    provider: string
    policyNumber: string
    expiryDate: string
  }
  status: 'active' | 'inactive' | 'discharged'
  createdAt: string
  updatedAt: string
}

export interface Doctor {
  id: string
  name: string
  email: string
  phone: string
  specialization: string
  department: string
  licenseNumber: string
  experience: number
  education: string[]
  availability: {
    days: string[]
    hours: string
  }
  status: 'active' | 'inactive' | 'on_leave'
  image: string
  createdAt: string
  updatedAt: string
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  patientName: string
  doctorName: string
  date: string
  time: string
  type: 'consultation' | 'follow_up' | 'emergency' | 'routine'
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  notes: string
  symptoms: string
  diagnosis: string
  prescription: string
  createdAt: string
  updatedAt: string
}

export interface Department {
  id: string
  name: string
  description: string
  headDoctor: string
  staffCount: number
  bedCount: number
  availableBeds: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Staff {
  id: string
  name: string
  email: string
  phone: string
  role: 'nurse' | 'receptionist' | 'technician' | 'administrator' | 'pharmacist'
  department: string
  hireDate: string
  salary: number
  status: 'active' | 'inactive' | 'on_leave'
  image: string
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: string
  name: string
  category: 'medication' | 'equipment' | 'supplies' | 'devices'
  description: string
  quantity: number
  unit: string
  price: number
  supplier: string
  expiryDate: string
  minStock: number
  maxStock: number
  location: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired'
  createdAt: string
  updatedAt: string
}

export interface Bill {
  id: string
  patientId: string
  patientName: string
  items: {
    name: string
    quantity: number
    price: number
    total: number
  }[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  paymentMethod: string
  dueDate: string
  paidDate?: string
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalPatients: number
  totalDoctors: number
  totalAppointments: number
  totalRevenue: number
  pendingAppointments: number
  availableBeds: number
  lowStockItems: number
  todayAppointments: number
}

export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}