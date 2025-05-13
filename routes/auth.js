const express = require('express');
const router = express.Router();
const User = require('../models/User');
require('../db'); // Ensures DB connection

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const user = new User({ username, password });
    await user.save();

    req.session.userId = user._id;
    res.redirect('/');
    //DISPLAY ON FRONTEND THAT REGISTRATION SUCCEEDED

    // return res.status(200).json({
    //   message: 'Registration successful',
    //   userId: user._id
    // });
  } catch (err) {
    console.error('Registration error:', err);
    // return res.status(500).json({ error: 'Registration failed' });

    //DISPLAY ON FRONTEND THAT REGISTRATION FAILED
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    req.session.userId = user._id;

    // return res.status(200).json({
    //   message: 'Login successful',
    //   userId: user._id
    // });
        //DISPLAY ON FRONTEND THAT LOGIN SUCCEEDED
    res.redirect('/profile.html');
  } catch (err) {
    console.error('Login error:', err);
    // return res.status(500).json({ error: 'Login failed' });

    //DISPLAY ON FRONTEND THAT LOGIN FAILED
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

// router.get('/check', (req, res) => {
//   if (req.session.userId) {
//     return res.status(200).json({ loggedIn: true, userId: req.session.userId });
//   } else {
//     return res.status(200).json({ loggedIn: false });
//   }
// });

router.get('/check', async (req, res) => {
  if (req.session.userId) {
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