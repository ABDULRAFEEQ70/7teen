const express = require('express');
const Bill = require('../models/Bill');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/billing
// @desc    Get bills
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, patient } = req.query;
    
    let query = {};
    
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    }
    
    if (status) query.status = status;
    if (patient) query.patient = patient;

    const bills = await Bill.find(query)
      .populate('patient', 'firstName lastName phone email')
      .populate('appointment', 'appointmentDate type')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ billDate: -1 });

    const total = await Bill.countDocuments(query);

    res.json({
      bills,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/billing
// @desc    Create new bill
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const bill = new Bill({
      ...req.body,
      createdBy: req.user.id
    });
    
    await bill.save();
    await bill.populate(['patient', 'appointment', 'createdBy']);
    
    res.status(201).json({
      message: 'Bill created successfully',
      bill
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;