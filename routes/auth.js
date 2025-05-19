// const express = require('express');
// const router = express.Router();
// const path = require('path'); 
// const User = require('../models/User');

// router.post('/register', async (req, res) => {
//   try {
//     const { username, password } = req.body;
    
//     if (!username || !password) {
//       return res.redirect('/?error=' + encodeURIComponent('username and password required'));
//     }

//     const existingUser = await User.findOne({ username });
//     if (existingUser) {
//       return res.redirect('/?error=' + encodeURIComponent('username already exists'));
//     }

//     const user = new User({ username, password });
//     await user.save();

//     req.session.userId = user._id;
//     return res.redirect('/dashboard.html');
//   } catch (err) {
//     return res.redirect('/?error=' + encodeURIComponent('registration failed'));
//   }
// });

// router.post('/login', async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.redirect('/?error=' + encodeURIComponent('username and password are required'));
//     }

//     const user = await User.findOne({ username, password });
//     if (!user) {
//       return res.redirect('/?error=' + encodeURIComponent('invalid username or password'));
//     }

//     req.session.userId = user._id;
//     return res.redirect('/dashboard.html');
//   } catch (err) {
//     return res.redirect('/?error=' + encodeURIComponent('login failed'));
//   }
// });

// router.get('/login', (req, res) => {
//   res.redirect('/');
// });

// router.get('/logout', (req, res) => {
//   try {
//     if (req.session) {
//       req.session.destroy();
//     }
//     return res.json({ success: true, message: 'Logged out successfully' });
//   } catch (err) {
//     return res.status(500).json({ success: false, error: 'Logout failed' });
//   }
// });

// router.get('/check', async (req, res) => {
//   if (req.session && req.session.userId) {
//     try {
//       const user = await User.findById(req.session.userId);
//       if (!user) {
//         return res.status(404).json({ loggedIn: false, error: 'User not found' });
//       }
//       return res.status(200).json({ 
//         loggedIn: true, 
//         userId: user._id, 
//         username: user.username 
//       });
//     } catch (err) {
//       return res.status(500).json({ loggedIn: false, error: 'Server error' });
//     }
//   } else {
//     return res.status(200).json({ loggedIn: false });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const path = require('path'); 
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.redirect('/?error=' + encodeURIComponent('username and password required'));
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.redirect('/?error=' + encodeURIComponent('username already exists'));
    }

    const user = new User({ username, password });
    await user.save();

    req.session.userId = user._id;
    
    // Use absolute path for redirect
    return res.redirect('/dashboard.html');
  } catch (err) {
    console.error('Register error:', err);
    return res.redirect('/?error=' + encodeURIComponent('registration failed'));
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt received:', req.body);
    
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('Missing credentials');
      return res.redirect('/?error=' + encodeURIComponent('username and password are required'));
    }

    const user = await User.findOne({ username, password });
    console.log('User found?', !!user);
    
    if (!user) {
      console.log('Invalid credentials');
      return res.redirect('/?error=' + encodeURIComponent('invalid username or password'));
    }

    req.session.userId = user._id;
    console.log('Session set, redirecting to dashboard');
    
    // Use absolute path for redirect and add status code for clarity
    return res.status(302).redirect('/dashboard.html');
  } catch (err) {
    console.error('Login error:', err);
    return res.redirect('/?error=' + encodeURIComponent('login failed: ' + err.message));
  }
});

router.get('/login', (req, res) => {
  // Redirect to root with absolute path
  return res.redirect('/');
});

router.get('/logout', (req, res) => {
  try {
    if (req.session) {
      req.session.destroy();
    }
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
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
      return res.status(500).json({ loggedIn: false, error: 'Server error' });
    }
  } else {
    return res.status(200).json({ loggedIn: false });
  }
});

module.exports = router;