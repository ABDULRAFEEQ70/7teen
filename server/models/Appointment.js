const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 30, // in minutes
    required: true
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'surgery', 'checkup'],
    default: 'consultation'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  symptoms: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  diagnosis: {
    type: String,
    default: ''
  },
  prescription: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  labTests: [{
    testName: String,
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    results: String,
    orderedDate: { type: Date, default: Date.now }
  }],
  followUpDate: {
    type: Date
  },
  consultationFee: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partially-paid', 'refunded'],
    default: 'pending'
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ appointmentDate: 1, doctor: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });

// Virtual for appointment end time
appointmentSchema.virtual('endTime').get(function() {
  if (this.appointmentTime && this.duration) {
    const [hours, minutes] = this.appointmentTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + this.duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  }
  return null;
});

// Virtual for full appointment datetime
appointmentSchema.virtual('fullDateTime').get(function() {
  if (this.appointmentDate && this.appointmentTime) {
    const [hours, minutes] = this.appointmentTime.split(':').map(Number);
    const datetime = new Date(this.appointmentDate);
    datetime.setHours(hours, minutes, 0, 0);
    return datetime;
  }
  return null;
});

// Check if appointment is upcoming
appointmentSchema.virtual('isUpcoming').get(function() {
  return this.fullDateTime && this.fullDateTime > new Date() && ['scheduled', 'confirmed'].includes(this.status);
});

// Check if appointment is overdue
appointmentSchema.virtual('isOverdue').get(function() {
  return this.fullDateTime && this.fullDateTime < new Date() && ['scheduled', 'confirmed'].includes(this.status);
});

appointmentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Appointment', appointmentSchema);