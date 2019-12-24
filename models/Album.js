const mongoose = require("mongoose");

const { Schema } = mongoose;

const AlbumSchema = new Schema({
  id: {
    // id assigned and used by Spotify
    type: String,
    required: [true, "No id"]
  },
  name: {
    type: String,
    required: [true, "No name"]
  },
  artistNames: {
    type: [String],
    required: [true, "No artist names"]
  },
  duration_ms: {
    type: Number,
    required: [true, "No duration"]
  },
  prettyDuration: {
    type: String,
    required: [true, "No pretty duration"]
  },
  releaseYear: {
    type: Number,
    required: [true, "No release year"]
  },
  publicUrl: {
    type: String,
    required: [true, "No public url"]
  },
  images: {
    // Spotify's array of image objects of varying sizes
    type: {},
    required: [true, "No images"]
  },
  totalTracks: {
    type: Number,
    required: [true, "No total tracks"]
  },
  explicit: {
    type: Boolean,
    required: [true, "No explicit"]
  }
});

module.exports = mongoose.model("Album", AlbumSchema, "albums");
