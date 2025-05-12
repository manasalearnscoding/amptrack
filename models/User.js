const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  concerts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Concert' }]
});

module.exports = mongoose.model('User', userSchema);
