const express = require('express');
const router = express.Router();
const Concert = require('../models/Concert'); 
const { ObjectId } = require('mongodb');

// Add a concert
router.post('/add', async (req, res) => {
  try {
    console.log('Received concert data:', req.body);
    
    // Get data from request
    const { userId, ticketmasterId, name, date, section, price, review } = req.body;
    
    if (!userId) {
      console.error('Missing userId');
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Create the concert in the database
    const newConcert = await Concert.create({
      userId,
      ticketmasterId,
      name,
      date,
      section,
      price: parseFloat(price) || 0,
      review
    });
    
    console.log('Created concert:', newConcert);
    
    // Return the created concert
    res.status(201).json({ 
      message: 'Concert added successfully!',
      concert: newConcert
    });
  } catch (err) {
    console.error('Error adding concert:', err);
    res.status(500).json({ error: 'Failed to add concert', details: err.message });
  }
});

// Get user's concerts
router.get('/mine', async (req, res) => {
  try {
    // Get userId from query parameters for simplicity
    const userId = req.query.userId;
    
    if (!userId) {
      console.error('Missing userId in query');
      return res.status(400).json({ error: 'Missing userId parameter' });
    }
    
    console.log('Fetching concerts for userId:', userId);
    
    // Find concerts for this user
    const concerts = await Concert.find({ userId }).sort({ date: -1 });
    console.log(`Found ${concerts.length} concerts`);
    
    res.json(concerts);
  } catch (err) {
    console.error('Error retrieving concerts:', err);
    res.status(500).json({ error: 'Failed to retrieve concerts', details: err.message });
  }
});

// Delete a concert
router.post('/delete', async (req, res) => {
  try {
    const { userId, concertId } = req.body;
    
    if (!userId || !concertId) {
      console.error('Missing required parameters:', { userId, concertId });
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    console.log(`Deleting concert ${concertId} for user ${userId}`);
    
    // Delete the concert
    const result = await Concert.deleteOne({ _id: concertId, userId });
    console.log('Delete result:', result);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Concert not found or not authorized to delete' });
    }
    
    res.status(200).json({ message: 'Concert deleted successfully!' });
  } catch (err) {
    console.error('Error deleting concert:', err);
    res.status(500).json({ error: 'Failed to delete concert', details: err.message });
  }
});

module.exports = router;