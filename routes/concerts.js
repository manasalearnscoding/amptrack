const express = require('express');
const router = express.Router();
const Concert = require('../models/Concert');

// Mock concert data for testing
const TEST_CONCERTS = [
  {
    _id: 'concert-id-1',
    userId: 'test-user-1234',
    ticketmasterId: 'tm-1234',
    name: 'Taylor Swift - Eras Tour',
    date: '2025-06-15',
    section: 'Floor A',
    price: 250,
    review: 'Amazing show! Loved every minute of it.',
    createdAt: new Date('2025-01-10')
  },
  {
    _id: 'concert-id-2',
    userId: 'test-user-1234',
    ticketmasterId: 'tm-5678',
    name: 'Beyoncé - Renaissance Tour',
    date: '2025-05-22',
    section: 'Lower Level 101',
    price: 180,
    review: 'Incredible performance and visuals!',
    createdAt: new Date('2025-01-05')
  },
  {
    _id: 'concert-id-3',
    userId: 'test-user-1234',
    ticketmasterId: 'tm-9012',
    name: 'Radiohead - World Tour',
    date: '2024-12-10',
    section: 'General Admission',
    price: 95,
    review: 'Perfect setlist and atmosphere.',
    createdAt: new Date('2024-11-15')
  },
  {
    _id: 'concert-id-4',
    userId: 'test-user-1234',
    ticketmasterId: 'tm-3456',
    name: 'Kendrick Lamar',
    date: '2024-10-05',
    section: 'VIP',
    price: 210,
    review: 'Best rap concert I\'ve ever attended!',
    createdAt: new Date('2024-09-30')
  }
];

// Simplified routes for testing

// Add a concert
router.post('/add', async (req, res) => {
  try {
    const { userId, ticketmasterId, name, date, section, price, review } = req.body;

    // For testing, just return success
    console.log('Added concert:', name);
    
    // Return success with a mock ID
    res.status(200).json({ 
      message: 'Concert added successfully!',
      concertId: 'new-concert-' + Date.now()
    });
  } catch (err) {
    console.error('Error adding concert:', err);
    res.status(500).json({ error: 'Failed to add concert' });
  }
});

// Get user's concerts
router.get('/mine', async (req, res) => {
  // For testing, return mock concerts
  res.json(TEST_CONCERTS);
});

// Delete a concert
router.post('/delete', async (req, res) => {
  try {
    const { userId, concertId } = req.body;

    // For testing, just return success
    console.log('Deleted concert ID:', concertId);
    
    res.status(200).json({ message: 'Concert deleted successfully!' });
  } catch (err) {
    console.error('Error deleting concert:', err);
    res.status(500).json({ error: 'Failed to delete concert' });
  }
});

// Get concert stats
router.get('/stats', async (req, res) => {
  // Return mock stats based on TEST_CONCERTS
  res.json({
    totalConcerts: TEST_CONCERTS.length,
    thisYear: 2, // Pretend 2 are from this year
    avgPrice: 184, // Average of all prices
    topSection: 'General Admission' // Most common section
  });
});

module.exports = router;