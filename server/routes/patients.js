const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/patients
// @desc    Get all patients
// @access  Private (Admin, Doctor, Nurse, Receptionist)
router.get('/', auth, authorize('admin', 'doctor', 'nurse', 'receptionist'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, bloodGroup, gender } = req.query;
    
    let query = { role: 'patient' };
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (gender) query.gender = gender;

    const patients = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      patients,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patients/:id
// @desc    Get patient by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select('-password');
    
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check access permissions
    const { role, id: userId } = req.user;
    if (role === 'patient' && patient._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patients/:id/appointments
// @desc    Get patient's appointments
// @access  Private
router.get('/:id/appointments', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Check access permissions
    const { role, id: userId } = req.user;
    if (role === 'patient' && req.params.id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = { patient: req.params.id };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('doctor', 'firstName lastName specialization consultationFee')
      .populate('department', 'name location')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appointmentDate: -1 });

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patients/:id/medical-records
// @desc    Get patient's medical records
// @access  Private
router.get('/:id/medical-records', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Check access permissions
    const { role, id: userId } = req.user;
    if (role === 'patient' && req.params.id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const records = await MedicalRecord.find({ patient: req.params.id })
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment', 'appointmentDate appointmentTime type')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ visitDate: -1 });

    const total = await MedicalRecord.countDocuments({ patient: req.params.id });

    res.json({
      records,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/patients/:id
// @desc    Update patient information
// @access  Private
router.put('/:id', auth, [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
  body('email').optional().isEmail().withMessage('Please include a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check access permissions
    const { role, id: userId } = req.user;
    if (role === 'patient' && req.params.id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'address', 'emergencyContact',
      'profileImage'
    ];

    // Admin can update more fields
    if (role === 'admin') {
      allowedUpdates.push('email', 'bloodGroup', 'dateOfBirth', 'gender', 'isActive');
    }

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Check if email is being updated and if it's unique
    if (req.body.email) {
      const existingUser = await User.findOne({ 
        email: req.body.email,
        _id: { $ne: req.params.id }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const patient = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'patient' },
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      message: 'Patient updated successfully',
      patient
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patients/:id/summary
// @desc    Get patient summary
// @access  Private
router.get('/:id/summary', auth, async (req, res) => {
  try {
    // Check access permissions
    const { role, id: userId } = req.user;
    if (role === 'patient' && req.params.id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const patient = await User.findById(req.params.id).select('-password');
    
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get appointment statistics
    const appointmentStats = await Appointment.aggregate([
      { $match: { patient: patient._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalAppointments = await Appointment.countDocuments({ patient: patient._id });
    const upcomingAppointments = await Appointment.countDocuments({
      patient: patient._id,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    // Get recent medical records
    const recentRecords = await MedicalRecord.find({ patient: patient._id })
      .populate('doctor', 'firstName lastName specialization')
      .sort({ visitDate: -1 })
      .limit(5);

    // Get last appointment
    const lastAppointment = await Appointment.findOne({ patient: patient._id })
      .populate('doctor', 'firstName lastName specialization')
      .sort({ appointmentDate: -1 });

    // Get upcoming appointment
    const nextAppointment = await Appointment.findOne({
      patient: patient._id,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    })
      .populate('doctor', 'firstName lastName specialization')
      .sort({ appointmentDate: 1 });

    res.json({
      patient,
      stats: {
        totalAppointments,
        upcomingAppointments,
        appointmentsByStatus: appointmentStats,
        totalMedicalRecords: await MedicalRecord.countDocuments({ patient: patient._id })
      },
      recentRecords,
      lastAppointment,
      nextAppointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patients/stats/overview
// @desc    Get patients overview statistics
// @access  Private (Admin, Doctor)
router.get('/stats/overview', auth, authorize('admin', 'doctor'), async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const activePatients = await User.countDocuments({ role: 'patient', isActive: true });
    
    // Patients by blood group
    const bloodGroupStats = await User.aggregate([
      { $match: { role: 'patient' } },
      {
        $group: {
          _id: '$bloodGroup',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Patients by gender
    const genderStats = await User.aggregate([
      { $match: { role: 'patient' } },
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Age distribution
    const ageStats = await User.aggregate([
      { $match: { role: 'patient', dateOfBirth: { $exists: true } } },
      {
        $addFields: {
          age: {
            $divide: [
              { $subtract: [new Date(), '$dateOfBirth'] },
              365.25 * 24 * 60 * 60 * 1000
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 18, 30, 50, 65, 100],
          default: 'Unknown',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    // New patients this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newPatientsThisMonth = await User.countDocuments({
      role: 'patient',
      createdAt: { $gte: startOfMonth }
    });

    res.json({
      totalPatients,
      activePatients,
      newPatientsThisMonth,
      bloodGroupDistribution: bloodGroupStats,
      genderDistribution: genderStats,
      ageDistribution: ageStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;