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
    type: {},
    required: [true, "No albums sorted by duration"]
  },
  sortedByReleaseYear: {
    type: {},
    required: [true, "No albums sorted by release year"]
  },
  savedAlbums: {
    type: [{}],
    required: [true, "No saved albums"]
  }
});

module.exports = mongoose.model("User", UserSchema, "users");
