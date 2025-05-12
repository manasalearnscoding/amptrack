const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    
    // Create the new user
    const user = new User({ username, password });
    await user.save();
    
    // Set up session
    req.session.userId = user._id;
    
    // Return user ID for client-side storage
    return res.status(200).json({
      message: 'Registration successful',
      userId: user._id
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Find the user
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Set up session
    req.session.userId = user._id;
    
    // Return user ID for client-side storage
    return res.status(200).json({
      message: 'Login successful',
      userId: user._id
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    res.status(200).json({ message: 'Logout successful' });
  });
});

// Check if user is logged in
router.get('/check', (req, res) => {
  if (req.session.userId) {
    return res.status(200).json({ loggedIn: true, userId: req.session.userId });
  } else {
    return res.status(200).json({ loggedIn: false });
  }
});

module.exports = router;