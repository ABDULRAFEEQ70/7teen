const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    required: true,
    unique: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false
  },
  billDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  services: [{
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['consultation', 'procedure', 'laboratory', 'imaging', 'medication', 'room-charges', 'other'],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  totalDiscount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalTax: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  balanceAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'partially-paid', 'paid', 'overdue', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank-transfer', 'insurance', 'online', 'cheque'],
    required: false
  },
  paymentHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'bank-transfer', 'insurance', 'online', 'cheque'],
      required: true
    },
    reference: String,
    notes: String,
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  insurance: {
    provider: String,
    policyNumber: String,
    claimNumber: String,
    approvalNumber: String,
    coveragePercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    claimedAmount: {
      type: Number,
      default: 0
    },
    approvedAmount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['not-applicable', 'pending', 'approved', 'rejected', 'processing'],
      default: 'not-applicable'
    }
  },
  notes: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    required: function() {
      return this.status === 'cancelled';
    }
  },
  refundDetails: {
    amount: Number,
    reason: String,
    date: Date,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
billSchema.index({ billNumber: 1 });
billSchema.index({ patient: 1, billDate: -1 });
billSchema.index({ status: 1 });
billSchema.index({ dueDate: 1 });
billSchema.index({ 'insurance.status': 1 });

// Pre-save middleware to calculate totals and generate bill number
billSchema.pre('save', function(next) {
  if (this.isNew && !this.billNumber) {
    // Generate bill number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.billNumber = `BILL-${year}${month}${day}-${random}`;
  }
  
  // Calculate service totals
  this.services.forEach(service => {
    const subtotal = service.quantity * service.unitPrice;
    const discountAmount = (subtotal * service.discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * service.tax) / 100;
    service.totalAmount = taxableAmount + taxAmount;
  });
  
  // Calculate bill totals
  this.subtotal = this.services.reduce((sum, service) => sum + (service.quantity * service.unitPrice), 0);
  this.totalDiscount = this.services.reduce((sum, service) => {
    const serviceSubtotal = service.quantity * service.unitPrice;
    return sum + ((serviceSubtotal * service.discount) / 100);
  }, 0);
  this.totalTax = this.services.reduce((sum, service) => {
    const serviceSubtotal = service.quantity * service.unitPrice;
    const discountAmount = (serviceSubtotal * service.discount) / 100;
    const taxableAmount = serviceSubtotal - discountAmount;
    return sum + ((taxableAmount * service.tax) / 100);
  }, 0);
  
  this.totalAmount = this.subtotal - this.totalDiscount + this.totalTax;
  this.balanceAmount = this.totalAmount - this.paidAmount;
  
  // Update status based on payment
  if (this.paidAmount === 0) {
    this.status = this.status === 'draft' ? 'draft' : 'pending';
  } else if (this.paidAmount >= this.totalAmount) {
    this.status = 'paid';
    this.balanceAmount = 0;
  } else {
    this.status = 'partially-paid';
  }
  
  // Check if overdue
  if (this.status !== 'paid' && this.dueDate < new Date()) {
    this.status = 'overdue';
  }
  
  next();
});

// Method to add payment
billSchema.methods.addPayment = function(amount, method, reference, notes, receivedBy) {
  this.paymentHistory.push({
    amount,
    method,
    reference,
    notes,
    receivedBy
  });
  
  this.paidAmount += amount;
  this.balanceAmount = this.totalAmount - this.paidAmount;
  
  // Update status
  if (this.paidAmount >= this.totalAmount) {
    this.status = 'paid';
    this.balanceAmount = 0;
  } else {
    this.status = 'partially-paid';
  }
};

// Virtual for payment percentage
billSchema.virtual('paymentPercentage').get(function() {
  if (this.totalAmount === 0) return 0;
  return Math.round((this.paidAmount / this.totalAmount) * 100);
});

// Virtual for overdue days
billSchema.virtual('overdueDays').get(function() {
  if (this.status === 'paid' || this.dueDate >= new Date()) return 0;
  const diffTime = new Date() - this.dueDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

billSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Bill', billSchema);