const express = require('express');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Bill = require('../models/Bill');
const Inventory = require('../models/Inventory');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));
    
    // Basic counts
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAppointments = await Appointment.countDocuments();
    
    // Today's appointments
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: startOfToday, $lte: endOfToday }
    });
    
    // Pending appointments
    const pendingAppointments = await Appointment.countDocuments({
      status: { $in: ['scheduled', 'confirmed'] },
      appointmentDate: { $gte: new Date() }
    });
    
    // Recent appointments (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentAppointments = await Appointment.find({
      appointmentDate: { $gte: weekAgo }
    })
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .sort({ appointmentDate: -1 })
      .limit(10);
    
    // Revenue stats
    const totalRevenue = await Bill.aggregate([
      { $match: { status: { $in: ['paid', 'partially-paid'] } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } }
    ]);
    
    // Inventory alerts
    const lowStockItems = await Inventory.countDocuments({
      isReorderRequired: true,
      status: 'active'
    });
    
    const expiringSoon = await Inventory.countDocuments({
      expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      status: 'active'
    });

    res.json({
      overview: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        todayAppointments,
        pendingAppointments
      },
      revenue: {
        total: totalRevenue[0]?.total || 0
      },
      alerts: {
        lowStockItems,
        expiringSoon
      },
      recentAppointments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;