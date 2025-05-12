// index.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const concertRoutes = require('./routes/concerts');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'amptrack_secret', // You can store this in .env as SESSION_SECRET
  resave: false,
  saveUninitialized: false
}));

// --- Routes ---
app.use('/auth', authRoutes);         // Handles /auth/register, /auth/login etc.
app.use('/concerts', concertRoutes);  // Handles /concerts/search etc.

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI , {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});
