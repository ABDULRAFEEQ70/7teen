export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'patient';
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  profileImage?: string;
  isActive: boolean;
  lastLogin?: Date;
  fullName: string;
  
  // Doctor-specific fields
  specialization?: string;
  licenseNumber?: string;
  experience?: number;
  department?: Department;
  consultationFee?: number;
  
  // Patient-specific fields
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  age?: number;
  
  // Staff-specific fields
  employeeId?: string;
  joiningDate?: Date;
  salary?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  _id: string;
  name: string;
  description: string;
  head?: User;
  location: {
    building?: string;
    floor?: string;
    room?: string;
  };
  phone: string;
  email: string;
  services: string[];
  operatingHours: {
    [key: string]: {
      start: string;
      end: string;
      closed: boolean;
    };
  };
  bedCapacity: number;
  currentOccupancy: number;
  emergencyContact: string;
  isActive: boolean;
  availabilityPercentage: number;
  staffCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  _id: string;
  patient: User;
  doctor: User;
  department: Department;
  appointmentDate: Date;
  appointmentTime: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency' | 'surgery' | 'checkup';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  symptoms: string;
  notes?: string;
  diagnosis?: string;
  prescription?: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  labTests?: Array<{
    testName: string;
    status: 'pending' | 'completed';
    results?: string;
    orderedDate: Date;
  }>;
  followUpDate?: Date;
  consultationFee: number;
  paymentStatus: 'pending' | 'paid' | 'partially-paid' | 'refunded';
  reminderSent: boolean;
  createdBy: User;
  updatedBy?: User;
  endTime: string;
  fullDateTime: Date;
  isUpcoming: boolean;
  isOverdue: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalRecord {
  _id: string;
  patient: User;
  appointment: Appointment;
  doctor: User;
  visitDate: Date;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: {
    allergies: string[];
    medications: string[];
    surgeries: string[];
    chronicConditions: string[];
    familyHistory: string[];
  };
  physicalExamination: {
    vitalSigns: {
      temperature?: number;
      bloodPressure?: {
        systolic: number;
        diastolic: number;
      };
      heartRate?: number;
      respiratoryRate?: number;
      oxygenSaturation?: number;
      weight?: number;
      height?: number;
      bmi?: number;
    };
    generalAppearance?: string;
    systemsReview: {
      cardiovascular?: string;
      respiratory?: string;
      gastrointestinal?: string;
      neurological?: string;
      musculoskeletal?: string;
      dermatological?: string;
      genitourinary?: string;
      psychiatric?: string;
    };
  };
  diagnosis: {
    primary?: string;
    secondary?: string[];
    differential?: string[];
  };
  treatment: {
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }>;
    procedures: Array<{
      name: string;
      date: Date;
      notes: string;
    }>;
    referrals: Array<{
      specialist: string;
      department: string;
      reason: string;
      urgency: 'routine' | 'urgent' | 'emergent';
    }>;
  };
  labResults: Array<{
    testName: string;
    orderDate: Date;
    resultDate?: Date;
    results?: string;
    normalRange?: string;
    interpretation?: string;
    status: 'pending' | 'completed' | 'cancelled';
  }>;
  imagingResults: Array<{
    studyType: string;
    orderDate: Date;
    studyDate?: Date;
    findings?: string;
    impression?: string;
    radiologist?: string;
    status: 'pending' | 'completed' | 'cancelled';
  }>;
  followUpInstructions?: string;
  nextAppointment?: {
    recommended: boolean;
    timeFrame?: string;
    urgency: 'routine' | 'urgent' | 'emergent';
  };
  notes?: string;
  attachments: Array<{
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadDate: Date;
    filePath: string;
  }>;
  isConfidential: boolean;
  accessLog: Array<{
    user: User;
    action: string;
    timestamp: Date;
    ipAddress: string;
  }>;
  bmiCategory?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  _id: string;
  itemName: string;
  itemCode: string;
  category: 'medication' | 'equipment' | 'supplies' | 'consumables' | 'instruments';
  subcategory: string;
  description: string;
  manufacturer: string;
  supplier: {
    name?: string;
    contact?: string;
    email?: string;
    phone?: string;
  };
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unit: 'pieces' | 'boxes' | 'bottles' | 'vials' | 'kg' | 'grams' | 'liters' | 'ml' | 'units';
  costPrice: number;
  sellingPrice: number;
  location: {
    building?: string;
    floor?: string;
    room?: string;
    shelf?: string;
    position?: string;
  };
  batchNumber?: string;
  expiryDate?: Date;
  manufactureDate?: Date;
  isExpired: boolean;
  status: 'active' | 'inactive' | 'discontinued' | 'recalled';
  usageTracking: Array<{
    date: Date;
    quantityUsed: number;
    department: Department;
    usedBy: User;
    purpose?: string;
    patient?: User;
  }>;
  stockMovements: Array<{
    date: Date;
    type: 'purchase' | 'usage' | 'transfer' | 'adjustment' | 'return';
    quantity: number;
    previousStock: number;
    newStock: number;
    reference?: string;
    notes?: string;
    handledBy: User;
  }>;
  lastRestocked?: Date;
  reorderPoint: number;
  isReorderRequired: boolean;
  tags: string[];
  notes?: string;
  stockStatus: 'out-of-stock' | 'low-stock' | 'reorder-required' | 'in-stock';
  daysUntilExpiry?: number;
  expiryStatus: 'no-expiry' | 'expired' | 'expiring-soon' | 'valid';
  createdAt: Date;
  updatedAt: Date;
}

export interface Bill {
  _id: string;
  billNumber: string;
  patient: User;
  appointment?: Appointment;
  billDate: Date;
  dueDate: Date;
  services: Array<{
    description: string;
    category: 'consultation' | 'procedure' | 'laboratory' | 'imaging' | 'medication' | 'room-charges' | 'other';
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
    totalAmount: number;
  }>;
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'draft' | 'pending' | 'partially-paid' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  paymentMethod?: 'cash' | 'card' | 'bank-transfer' | 'insurance' | 'online' | 'cheque';
  paymentHistory: Array<{
    date: Date;
    amount: number;
    method: 'cash' | 'card' | 'bank-transfer' | 'insurance' | 'online' | 'cheque';
    reference?: string;
    notes?: string;
    receivedBy: User;
  }>;
  insurance: {
    provider?: string;
    policyNumber?: string;
    claimNumber?: string;
    approvalNumber?: string;
    coveragePercentage: number;
    claimedAmount: number;
    approvedAmount: number;
    status: 'not-applicable' | 'pending' | 'approved' | 'rejected' | 'processing';
  };
  notes?: string;
  createdBy: User;
  updatedBy?: User;
  cancellationReason?: string;
  refundDetails?: {
    amount: number;
    reason: string;
    date: Date;
    processedBy: User;
  };
  paymentPercentage: number;
  overdueDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  overview: {
    totalPatients: number;
    totalDoctors: number;
    totalAppointments: number;
    todayAppointments: number;
    pendingAppointments: number;
  };
  revenue: {
    total: number;
  };
  alerts: {
    lowStockItems: number;
    expiringSoon: number;
  };
  recentAppointments: Appointment[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
  items?: T[];
  patients?: T[];
  doctors?: T[];
  appointments?: T[];
  records?: T[];
  bills?: T[];
  staff?: T[];
  users?: T[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  loading: boolean;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  department?: string;
  date?: string;
  doctor?: string;
  patient?: string;
  type?: string;
  priority?: string;
  category?: string;
  bloodGroup?: string;
  gender?: string;
}