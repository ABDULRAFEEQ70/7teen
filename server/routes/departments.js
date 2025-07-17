const express = require('express');
const Department = require('../models/Department');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/departments
// @desc    Get all departments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('head', 'firstName lastName')
      .sort({ name: 1 });

    res.json(departments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/departments
// @desc    Create new department
// @access  Private (Admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    
    res.status(201).json({
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;