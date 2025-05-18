//DONE
const express = require('express');
const router = express.Router();
const Concert = require('../models/Concert'); 
const User = require('../models/User'); 

router.post('/add', async (req, res) => {
  try {

    const { username, ticketmasterId, name, date, venue, price, review } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'missing username' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
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


    res.status(201).json({ 
      message: 'concert added',
      concert: newConcert
    });
  } catch (err) {
    res.status(500).json({ error: 'failed to add concert', details: err.message });
  }
});

router.get('/mine', async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: 'missing username param' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }

    const concerts = await Concert.find({ userId: user._id });

    res.json(concerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve concerts', details: err.message });
  }
});

router.post('/delete', async (req, res) => {
  try {
    const { username, concertId } = req.body;

    if (!username || !concertId) {
      return res.status(400).json({ error: 'missing required params' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }

    const result = await Concert.deleteOne({ _id: concertId, userId: user._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'could not delete concert' });
    }

    res.status(200).json({ message: 'concert deleted' });
  } catch (err) {
    res.status(500).json({ error: 'failed to delete concert', details: err.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const keyword = req.query.keyword;
    
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }
    
    const apiKey = process.env.TM_API_KEY;
    
    const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?size=10&keyword=${encodeURIComponent(keyword)}&apikey=${apiKey}`);
    
    if (!response.ok) {
      throw new Error(`Ticketmaster API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    res.json(data);
    
  } catch (error) {
    // console.error('Error searching Ticketmaster API:', error);
    res.status(500).json({ error: 'Failed to fetch concert data' });
  }
});


module.exports = router;