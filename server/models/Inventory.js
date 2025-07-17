const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  itemCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  category: {
    type: String,
    required: true,
    enum: ['medication', 'equipment', 'supplies', 'consumables', 'instruments']
  },
  subcategory: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  supplier: {
    name: String,
    contact: String,
    email: String,
    phone: String
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0
  },
  minimumStock: {
    type: Number,
    required: true,
    min: 0
  },
  maximumStock: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['pieces', 'boxes', 'bottles', 'vials', 'kg', 'grams', 'liters', 'ml', 'units']
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    building: String,
    floor: String,
    room: String,
    shelf: String,
    position: String
  },
  batchNumber: {
    type: String,
    required: function() {
      return this.category === 'medication';
    }
  },
  expiryDate: {
    type: Date,
    required: function() {
      return this.category === 'medication' || this.category === 'consumables';
    }
  },
  manufactureDate: {
    type: Date,
    required: function() {
      return this.category === 'medication';
    }
  },
  isExpired: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued', 'recalled'],
    default: 'active'
  },
  usageTracking: [{
    date: { type: Date, default: Date.now },
    quantityUsed: Number,
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    purpose: String,
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  stockMovements: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['purchase', 'usage', 'transfer', 'adjustment', 'return'], required: true },
    quantity: Number,
    previousStock: Number,
    newStock: Number,
    reference: String,
    notes: String,
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  lastRestocked: {
    type: Date
  },
  reorderPoint: {
    type: Number,
    required: true
  },
  isReorderRequired: {
    type: Boolean,
    default: false
  },
  tags: [String],
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
inventorySchema.index({ itemCode: 1 });
inventorySchema.index({ category: 1, subcategory: 1 });
inventorySchema.index({ currentStock: 1 });
inventorySchema.index({ expiryDate: 1 });
inventorySchema.index({ isReorderRequired: 1 });

// Pre-save middleware to check expiry and reorder requirements
inventorySchema.pre('save', function(next) {
  // Check if item is expired
  if (this.expiryDate && this.expiryDate < new Date()) {
    this.isExpired = true;
  }
  
  // Check if reorder is required
  this.isReorderRequired = this.currentStock <= this.reorderPoint;
  
  next();
});

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  if (this.currentStock <= 0) return 'out-of-stock';
  if (this.currentStock <= this.minimumStock) return 'low-stock';
  if (this.currentStock <= this.reorderPoint) return 'reorder-required';
  return 'in-stock';
});

// Virtual for days until expiry
inventorySchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiryDate) return null;
  const today = new Date();
  const diffTime = this.expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for expiry status
inventorySchema.virtual('expiryStatus').get(function() {
  const days = this.daysUntilExpiry;
  if (days === null) return 'no-expiry';
  if (days < 0) return 'expired';
  if (days <= 30) return 'expiring-soon';
  return 'valid';
});

// Method to add stock movement
inventorySchema.methods.addStockMovement = function(type, quantity, reference, notes, handledBy) {
  const previousStock = this.currentStock;
  
  if (type === 'purchase' || type === 'return') {
    this.currentStock += quantity;
  } else if (type === 'usage' || type === 'transfer') {
    this.currentStock = Math.max(0, this.currentStock - quantity);
  } else if (type === 'adjustment') {
    this.currentStock = quantity; // For manual adjustments
  }
  
  this.stockMovements.push({
    type,
    quantity,
    previousStock,
    newStock: this.currentStock,
    reference,
    notes,
    handledBy
  });
  
  if (type === 'purchase') {
    this.lastRestocked = new Date();
  }
};

inventorySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);