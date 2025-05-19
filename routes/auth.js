//DONE
const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const mongoose = require('mongoose');

const concertRoutes = require('./routes/concerts');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'amptrack-session-secret',
  resave: false,
  saveUninitialized: false
}));

app.use('/concerts', concertRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

// Also keep the old route for backward compatibility
app.get('/dashboard.html', (req, res) => {
  res.redirect('/dashboard');
});

app.get('/concerts', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/concerts.html'));
});

// Also keep the old route for backward compatibility
app.get('/concerts.html', (req, res) => {
  res.redirect('/concerts');
});

app.get('/add-concert', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/add-concert.html'));
});

// Also keep the old route for backward compatibility
app.get('/add-concert.html', (req, res) => {
  res.redirect('/add-concert');
});

app.get('/profile.html', (req, res) => {
  res.redirect('/dashboard.html');
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected successfully');
  app.listen(PORT, () => console.log(Server running at http://localhost:${PORT}));
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
