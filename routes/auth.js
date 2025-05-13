
const express = require('express');
const router = express.Router();
const User = require('../models/User');
require('../db'); // Ensures DB connection

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.redirect('/?error=' + encodeURIComponent('Username and password are required'));
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.redirect('/?error=' + encodeURIComponent('Username already exists'));
    }

    const user = new User({ username, password });
    await user.save();

    req.session.userId = user._id;
    return res.redirect('/dashboard.html?success=' + encodeURIComponent('Registration successful! Welcome to Amptrack.'));
  } catch (err) {
    console.error('Registration error:', err);
    return res.redirect('/?error=' + encodeURIComponent('Registration failed. Please try again.'));
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.redirect('/?error=' + encodeURIComponent('Username and password are required'));
    }

    const user = await User.findOne({ username, password });
    if (!user) {
      return res.redirect('/?error=' + encodeURIComponent('Invalid username or password'));
    }

    req.session.userId = user._id;
    return res.redirect('/dashboard.html?success=' + encodeURIComponent('Login successful! Welcome back.'));
  } catch (err) {
    console.error('Login error:', err);
    return res.redirect('/?error=' + encodeURIComponent('Login failed. Please try again.'));
  }
});

router.get('/logout', (req, res) => {
  try {
    // Destroy the session
    if (req.session) {
      req.session.destroy();
    }
    // Return a success response
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ success: false, error: 'Logout failed' });
  }
});

router.get('/check', async (req, res) => {
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (!user) {
        return res.status(404).json({ loggedIn: false, error: 'User not found' });
      }
      return res.status(200).json({ 
        loggedIn: true, 
        userId: user._id, 
        username: user.username 
      });
    } catch (err) {
      console.error('Error fetching user for /check:', err);
      return res.status(500).json({ loggedIn: false, error: 'Server error' });
    }
  } else {
    return res.status(200).json({ loggedIn: false });
  }
});

module.exports = router;