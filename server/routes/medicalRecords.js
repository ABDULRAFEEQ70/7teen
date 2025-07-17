const express = require('express');
const MedicalRecord = require('../models/MedicalRecord');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/medical-records
// @desc    Get medical records
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, patient, doctor } = req.query;
    
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    }
    
    if (patient) query.patient = patient;
    if (doctor) query.doctor = doctor;

    const records = await MedicalRecord.find(query)
      .populate('patient', 'firstName lastName dateOfBirth gender bloodGroup')
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment', 'appointmentDate type')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ visitDate: -1 });

    const total = await MedicalRecord.countDocuments(query);

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

// @route   POST /api/medical-records
// @desc    Create new medical record
// @access  Private (Doctor only)
router.post('/', auth, authorize('doctor'), async (req, res) => {
  try {
    const record = new MedicalRecord({
      ...req.body,
      doctor: req.user.id
    });
    
    await record.save();
    await record.populate(['patient', 'doctor', 'appointment']);
    
    res.status(201).json({
      message: 'Medical record created successfully',
      record
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;