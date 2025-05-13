
const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const mongoose = require('mongoose');

const concertRoutes = require('./routes/concerts');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'amptrack-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// --- Routes ---
app.use('/concerts', concertRoutes);
app.use('/auth', authRoutes);

// Home route - Serve index.html for login/register
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Dashboard route
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

// Concerts page route
app.get('/concerts.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/concerts.html'));
});

// Explore page route
app.get('/explore.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/explore.html'));
});

// Add Concert page route
app.get('/add-concert.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/add-concert.html'));
});

// Old profile route - redirect to dashboard
app.get('/profile.html', (req, res) => {
  res.redirect('/dashboard.html');
});

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected successfully');
  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});
