const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema({
  spotifyId: {
    type: String,
    required: [true, "No Spotify ID"]
  },
  display_name: {
    type: String
  },
  refreshToken: {
    type: String,
    required: [true, "No refresh token"]
  },
  sortedByDuration: {
    // object where each key is an array of album IDs for each duration group
    type: {},
    required: [true, "No albums sorted by duration"]
  },
  sortedByReleaseYear: {
    // object where each key is an array of album IDs for each release year group
    type: {},
    required: [true, "No albums sorted by release year"]
  },
  savedAlbums: {
    // array of album IDs
    type: [{}],
    required: [true, "No saved albums"]
  },
  savedAlbumCovers: {
    // array of URLs
    type: [String],
    required: [true, "No saved album covers"]
  }
});

module.exports = mongoose.model("User", UserSchema, "users");
