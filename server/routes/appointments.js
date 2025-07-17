const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Department = require('../models/Department');
const { auth, authorize, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post('/', auth, [
  body('patient').isMongoId().withMessage('Valid patient ID is required'),
  body('doctor').isMongoId().withMessage('Valid doctor ID is required'),
  body('department').isMongoId().withMessage('Valid department ID is required'),
  body('appointmentDate').isISO8601().withMessage('Valid date is required'),
  body('appointmentTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format (HH:MM) is required'),
  body('symptoms').trim().notEmpty().withMessage('Symptoms are required'),
  body('consultationFee').isNumeric().withMessage('Valid consultation fee is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      patient,
      doctor,
      department,
      appointmentDate,
      appointmentTime,
      duration = 30,
      type = 'consultation',
      priority = 'medium',
      symptoms,
      consultationFee
    } = req.body;

    // Verify patient exists
    const patientUser = await User.findById(patient);
    if (!patientUser || patientUser.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Verify doctor exists
    const doctorUser = await User.findById(doctor);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check for conflicting appointments
    const appointmentDateTime = new Date(appointmentDate);
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    const endDateTime = new Date(appointmentDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + duration);

    // Check doctor availability
    const conflictingAppointments = await Appointment.find({
      doctor,
      appointmentDate: {
        $gte: new Date(appointmentDate).setHours(0, 0, 0, 0),
        $lt: new Date(appointmentDate).setHours(23, 59, 59, 999)
      },
      status: { $in: ['scheduled', 'confirmed', 'in-progress'] },
      $or: [
        {
          $expr: {
            $and: [
              { $lte: [{ $dateFromString: { dateString: { $concat: [{ $dateToString: { date: '$appointmentDate', format: '%Y-%m-%d' } }, 'T', '$appointmentTime'] } } }, appointmentDateTime] },
              { $gt: [{ $add: [{ $dateFromString: { dateString: { $concat: [{ $dateToString: { date: '$appointmentDate', format: '%Y-%m-%d' } }, 'T', '$appointmentTime'] } } }, { $multiply: ['$duration', 60000] }] }, appointmentDateTime] }
            ]
          }
        },
        {
          $expr: {
            $and: [
              { $lt: [{ $dateFromString: { dateString: { $concat: [{ $dateToString: { date: '$appointmentDate', format: '%Y-%m-%d' } }, 'T', '$appointmentTime'] } } }, endDateTime] },
              { $gte: [{ $add: [{ $dateFromString: { dateString: { $concat: [{ $dateToString: { date: '$appointmentDate', format: '%Y-%m-%d' } }, 'T', '$appointmentTime'] } } }, { $multiply: ['$duration', 60000] }] }, endDateTime] }
            ]
          }
        }
      ]
    });

    if (conflictingAppointments.length > 0) {
      return res.status(400).json({ message: 'Doctor is not available at this time' });
    }

    const appointment = new Appointment({
      patient,
      doctor,
      department,
      appointmentDate,
      appointmentTime,
      duration,
      type,
      priority,
      symptoms,
      consultationFee,
      createdBy: req.user.id
    });

    await appointment.save();
    await appointment.populate(['patient', 'doctor', 'department', 'createdBy']);

    // Emit real-time notification
    req.io.emit('new_appointment', {
      appointment,
      message: `New appointment scheduled for ${patientUser.fullName} with Dr. ${doctorUser.fullName}`
    });

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments
// @desc    Get appointments (filtered by role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      date,
      doctor,
      patient,
      department,
      type,
      priority
    } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    } else if (req.user.role === 'nurse' || req.user.role === 'receptionist') {
      if (req.user.department) {
        query.department = req.user.department;
      }
    }

    // Apply additional filters
    if (status) query.status = status;
    if (doctor) query.doctor = doctor;
    if (patient) query.patient = patient;
    if (department) query.department = department;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: startDate, $lte: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName phone email dateOfBirth gender bloodGroup')
      .populate('doctor', 'firstName lastName specialization consultationFee')
      .populate('department', 'name location phone')
      .populate('createdBy', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appointmentDate: 1, appointmentTime: 1 });

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

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate('doctor')
      .populate('department')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check access permissions
    const { role, id: userId } = req.user;
    if (role === 'patient' && appointment.patient._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (role === 'doctor' && appointment.doctor._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check permissions
    const { role, id: userId } = req.user;
    if (role === 'patient' && appointment.patient.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allowedUpdates = [
      'appointmentDate', 'appointmentTime', 'duration', 'type', 'priority',
      'symptoms', 'notes', 'status', 'diagnosis', 'prescription', 'labTests',
      'followUpDate'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    updates.updatedBy = userId;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate(['patient', 'doctor', 'department']);

    // Emit real-time notification for status changes
    if (req.body.status) {
      req.io.emit('appointment_updated', {
        appointment: updatedAppointment,
        message: `Appointment status updated to ${req.body.status}`
      });
    }

    res.json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check permissions
    const { role, id: userId } = req.user;
    if (role === 'patient' && appointment.patient.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    appointment.status = 'cancelled';
    appointment.updatedBy = userId;
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments/doctor/:doctorId/availability
// @desc    Get doctor availability for a specific date
// @access  Private
router.get('/doctor/:doctorId/availability', auth, async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const doctor = await User.findById(req.params.doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Get existing appointments for the date
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctor: req.params.doctorId,
      appointmentDate: { $gte: startDate, $lte: endDate },
      status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
    }).select('appointmentTime duration');

    // Generate available time slots (9 AM to 5 PM, 30-minute slots)
    const timeSlots = [];
    const startHour = 9;
    const endHour = 17;
    const slotDuration = 30;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if this slot conflicts with any appointment
        const isBooked = appointments.some(apt => {
          const aptStartTime = apt.appointmentTime;
          const [aptHour, aptMinute] = aptStartTime.split(':').map(Number);
          const aptStartMinutes = aptHour * 60 + aptMinute;
          const aptEndMinutes = aptStartMinutes + apt.duration;
          
          const slotStartMinutes = hour * 60 + minute;
          const slotEndMinutes = slotStartMinutes + slotDuration;
          
          return (slotStartMinutes < aptEndMinutes && slotEndMinutes > aptStartMinutes);
        });

        timeSlots.push({
          time: timeString,
          available: !isBooked
        });
      }
    }

    res.json({
      doctor: {
        id: doctor._id,
        name: doctor.fullName,
        specialization: doctor.specialization,
        consultationFee: doctor.consultationFee
      },
      date,
      timeSlots
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments/stats
// @desc    Get appointment statistics
// @access  Private (Admin, Doctor)
router.get('/stats', auth, authorize('admin', 'doctor'), async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    let query = { appointmentDate: { $gte: startDate } };
    
    // If doctor, filter by their appointments
    if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    }

    const stats = await Appointment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalFees: { $sum: '$consultationFee' }
        }
      }
    ]);

    const totalAppointments = await Appointment.countDocuments(query);
    const upcomingAppointments = await Appointment.countDocuments({
      ...query,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    res.json({
      period,
      totalAppointments,
      upcomingAppointments,
      statusBreakdown: stats,
      totalRevenue: stats.reduce((sum, stat) => sum + stat.totalFees, 0)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;