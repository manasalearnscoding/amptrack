const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    sparse: true,  // This allows null/undefined values without causing uniqueness conflicts
    unique: true
  },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  concerts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Concert' }]
});

module.exports = mongoose.model('User', userSchema);