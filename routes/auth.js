const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Mock user for testing
const TEST_USER = {
  _id: 'test-user-1234',
  username: 'TestUser'
};

// Bypass authentication routes
router.post('/register', async (req, res) => {
  // For testing, just redirect to dashboard
  console.log('Registration bypassed for testing');
  res.redirect('/dashboard.html');
});

router.post('/login', async (req, res) => {
  // For testing, just redirect to dashboard
  console.log('Login bypassed for testing');
  res.redirect('/dashboard.html');
});

router.get('/logout', (req, res) => {
  // Still allow logout
  req.session.destroy();
  res.redirect('/');
});

// Modified to always return test user
router.get('/user', (req, res) => {
  // Always return authenticated test user
  res.json({
    authenticated: true,
    userId: TEST_USER._id,
    username: TEST_USER.username
  });
});

module.exports = router;