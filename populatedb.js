#! /usr/bin/env node
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Album = require("./models/album");
  const Artist = require("./models/artist");
  const Genre = require("./models/genre");
  
  const genres = [];
  const artists = [];
  const albums = [];
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false); // Prepare for Mongoose 7
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createGenres();
    await createArtists();
    await createAlbums();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  
  async function genreCreate(name) {
    const genre = new Genre({ name: name });
    await genre.save();
    genres.push(genre);
    console.log(`Added genre: ${name}`);
  }
  
  async function artistCreate(band_or_first_name, last_name, founded) {
    artistdetail = { band_or_first_name: band_or_first_name, last_name: last_name };
    if (founded != false) artistdetail.founded = founded;
  
    const artist = new Artist(artistdetail);
  
    await artist.save();
    artists.push(artist);
    console.log(`Added artist: ${band_or_first_name} ${last_name}`);
  }
  
  async function albumCreate(title, summary, artist, genre, release) {
    albumdetail = {
      title: title,
      summary: summary,
      artist: artist,
      realese: release
    };
    if (genre != false) albumdetail.genre = genre;
  
    const album = new Album(albumdetail);
    await album.save();
    albums.push(album);
    console.log(`Added album: ${title}`);
  }
  
  async function createGenres() {
    console.log("Adding genres");
    await Promise.all([
      genreCreate("Rock"),
      genreCreate("Rap"),
      genreCreate("Pop"),
    ]);
  }
  
  async function createArtists() {
    console.log("Adding artists");
    await Promise.all([
      artistCreate("John", "Mayer", "1998"),
      artistCreate("Artic Monkeys", false, "2002"),
      artistCreate("The Strokes", false, "1998"),
      artistCreate("Jack", "Johnson", "1992"),
      artistCreate("Kendrick", "Lamar", "2003"),
    ]);
  }
  
  async function createAlbums() {
    console.log("Adding Albums");
    await Promise.all([
      albumCreate(
        "Continuum",
        "Continuum is the third studio album by American singer-songwriter John Mayer.",
        artists[0],
        [genres[2],genres[0]],
        "2006"
      ),
      albumCreate(
        "Heavier Things",
        "The second studio album by American singer-songwriter John Mayer.",
        artists[0],
        [genres[2]],
        "2003"
      ),
      albumCreate(
        "Room For Squares",
        "The debut studio album by American singer-songwriter John Mayer.",
        artists[0],
        [genres[2]],
        "2001"
      ),
      albumCreate(
        "Whatever People Say I Am, That's What I'm Not",
        "The debut studio album by English rock band Arctic Monkeys.",
        artists[1],
        [genres[0]],
        "2006"
      ),
      albumCreate(
        "Who the Fuck Are Arctic Monkeys?",
        "The second EP by English rock band Arctic Monkeys.",
        artists[1],
        [genres[0]],
        "2006"
      ),
      albumCreate(
        "Is This It",
        "The debut studio album by American rock band the Strokes.",
        artists[2],
        [genres[0]],
        "2001"
      ),
      albumCreate(
        "In Between Dreams",
        "The third studio album by singer-songwriter Jack Johnson.",
        artists[3],
        [genres[2]],
        "2005"
      ),
      albumCreate(
        "To Pimp a Butterfly",
        "The third studio album by American rapper Kendrick Lamar.",
        artists[4],
        [genres[1]],
        "2015"
      ),
    ]);
  }