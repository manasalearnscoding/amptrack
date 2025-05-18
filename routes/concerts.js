const express = require('express');
const router = express.Router();
const Concert = require('../models/Concert'); 
const User = require('../models/User'); 
const { ObjectId } = require('mongodb');

router.post('/add', async (req, res) => {
  try {
    console.log('Received concert data:', req.body);

    const { username, ticketmasterId, name, date, venue, price, review } = req.body;

    if (!username) {
      console.error('Missing username');
      return res.status(400).json({ error: 'Missing username' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newConcert = await Concert.create({
      userId: user._id,
      ticketmasterId,
      name,
      date,
      venue,
      price: parseFloat(price) || 0,
      review
    });

    console.log('Created concert:', newConcert);

    res.status(201).json({ 
      message: 'Concert added successfully!',
      concert: newConcert
    });
  } catch (err) {
    console.error('Error adding concert:', err);
    res.status(500).json({ error: 'Failed to add concert', details: err.message });
  }
});

router.get('/mine', async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      console.error('Missing username in query');
      return res.status(400).json({ error: 'Missing username parameter' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Fetching concerts for userId:', user._id);

    const concerts = await Concert.find({ userId: user._id }).sort({ date: -1 });
    console.log(`Found ${concerts.length} concerts`);

    res.json(concerts);
  } catch (err) {
    console.error('Error retrieving concerts:', err);
    res.status(500).json({ error: 'Failed to retrieve concerts', details: err.message });
  }
});

router.post('/delete', async (req, res) => {
  try {
    const { username, concertId } = req.body;

    if (!username || !concertId) {
      console.error('Missing required parameters:', { username, concertId });
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`Deleting concert ${concertId} for user ${user._id}`);

    const result = await Concert.deleteOne({ _id: concertId, userId: user._id });
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