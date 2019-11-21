const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  spotifyId: {
    type: String,
    required: true
  },
  display_name: {
    type: String,
  },
  refreshToken: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('User', UserSchema, 'users');
