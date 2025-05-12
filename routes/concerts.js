const express = require('express');
const router = express.Router();
const Concert = require('../models/Concert'); // ✅ import model
const { ObjectId } = require('mongodb');

// Add a concert
router.post('/add', async (req, res) => {
  const { userId, ticketmasterId, name, date, section, price, review } = req.body;

  try {
    await Concert.create({
      userId,
      ticketmasterId,
      name,
      date,
      section,
      price,
      review
    });
    res.status(200).json({ message: 'Concert added successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add concert' });
  }
});

// Get user's concerts
router.get('/mine', async (req, res) => {
  const { userId } = req.session;

  try {
    const concerts = await Concert.find({ userId });
    res.json(concerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve concerts' });
  }
});

// Delete a concert
router.post('/delete', async (req, res) => {
  const { userId, concertId } = req.body;

  try {
    await Concert.deleteOne({ _id: concertId, userId });
    res.status(200).json({ message: 'Concert deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete concert' });
  }
});

module.exports = router;