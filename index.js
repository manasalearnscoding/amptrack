//DONE
const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const mongoose = require('mongoose');

const concertRoutes = require('./routes/concerts');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3000;

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

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

app.get('/concerts.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/concerts.html'));
});

app.get('/add-concert.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/add-concert.html'));
});

app.get('/profile.html', (req, res) => {
  res.redirect('/dashboard.html');
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected successfully');
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
