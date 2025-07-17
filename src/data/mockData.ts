import { 
  Patient, 
  Doctor, 
  Appointment, 
  Department, 
  Staff, 
  InventoryItem, 
  Bill, 
  DashboardStats 
} from '../types'

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    dateOfBirth: '1985-03-15',
    gender: 'male',
    address: '123 Main St, City, State 12345',
    bloodType: 'O+',
    emergencyContact: {
      name: 'Jane Smith',
      phone: '+1-555-0124',
      relationship: 'Spouse'
    },
    medicalHistory: ['Hypertension', 'Diabetes Type 2'],
    allergies: ['Penicillin', 'Peanuts'],
    insurance: {
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'BCBS123456',
      expiryDate: '2024-12-31'
    },
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0125',
    dateOfBirth: '1990-07-22',
    gender: 'female',
    address: '456 Oak Ave, City, State 12345',
    bloodType: 'A-',
    emergencyContact: {
      name: 'Mike Johnson',
      phone: '+1-555-0126',
      relationship: 'Brother'
    },
    medicalHistory: ['Asthma'],
    allergies: ['Shellfish'],
    insurance: {
      provider: 'Aetna',
      policyNumber: 'AET789012',
      expiryDate: '2024-06-30'
    },
    status: 'active',
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z'
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    phone: '+1-555-0127',
    dateOfBirth: '1978-11-08',
    gender: 'male',
    address: '789 Pine Rd, City, State 12345',
    bloodType: 'B+',
    emergencyContact: {
      name: 'Lisa Brown',
      phone: '+1-555-0128',
      relationship: 'Wife'
    },
    medicalHistory: ['Heart Disease', 'High Cholesterol'],
    allergies: ['Latex'],
    insurance: {
      provider: 'Cigna',
      policyNumber: 'CIG345678',
      expiryDate: '2024-09-15'
    },
    status: 'active',
    createdAt: '2024-01-05T09:15:00Z',
    updatedAt: '2024-01-05T09:15:00Z'
  }
]

export const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Emily Wilson',
    email: 'emily.wilson@hospital.com',
    phone: '+1-555-0201',
    specialization: 'Cardiology',
    department: 'Cardiology',
    licenseNumber: 'MD123456',
    experience: 12,
    education: ['Harvard Medical School', 'Johns Hopkins University'],
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      hours: '9:00 AM - 5:00 PM'
    },
    status: 'active',
    image: '/api/placeholder/150/150',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2023-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Dr. Robert Chen',
    email: 'robert.chen@hospital.com',
    phone: '+1-555-0202',
    specialization: 'Neurology',
    department: 'Neurology',
    licenseNumber: 'MD789012',
    experience: 8,
    education: ['Stanford Medical School', 'UCLA'],
    availability: {
      days: ['Monday', 'Wednesday', 'Friday'],
      hours: '10:00 AM - 6:00 PM'
    },
    status: 'active',
    image: '/api/placeholder/150/150',
    createdAt: '2023-02-20T14:30:00Z',
    updatedAt: '2023-02-20T14:30:00Z'
  },
  {
    id: '3',
    name: 'Dr. Maria Garcia',
    email: 'maria.garcia@hospital.com',
    phone: '+1-555-0203',
    specialization: 'Pediatrics',
    department: 'Pediatrics',
    licenseNumber: 'MD345678',
    experience: 15,
    education: ['Yale Medical School', 'Boston Children\'s Hospital'],
    availability: {
      days: ['Tuesday', 'Thursday', 'Saturday'],
      hours: '8:00 AM - 4:00 PM'
    },
    status: 'active',
    image: '/api/placeholder/150/150',
    createdAt: '2023-03-10T11:45:00Z',
    updatedAt: '2023-03-10T11:45:00Z'
  }
]

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '1',
    patientName: 'John Smith',
    doctorName: 'Dr. Emily Wilson',
    date: '2024-01-20',
    time: '10:00 AM',
    type: 'consultation',
    status: 'confirmed',
    notes: 'Follow-up for heart condition',
    symptoms: 'Chest pain, shortness of breath',
    diagnosis: '',
    prescription: '',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    patientId: '2',
    doctorId: '3',
    patientName: 'Sarah Johnson',
    doctorName: 'Dr. Maria Garcia',
    date: '2024-01-21',
    time: '2:30 PM',
    type: 'routine',
    status: 'scheduled',
    notes: 'Annual checkup',
    symptoms: '',
    diagnosis: '',
    prescription: '',
    createdAt: '2024-01-16T14:30:00Z',
    updatedAt: '2024-01-16T14:30:00Z'
  },
  {
    id: '3',
    patientId: '3',
    doctorId: '2',
    patientName: 'Michael Brown',
    doctorName: 'Dr. Robert Chen',
    date: '2024-01-19',
    time: '11:00 AM',
    type: 'follow_up',
    status: 'completed',
    notes: 'Post-surgery follow-up',
    symptoms: 'Headaches, dizziness',
    diagnosis: 'Post-concussion syndrome',
    prescription: 'Rest, pain management',
    createdAt: '2024-01-14T09:15:00Z',
    updatedAt: '2024-01-19T11:00:00Z'
  }
]

export const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Cardiology',
    description: 'Specialized in heart and cardiovascular system treatment',
    headDoctor: 'Dr. Emily Wilson',
    staffCount: 15,
    bedCount: 25,
    availableBeds: 8,
    status: 'active',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Neurology',
    description: 'Specialized in nervous system disorders',
    headDoctor: 'Dr. Robert Chen',
    staffCount: 12,
    bedCount: 20,
    availableBeds: 5,
    status: 'active',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Pediatrics',
    description: 'Specialized in children\'s health and development',
    headDoctor: 'Dr. Maria Garcia',
    staffCount: 18,
    bedCount: 30,
    availableBeds: 12,
    status: 'active',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
]

export const mockStaff: Staff[] = [
  {
    id: '1',
    name: 'Jennifer Adams',
    email: 'jennifer.adams@hospital.com',
    phone: '+1-555-0301',
    role: 'nurse',
    department: 'Cardiology',
    hireDate: '2022-03-15',
    salary: 65000,
    status: 'active',
    image: '/api/placeholder/150/150',
    createdAt: '2022-03-15T10:00:00Z',
    updatedAt: '2022-03-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'David Thompson',
    email: 'david.thompson@hospital.com',
    phone: '+1-555-0302',
    role: 'receptionist',
    department: 'General',
    hireDate: '2021-08-20',
    salary: 45000,
    status: 'active',
    image: '/api/placeholder/150/150',
    createdAt: '2021-08-20T14:30:00Z',
    updatedAt: '2021-08-20T14:30:00Z'
  },
  {
    id: '3',
    name: 'Lisa Rodriguez',
    email: 'lisa.rodriguez@hospital.com',
    phone: '+1-555-0303',
    role: 'technician',
    department: 'Radiology',
    hireDate: '2023-01-10',
    salary: 55000,
    status: 'active',
    image: '/api/placeholder/150/150',
    createdAt: '2023-01-10T11:45:00Z',
    updatedAt: '2023-01-10T11:45:00Z'
  }
]

export const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Aspirin 100mg',
    category: 'medication',
    description: 'Pain reliever and blood thinner',
    quantity: 500,
    unit: 'tablets',
    price: 0.15,
    supplier: 'PharmaCorp',
    expiryDate: '2025-06-30',
    minStock: 100,
    maxStock: 1000,
    location: 'Pharmacy A',
    status: 'in_stock',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'ECG Machine',
    category: 'equipment',
    description: 'Electrocardiogram machine for heart monitoring',
    quantity: 3,
    unit: 'units',
    price: 15000,
    supplier: 'MedEquip Inc',
    expiryDate: '2030-12-31',
    minStock: 1,
    maxStock: 5,
    location: 'Cardiology Department',
    status: 'in_stock',
    createdAt: '2023-12-15T00:00:00Z',
    updatedAt: '2023-12-15T00:00:00Z'
  },
  {
    id: '3',
    name: 'Surgical Masks',
    category: 'supplies',
    description: 'Disposable surgical face masks',
    quantity: 25,
    unit: 'boxes',
    price: 25,
    supplier: 'MedSupply Co',
    expiryDate: '2026-03-31',
    minStock: 50,
    maxStock: 200,
    location: 'Storage Room B',
    status: 'low_stock',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z'
  }
]

export const mockBills: Bill[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'John Smith',
    items: [
      {
        name: 'Cardiology Consultation',
        quantity: 1,
        price: 200,
        total: 200
      },
      {
        name: 'ECG Test',
        quantity: 1,
        price: 150,
        total: 150
      }
    ],
    subtotal: 350,
    tax: 35,
    discount: 0,
    total: 385,
    status: 'paid',
    paymentMethod: 'Credit Card',
    dueDate: '2024-01-25',
    paidDate: '2024-01-20',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Sarah Johnson',
    items: [
      {
        name: 'Pediatric Consultation',
        quantity: 1,
        price: 180,
        total: 180
      },
      {
        name: 'Blood Test',
        quantity: 1,
        price: 80,
        total: 80
      }
    ],
    subtotal: 260,
    tax: 26,
    discount: 20,
    total: 266,
    status: 'pending',
    paymentMethod: 'Insurance',
    dueDate: '2024-02-05',
    createdAt: '2024-01-16T14:30:00Z',
    updatedAt: '2024-01-16T14:30:00Z'
  }
]

export const mockDashboardStats: DashboardStats = {
  totalPatients: 1250,
  totalDoctors: 45,
  totalAppointments: 89,
  totalRevenue: 125000,
  pendingAppointments: 12,
  availableBeds: 45,
  lowStockItems: 8,
  todayAppointments: 15
}