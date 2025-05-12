const mongoose = require('mongoose');

const concertSchema = new mongoose.Schema({
  userId: String,
  ticketmasterId: String,
  name: String,
  date: String,
  section: String,
  price: Number,
  review: String
});

module.exports = mongoose.model('Concert', concertSchema);