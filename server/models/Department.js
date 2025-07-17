const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  location: {
    building: String,
    floor: String,
    room: String
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  services: [{
    type: String,
    required: true
  }],
  operatingHours: {
    monday: { start: String, end: String, closed: { type: Boolean, default: false } },
    tuesday: { start: String, end: String, closed: { type: Boolean, default: false } },
    wednesday: { start: String, end: String, closed: { type: Boolean, default: false } },
    thursday: { start: String, end: String, closed: { type: Boolean, default: false } },
    friday: { start: String, end: String, closed: { type: Boolean, default: false } },
    saturday: { start: String, end: String, closed: { type: Boolean, default: false } },
    sunday: { start: String, end: String, closed: { type: Boolean, default: true } }
  },
  bedCapacity: {
    type: Number,
    default: 0
  },
  currentOccupancy: {
    type: Number,
    default: 0
  },
  emergencyContact: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate availability percentage
departmentSchema.virtual('availabilityPercentage').get(function() {
  if (this.bedCapacity === 0) return 100;
  return Math.round(((this.bedCapacity - this.currentOccupancy) / this.bedCapacity) * 100);
});

// Get staff count
departmentSchema.virtual('staffCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'department',
  count: true
});

departmentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Department', departmentSchema);