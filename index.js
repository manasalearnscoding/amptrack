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
  secret: 'your-secret-key', // Change this to a strong, unique secret in production
  resave: false,
  saveUninitialized: false
}));

// --- Routes ---
app.use('/concerts', concertRoutes);
app.use('/auth', authRoutes); // << Include authentication routes

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