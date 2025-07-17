const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');
const Appointment = require('./models/Appointment');
const MedicalRecord = require('./models/MedicalRecord');
const Inventory = require('./models/Inventory');
const Bill = require('./models/Bill');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Department.deleteMany({});
    await Appointment.deleteMany({});
    await MedicalRecord.deleteMany({});
    await Inventory.deleteMany({});
    await Bill.deleteMany({});
    console.log('Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

const seedDepartments = async () => {
  try {
    const departments = [
      {
        name: 'Cardiology',
        description: 'Heart and cardiovascular system care',
        location: { building: 'Main', floor: '2nd', room: '201-250' },
        phone: '+1-555-0101',
        email: 'cardiology@hospital.com',
        services: ['ECG', 'Echocardiogram', 'Cardiac Catheterization', 'Heart Surgery'],
        operatingHours: {
          monday: { start: '08:00', end: '18:00', closed: false },
          tuesday: { start: '08:00', end: '18:00', closed: false },
          wednesday: { start: '08:00', end: '18:00', closed: false },
          thursday: { start: '08:00', end: '18:00', closed: false },
          friday: { start: '08:00', end: '18:00', closed: false },
          saturday: { start: '09:00', end: '13:00', closed: false },
          sunday: { start: '', end: '', closed: true }
        },
        bedCapacity: 30,
        currentOccupancy: 20,
        emergencyContact: '+1-555-0199'
      },
      {
        name: 'Emergency Medicine',
        description: '24/7 emergency and trauma care',
        location: { building: 'Main', floor: '1st', room: '101-150' },
        phone: '+1-555-0102',
        email: 'emergency@hospital.com',
        services: ['Emergency Care', 'Trauma Surgery', 'Critical Care', 'Resuscitation'],
        operatingHours: {
          monday: { start: '00:00', end: '23:59', closed: false },
          tuesday: { start: '00:00', end: '23:59', closed: false },
          wednesday: { start: '00:00', end: '23:59', closed: false },
          thursday: { start: '00:00', end: '23:59', closed: false },
          friday: { start: '00:00', end: '23:59', closed: false },
          saturday: { start: '00:00', end: '23:59', closed: false },
          sunday: { start: '00:00', end: '23:59', closed: false }
        },
        bedCapacity: 40,
        currentOccupancy: 25,
        emergencyContact: '+1-555-0911'
      },
      {
        name: 'Pediatrics',
        description: 'Comprehensive care for children and adolescents',
        location: { building: 'East Wing', floor: '1st', room: '301-350' },
        phone: '+1-555-0103',
        email: 'pediatrics@hospital.com',
        services: ['General Pediatrics', 'Pediatric Surgery', 'Vaccination', 'Neonatal Care'],
        operatingHours: {
          monday: { start: '07:00', end: '19:00', closed: false },
          tuesday: { start: '07:00', end: '19:00', closed: false },
          wednesday: { start: '07:00', end: '19:00', closed: false },
          thursday: { start: '07:00', end: '19:00', closed: false },
          friday: { start: '07:00', end: '19:00', closed: false },
          saturday: { start: '08:00', end: '14:00', closed: false },
          sunday: { start: '', end: '', closed: true }
        },
        bedCapacity: 25,
        currentOccupancy: 15,
        emergencyContact: '+1-555-0193'
      },
      {
        name: 'Orthopedics',
        description: 'Bone, joint, and musculoskeletal care',
        location: { building: 'Main', floor: '3rd', room: '351-400' },
        phone: '+1-555-0104',
        email: 'orthopedics@hospital.com',
        services: ['Joint Replacement', 'Fracture Treatment', 'Sports Medicine', 'Spine Surgery'],
        operatingHours: {
          monday: { start: '08:00', end: '17:00', closed: false },
          tuesday: { start: '08:00', end: '17:00', closed: false },
          wednesday: { start: '08:00', end: '17:00', closed: false },
          thursday: { start: '08:00', end: '17:00', closed: false },
          friday: { start: '08:00', end: '17:00', closed: false },
          saturday: { start: '09:00', end: '12:00', closed: false },
          sunday: { start: '', end: '', closed: true }
        },
        bedCapacity: 35,
        currentOccupancy: 22,
        emergencyContact: '+1-555-0194'
      },
      {
        name: 'Radiology',
        description: 'Medical imaging and diagnostic services',
        location: { building: 'West Wing', floor: 'Basement', room: 'B01-B20' },
        phone: '+1-555-0105',
        email: 'radiology@hospital.com',
        services: ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Nuclear Medicine'],
        operatingHours: {
          monday: { start: '06:00', end: '22:00', closed: false },
          tuesday: { start: '06:00', end: '22:00', closed: false },
          wednesday: { start: '06:00', end: '22:00', closed: false },
          thursday: { start: '06:00', end: '22:00', closed: false },
          friday: { start: '06:00', end: '22:00', closed: false },
          saturday: { start: '08:00', end: '16:00', closed: false },
          sunday: { start: '10:00', end: '16:00', closed: false }
        },
        bedCapacity: 0,
        currentOccupancy: 0,
        emergencyContact: '+1-555-0195'
      }
    ];

    const createdDepartments = await Department.insertMany(departments);
    console.log('Departments seeded successfully');
    return createdDepartments;
  } catch (error) {
    console.error('Error seeding departments:', error);
  }
};

const seedUsers = async (departments) => {
  try {
    const users = [
      // Admin
      {
        firstName: 'John',
        lastName: 'Admin',
        email: 'admin@hospital.com',
        password: 'admin123',
        role: 'admin',
        phone: '+1-555-0001',
        address: {
          street: '123 Admin Street',
          city: 'Medical City',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        isActive: true
      },
      // Doctors
      {
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@hospital.com',
        password: 'doctor123',
        role: 'doctor',
        phone: '+1-555-0011',
        specialization: 'Cardiologist',
        licenseNumber: 'MD-12345',
        experience: 15,
        department: departments[0]._id, // Cardiology
        consultationFee: 200,
        employeeId: 'DOC001',
        joiningDate: new Date('2020-01-15'),
        salary: 180000,
        address: {
          street: '456 Doctor Lane',
          city: 'Medical City',
          state: 'CA',
          zipCode: '90211',
          country: 'USA'
        }
      },
      {
        firstName: 'Dr. Michael',
        lastName: 'Chen',
        email: 'michael.chen@hospital.com',
        password: 'doctor123',
        role: 'doctor',
        phone: '+1-555-0012',
        specialization: 'Emergency Medicine',
        licenseNumber: 'MD-12346',
        experience: 12,
        department: departments[1]._id, // Emergency
        consultationFee: 250,
        employeeId: 'DOC002',
        joiningDate: new Date('2021-03-20'),
        salary: 200000,
        address: {
          street: '789 Emergency Blvd',
          city: 'Medical City',
          state: 'CA',
          zipCode: '90212',
          country: 'USA'
        }
      },
      {
        firstName: 'Dr. Emily',
        lastName: 'Rodriguez',
        email: 'emily.rodriguez@hospital.com',
        password: 'doctor123',
        role: 'doctor',
        phone: '+1-555-0013',
        specialization: 'Pediatrician',
        licenseNumber: 'MD-12347',
        experience: 10,
        department: departments[2]._id, // Pediatrics
        consultationFee: 150,
        employeeId: 'DOC003',
        joiningDate: new Date('2022-05-10'),
        salary: 160000,
        address: {
          street: '321 Pediatric Way',
          city: 'Medical City',
          state: 'CA',
          zipCode: '90213',
          country: 'USA'
        }
      },
      // Nurses
      {
        firstName: 'Jennifer',
        lastName: 'Williams',
        email: 'jennifer.williams@hospital.com',
        password: 'nurse123',
        role: 'nurse',
        phone: '+1-555-0021',
        department: departments[0]._id, // Cardiology
        employeeId: 'NUR001',
        joiningDate: new Date('2021-08-15'),
        salary: 75000,
        address: {
          street: '654 Nurse Street',
          city: 'Medical City',
          state: 'CA',
          zipCode: '90214',
          country: 'USA'
        }
      },
      {
        firstName: 'Robert',
        lastName: 'Davis',
        email: 'robert.davis@hospital.com',
        password: 'nurse123',
        role: 'nurse',
        phone: '+1-555-0022',
        department: departments[1]._id, // Emergency
        employeeId: 'NUR002',
        joiningDate: new Date('2020-11-30'),
        salary: 78000,
        address: {
          street: '987 Care Avenue',
          city: 'Medical City',
          state: 'CA',
          zipCode: '90215',
          country: 'USA'
        }
      },
      // Receptionist
      {
        firstName: 'Lisa',
        lastName: 'Brown',
        email: 'lisa.brown@hospital.com',
        password: 'reception123',
        role: 'receptionist',
        phone: '+1-555-0031',
        department: departments[0]._id,
        employeeId: 'REC001',
        joiningDate: new Date('2022-01-10'),
        salary: 45000,
        address: {
          street: '147 Reception Road',
          city: 'Medical City',
          state: 'CA',
          zipCode: '90216',
          country: 'USA'
        }
      },
      // Patients
      {
        firstName: 'Alice',
        lastName: 'Miller',
        email: 'alice.miller@email.com',
        password: 'patient123',
        role: 'patient',
        phone: '+1-555-0041',
        dateOfBirth: new Date('1985-03-15'),
        gender: 'female',
        bloodGroup: 'A+',
        emergencyContact: {
          name: 'Bob Miller',
          phone: '+1-555-0042',
          relationship: 'Husband'
        },
        address: {
          street: '258 Patient Place',
          city: 'Medical City',
          state: 'CA',
          zipCode: '90217',
          country: 'USA'
        }
      },
      {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@email.com',
        password: 'patient123',
        role: 'patient',
        phone: '+1-555-0043',
        dateOfBirth: new Date('1978-11-22'),
        gender: 'male',
        bloodGroup: 'O-',
        emergencyContact: {
          name: 'Mary Wilson',
          phone: '+1-555-0044',
          relationship: 'Wife'
        },
        address: {
          street: '369 Health Street',
          city: 'Medical City',
          state: 'CA',
          zipCode: '90218',
          country: 'USA'
        }
      },
      {
        firstName: 'Emma',
        lastName: 'Taylor',
        email: 'emma.taylor@email.com',
        password: 'patient123',
        role: 'patient',
        phone: '+1-555-0045',
        dateOfBirth: new Date('2010-07-08'),
        gender: 'female',
        bloodGroup: 'B+',
        emergencyContact: {
          name: 'James Taylor',
          phone: '+1-555-0046',
          relationship: 'Father'
        },
        address: {
          street: '741 Child Lane',
          city: 'Medical City',
          state: 'CA',
          zipCode: '90219',
          country: 'USA'
        }
      }
    ];

    // Hash passwords before saving
    for (let user of users) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }

    const createdUsers = await User.insertMany(users);
    console.log('Users seeded successfully');
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

const seedInventory = async () => {
  try {
    const inventoryItems = [
      {
        itemName: 'Paracetamol 500mg',
        itemCode: 'MED001',
        category: 'medication',
        subcategory: 'Pain Relief',
        description: 'Pain and fever relief medication',
        manufacturer: 'PharmaCorp',
        supplier: {
          name: 'MedSupply Inc',
          contact: 'John Supplier',
          email: 'john@medsupply.com',
          phone: '+1-555-1001'
        },
        currentStock: 500,
        minimumStock: 100,
        maximumStock: 1000,
        unit: 'pieces',
        costPrice: 0.10,
        sellingPrice: 0.25,
        location: {
          building: 'Pharmacy',
          floor: '1st',
          room: 'Store A',
          shelf: 'A1',
          position: '001'
        },
        batchNumber: 'PARA001',
        expiryDate: new Date('2025-12-31'),
        manufactureDate: new Date('2023-12-01'),
        reorderPoint: 150,
        status: 'active',
        tags: ['pain-relief', 'fever', 'common']
      },
      {
        itemName: 'Digital Thermometer',
        itemCode: 'EQP001',
        category: 'equipment',
        subcategory: 'Diagnostic',
        description: 'Digital thermometer for temperature measurement',
        manufacturer: 'MedTech Solutions',
        supplier: {
          name: 'EquipMed Ltd',
          contact: 'Sarah Equipment',
          email: 'sarah@equipmed.com',
          phone: '+1-555-1002'
        },
        currentStock: 25,
        minimumStock: 10,
        maximumStock: 50,
        unit: 'pieces',
        costPrice: 15.00,
        sellingPrice: 30.00,
        location: {
          building: 'Main',
          floor: '2nd',
          room: 'Equipment Store',
          shelf: 'B2',
          position: '010'
        },
        reorderPoint: 15,
        status: 'active',
        tags: ['diagnostic', 'temperature', 'reusable']
      },
      {
        itemName: 'Surgical Gloves (Box)',
        itemCode: 'SUP001',
        category: 'supplies',
        subcategory: 'Protective',
        description: 'Disposable surgical gloves, sterile',
        manufacturer: 'SafeHands Medical',
        supplier: {
          name: 'Medical Supplies Co',
          contact: 'Mike Supplies',
          email: 'mike@medsupplies.com',
          phone: '+1-555-1003'
        },
        currentStock: 200,
        minimumStock: 50,
        maximumStock: 500,
        unit: 'boxes',
        costPrice: 25.00,
        sellingPrice: 40.00,
        location: {
          building: 'Main',
          floor: '1st',
          room: 'Supply Room',
          shelf: 'C1',
          position: '020'
        },
        reorderPoint: 75,
        status: 'active',
        tags: ['protective', 'disposable', 'sterile']
      },
      {
        itemName: 'Amoxicillin 250mg',
        itemCode: 'MED002',
        category: 'medication',
        subcategory: 'Antibiotics',
        description: 'Antibiotic for bacterial infections',
        manufacturer: 'AntiBio Pharma',
        supplier: {
          name: 'PharmaMed Supply',
          contact: 'Lisa Pharma',
          email: 'lisa@pharmamed.com',
          phone: '+1-555-1004'
        },
        currentStock: 300,
        minimumStock: 80,
        maximumStock: 600,
        unit: 'pieces',
        costPrice: 0.50,
        sellingPrice: 1.25,
        location: {
          building: 'Pharmacy',
          floor: '1st',
          room: 'Store A',
          shelf: 'A2',
          position: '002'
        },
        batchNumber: 'AMOX001',
        expiryDate: new Date('2026-06-30'),
        manufactureDate: new Date('2024-01-15'),
        reorderPoint: 120,
        status: 'active',
        tags: ['antibiotic', 'prescription', 'infection']
      },
      {
        itemName: 'Blood Pressure Monitor',
        itemCode: 'EQP002',
        category: 'equipment',
        subcategory: 'Diagnostic',
        description: 'Automatic blood pressure monitor',
        manufacturer: 'CardioTech',
        supplier: {
          name: 'HealthEquip Inc',
          contact: 'Tom Equipment',
          email: 'tom@healthequip.com',
          phone: '+1-555-1005'
        },
        currentStock: 15,
        minimumStock: 5,
        maximumStock: 30,
        unit: 'pieces',
        costPrice: 80.00,
        sellingPrice: 150.00,
        location: {
          building: 'Main',
          floor: '2nd',
          room: 'Equipment Store',
          shelf: 'B3',
          position: '011'
        },
        reorderPoint: 8,
        status: 'active',
        tags: ['diagnostic', 'blood-pressure', 'automatic']
      }
    ];

    const createdItems = await Inventory.insertMany(inventoryItems);
    console.log('Inventory seeded successfully');
    return createdItems;
  } catch (error) {
    console.error('Error seeding inventory:', error);
  }
};

const seedAll = async () => {
  try {
    await connectDB();
    await clearDatabase();
    
    const departments = await seedDepartments();
    const users = await seedUsers(departments);
    const inventory = await seedInventory();
    
    console.log('All seed data created successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@hospital.com / admin123');
    console.log('Doctor: sarah.johnson@hospital.com / doctor123');
    console.log('Nurse: jennifer.williams@hospital.com / nurse123');
    console.log('Receptionist: lisa.brown@hospital.com / reception123');
    console.log('Patient: alice.miller@email.com / patient123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedAll();