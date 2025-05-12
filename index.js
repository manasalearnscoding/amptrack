// index.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const concertRoutes = require('./routes/concerts');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes ---
app.use('/concerts', concertRoutes);  // Handles /concerts/search etc.

// Direct to profile.html for simplicity
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/profile.html'));
});

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});