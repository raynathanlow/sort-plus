const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  spotifyId: {
    type: String,
    required: [true, 'No Spotify ID']
  },
  display_name: {
    type: String,
  },
  refreshToken: {
    type: String,
    required: [true, 'No refresh token']
  },
  savedAlbums: {
    type: [{}],
    required: [true, 'No album IDs']
  }
});

module.exports = mongoose.model('User', UserSchema, 'users');
