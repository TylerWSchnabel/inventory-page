const Album = require("../models/album");
const Artist = require("../models/artist");
const Genre = require("../models/genre");
const async = require("async");
const album = require("../models/album");
const { body, validationResult } = require("express-validator");

exports.index = (req, res) => {
    async.parallel(
      {
        album_count(callback) {
          Album.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        artist_count(callback) {
          Artist.countDocuments({}, callback);
        },
        genre_count(callback) {
          Genre.countDocuments({}, callback);
        },
      },
      (err, results) => {
        res.render("index", {
          title: "Tyler's Records Home",
          error: err,
          data: results,
        });
      }
    );
  };

// Display list of all albums.
exports.album_list = (req, res) => {
  Album.find({}, "title artist")
    .sort({ title: 1 })
    .populate("artist")
    .exec(function (err, list_albums){
        if(err) {
            return next(err);
        }

        res.render("album_list", {title: "Album List", album_list: list_albums});
    })
};

// Display detail page for a specific album.
exports.album_detail = (req, res, next) => {
  async.parallel(
    {
        album(callback) {
            Album.findById(req.params.id)
            .populate("artist")
            .populate("genre")
            .exec(callback)
        },
    },
    (err, results) => {
        if (err) {
            return next(err);
        }
        if ( results.album == null ) {
            const err = new Error("Album not found");
            err.status = 404
            return next(err);
        }
        res.render("album_detail",{
            title: results.album.title,
            album: results.album,
        })
    }
  )
};

// Display album create form on GET.
exports.album_create_get = (req, res, next) => {
    // Get all artists and genres, which we can use for adding to our album.
    async.parallel(
      {
        artist(callback) {
          Artist.find(callback);
        },
        genres(callback) {
          Genre.find(callback);
        },
      },
      (err, results) => {
        if (err) {
          return next(err);
        }
        res.render("album_form", {
          title: "Create Album",
          artists: results.artists,
          genres: results.genres,
        });
      }
    );
  };
  
  
  // Handle album create on POST.
  exports.album_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
      if (!Array.isArray(req.body.genre)) {
        req.body.genre =
          typeof req.body.genre === "undefined" ? [] : [req.body.genre];
      }
      next();
    },
  
    // Validate and sanitize fields.
    body("title", "Title must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("artist", "Artist must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("summary", "Summary must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("genre.*").escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a Album object with escaped and trimmed data.
      const album = new Album({
        title: req.body.title,
        artist: req.body.artist,
        summary: req.body.summary,
        genre: req.body.genre,
      });
  
      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
  
        // Get all artists and genres for form.
        async.parallel(
          {
            artist(callback) {
              Artist.find(callback);
            },
            genres(callback) {
              Genre.find(callback);
            },
          },
          (err, results) => {
            if (err) {
              return next(err);
            }
  
            // Mark our selected genres as checked.
            for (const genre of results.genres) {
              if (album.genre.includes(genre._id)) {
                genre.checked = "true";
              }
            }
            res.render("album_form", {
              title: "Create Album",
              artists: results.artists,
              genres: results.genres,
              album,
              errors: errors.array(),
            });
          }
        );
        return;
      }
  
      // Data from form is valid. Save album.
      album.save((err) => {
        if (err) {
          return next(err);
        }
        // Successful: redirect to new album record.
        res.redirect(album.url);
      });
    },
  ];
  
  
  // Display album delete form on GET.
  exports.album_delete_get = (req, res, next) => {
    async.parallel(
      {
        album(callback) {
          Album.findById(req.params.id).exec(callback);
        },
      },
      (err, results) => {
        if (err) {
          return next(err);
        }
        if (results.album == null) {
          // No results.
          res.redirect("/albums");
        }
        // Successful, so render.
        res.render("album_delete", {
          title: "Delete Album",
          album: results.album,
        });
      }
    );
  };
  
  
  // Handle album delete on POST.
  exports.album_delete_post = (req, res, next) => {
    async.parallel(
      {
        album(callback) {
          Album.findById(req.body.albumid).exec(callback);
        },
      },
      (err, results) => {
        if (err) {
          return next(err);
        }
        // Success
        // Artist has no albums. Delete object and redirect to the list of artists.
        Album.findByIdAndRemove(req.body.albumid, (err) => {
          if (err) {
            return next(err);
          }
          // Success - go to artist list
          res.redirect("/albums");
        });
      }
    );
  };
  
  
  // Display album update form on GET.
  exports.album_update_get = (req, res, next) => {
    // Get album, artists and genres for form.
    async.parallel(
      {
        album(callback) {
            Album.findById(req.params.id)
            .populate("artist")
            .populate("genre")
            .exec(callback)
        },
        artists(callback) {
          Artist.find(callback);
        },
        genres(callback) {
          Genre.find(callback);
        },
      },
      (err, results) => {
        if (err) {
          return next(err);
        }
        if (results.album == null) {
          // No results.
          const err = new Error("Album not found");
          err.status = 404;
          return next(err);
        }
        // Success.
        // Mark our selected genres as checked.
        for (const genre of results.genres) {
          for (const albumGenre of results.album.genre) {
            if (genre._id.toString() === albumGenre._id.toString()) {
              album.checked = "true";
            }
          }
        }
        res.render("album_form", {
          title: "Update Album",
          artists: results.artists,
          genres: results.genres,
          album: results.album,
        });
      }
    );
  };
  
  
  // Handle album update on POST.
  exports.album_update_post = [
    // Convert the genre to an array
    (req, res, next) => {
      if (!Array.isArray(req.body.genre)) {
        req.body.genre =
          typeof req.body.genre === "undefined" ? [] : [req.body.genre];
      }
      next();
    },
  
    // Validate and sanitize fields.
    body("title", "Title must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("artist", "Artist must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("summary", "Summary must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("genre.*").escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a Album object with escaped/trimmed data and old id.
      const album = new Album({
        title: req.body.title,
        artist: req.body.artist,
        summary: req.body.summary,
        genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
        _id: req.params.id, //This is required, or a new ID will be assigned!
      });
  
      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
  
        // Get all artists and genres for form.
        async.parallel(
          {
            artists(callback) {
              Artist.find(callback);
            },
            genres(callback) {
              Genre.find(callback);
            },
          },
          (err, results) => {
            if (err) {
              return next(err);
            }
  
            // Mark our selected genres as checked.
            for (const genre of results.genres) {
              if (album.genre.includes(genre._id)) {
                genre.checked = "true";
              }
            }
            res.render("album_form", {
              title: "Update Album",
              artists: results.artists,
              genres: results.genres,
              album,
              errors: errors.array(),
            });
          }
        );
        return;
      }
  
      // Data from form is valid. Update the record.
      Album.findByIdAndUpdate(req.params.id, album, {}, (err, thealbum) => {
        if (err) {
          return next(err);
        }
  
        // Successful: redirect to album detail page.
        res.redirect(thealbum.url);
      });
    },
  ];
  
  