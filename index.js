// index.js
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const concertRoutes = require('./routes/concerts');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'amptrack_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// --- Routes ---
app.use('/auth', authRoutes);
app.use('/concerts', concertRoutes);

// Catch-all route for client-side routing
app.get('*', (req, res) => {
  // Check if request is for a file (has extension)
  const requestedPath = req.path;
  if (path.extname(requestedPath) === '') {
    // If no extension, serve index.html for client-side routing
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    // 404 if file not found
    res.status(404).send('File not found');
  }
});

// --- Start server without MongoDB connection ---
console.log('✅ Starting in test mode (no MongoDB connection)');
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));