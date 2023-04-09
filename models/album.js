const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AlbumSchema = new Schema({
  title: { type: String, required: true },
  artist: { type: Schema.Types.ObjectId, ref: "Artist", required: true },
  summary: { type: String, required: true },
  release: { type: "number", min: 1900 , max: 2099 },
  genre: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
});

// Virtual for book's URL
AlbumSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/album/${this._id}`;
});

// Export model
module.exports = mongoose.model("Album", AlbumSchema);
