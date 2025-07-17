const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visitDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  chiefComplaint: {
    type: String,
    required: true
  },
  historyOfPresentIllness: {
    type: String,
    required: true
  },
  pastMedicalHistory: {
    allergies: [String],
    medications: [String],
    surgeries: [String],
    chronicConditions: [String],
    familyHistory: [String]
  },
  physicalExamination: {
    vitalSigns: {
      temperature: Number,
      bloodPressure: {
        systolic: Number,
        diastolic: Number
      },
      heartRate: Number,
      respiratoryRate: Number,
      oxygenSaturation: Number,
      weight: Number,
      height: Number,
      bmi: Number
    },
    generalAppearance: String,
    systemsReview: {
      cardiovascular: String,
      respiratory: String,
      gastrointestinal: String,
      neurological: String,
      musculoskeletal: String,
      dermatological: String,
      genitourinary: String,
      psychiatric: String
    }
  },
  diagnosis: {
    primary: String,
    secondary: [String],
    differential: [String]
  },
  treatment: {
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    procedures: [{
      name: String,
      date: Date,
      notes: String
    }],
    referrals: [{
      specialist: String,
      department: String,
      reason: String,
      urgency: { type: String, enum: ['routine', 'urgent', 'emergent'], default: 'routine' }
    }]
  },
  labResults: [{
    testName: String,
    orderDate: Date,
    resultDate: Date,
    results: String,
    normalRange: String,
    interpretation: String,
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }
  }],
  imagingResults: [{
    studyType: String,
    orderDate: Date,
    studyDate: Date,
    findings: String,
    impression: String,
    radiologist: String,
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }
  }],
  followUpInstructions: {
    type: String,
    default: ''
  },
  nextAppointment: {
    recommended: Boolean,
    timeFrame: String,
    urgency: { type: String, enum: ['routine', 'urgent', 'emergent'], default: 'routine' }
  },
  notes: {
    type: String,
    default: ''
  },
  attachments: [{
    fileName: String,
    fileType: String,
    fileSize: Number,
    uploadDate: { type: Date, default: Date.now },
    filePath: String
  }],
  isConfidential: {
    type: Boolean,
    default: false
  },
  accessLog: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: String,
    timestamp: { type: Date, default: Date.now },
    ipAddress: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
medicalRecordSchema.index({ patient: 1, visitDate: -1 });
medicalRecordSchema.index({ doctor: 1, visitDate: -1 });
medicalRecordSchema.index({ appointment: 1 });

// Calculate BMI if height and weight are provided
medicalRecordSchema.pre('save', function(next) {
  if (this.physicalExamination?.vitalSigns?.height && this.physicalExamination?.vitalSigns?.weight) {
    const heightInMeters = this.physicalExamination.vitalSigns.height / 100;
    this.physicalExamination.vitalSigns.bmi = Math.round((this.physicalExamination.vitalSigns.weight / (heightInMeters * heightInMeters)) * 10) / 10;
  }
  next();
});

// Virtual for BMI category
medicalRecordSchema.virtual('bmiCategory').get(function() {
  const bmi = this.physicalExamination?.vitalSigns?.bmi;
  if (!bmi) return null;
  
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
});

medicalRecordSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);