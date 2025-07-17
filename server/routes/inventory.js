const express = require('express');
const Inventory = require('../models/Inventory');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/inventory
// @desc    Get inventory items
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, search } = req.query;
    
    let query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { itemCode: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Inventory.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ itemName: 1 });

    const total = await Inventory.countDocuments(query);

    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/inventory
// @desc    Add new inventory item
// @access  Private (Admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const item = new Inventory(req.body);
    await item.save();
    
    res.status(201).json({
      message: 'Inventory item added successfully',
      item
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;