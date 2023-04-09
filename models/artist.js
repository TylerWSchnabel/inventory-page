const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ArtistSchema = new Schema({
  band_or_first_name: { type: String, required: true, maxLength: 100 },
  last_name: { type: String, maxLength: 100 },
  founded: { type: String, min: 1900 , max: 2099 },
});

// Virtual for author's full name
ArtistSchema.virtual("name").get(function () {
  // To avoid errors in cases where an author does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case
  let fullname = "";
  if (this.band_or_first_name && this.last_name) {
    fullname = `${this.last_name}, ${this.band_or_first_name}`;
  }
  if (this.band_or_first_name && !this.last_name) {
    fullname = `${this.band_or_first_name}`;
  }
  if (!this.band_or_first_name && this.last_name){
    fullname = `${this.last_name}`;
  }
  if (!this.band_or_first_name && !this.last_name) {
    fullname = ""
  }
  return fullname;
  
});

// Virtual for author's URL
ArtistSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/artist/${this._id}`;
});

// Export model
module.exports = mongoose.model("Artist", ArtistSchema);
