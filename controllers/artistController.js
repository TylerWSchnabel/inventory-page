const Artist = require("../models/artist");
const Album =require("../models/album")
const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all Artists.
exports.artist_list = (req, res) => {  
    Artist.find()
    .sort([["band_or_first_name", "ascending"]])
    .exec(function (err, list_artists){
        if(err){
            return next(err);
        }
        res.render("artist_list", {
            title: "Artist List",
            artist_list: list_artists
        });
    });
};

// Display detail page for a specific Artist.
exports.artist_detail = (req, res) => {
  async.parallel(
    {
        artist(callback){
            Artist.findById(req.params.id).exec(callback);
           },
        artist_albums(callback){
            Album.find({ artist: req.params.id }, "title summary").exec(callback);
        }
    },
    (err, results) => {
        if(err) {
            return next(err);
        }
        if (results.artist ==null){
            const err = new Error("Artist not found");
            err.status = 404;
            return next(err);
        }
        res.render("artist_detail", {
            title: "Artist Deatail",
            artist: results.artist,
            artist_albums: results.artist_albums,
        })
    }
  )
};

// Display Artist create form on GET.
exports.artist_create_get = (req, res) => {
  res.render("artist_form", {title: "Create Artist"});
};

// Handle Artist create on POST.
exports.artist_create_post = [
    // Validate and sanitize fields.
    body("band_or_first_name")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Band or first name must be specified."),
    body("last_name")
      .trim()
      .optional({ checkFalsy: true })
      .escape(),
    body("founded", "Invalid year founded")
      .optional({ checkFalsy: true }),
    // Process request after validation and sanitization.
    (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.render("artist_form", {
          title: "Create Artist",
          artist: req.body,
          errors: errors.array(),
        });
        return;
      }
      // Data from form is valid.
  
      // Create an Artist object with escaped and trimmed data.
      const artist = new Artist({
        band_or_first_name: req.body.band_or_first_name,
        last_name: req.body.last_name,
        founded: req.body.founded,
      });
      artist.save((err) => {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new Artist record.
        res.redirect(artist.url);
      });
    },
  ];
  

// Display Artist delete form on GET.
exports.artist_delete_get = (req, res) => [
    async.parallel(
        {
            artist(callback) {
                Artist.findById(req.params.id).exec(callback);
            },
            artist_albums(callback){
                Album.find({artist: req.params.id}).exec(callback);
            },
        },
        (err, results)=> {
            if (err) {
                return next(err);
            }
            if (results.artist == null){
                res.redirect("/artists")
            }
            res.render("artist_delete", {
                title: "Delete Artist",
                artist: results.artist,
                artist_albums: results.artist_albums,
            })
        }
    )

];

// Handle Artist delete on POST.
exports.artist_delete_post = (req, res) => {
  async.parallel(
    {
        artist(callback){
            Artist.findById(req.body.artistid).exec(callback);
        },
        artist_albums(callback) {
            Album.find({ artist: req.body.artistid}).exec(callback);
        },
    },
  (err, results) => {
    if (err) {
        return next(err);
    }
    if (results.artist_albums.length > 0){
        res.render("artist_delete", {
            title: "Delete Artist",
            artist: results.artist,
            artist_books: results.artist_albums,
        });
        return;
    }
    Artist.findByIdAndRemove(req.body.artistid, (err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/artists")
    })
  }
  )
};

// Display Artist update form on GET.
exports.artist_delete_post = (req, res, next) => {
    async.parallel(
      {
        artist(callback) {
          Artist.findById(req.body.artistid).exec(callback);
        },
        artists_books(callback) {
          Book.find({ artist: req.body.artistid }).exec(callback);
        },
      },
      (err, results) => {
        if (err) {
          return next(err);
        }
        // Success
        if (results.artists_albums.length > 0) {
          // Artist has books. Render in same way as for GET route.
          res.render("artist_delete", {
            title: "Delete Artist",
            artist: results.artist,
            artist_books: results.artists_books,
          });
          return;
        }
        // Artist has no books. Delete object and redirect to the list of Artists.
        Artist.findByIdAndRemove(req.body.artistid, (err) => {
          if (err) {
            return next(err);
          }
          // Success - go to artist list
          res.redirect("/artists");
        });
      }
    );
  };
  
  
  // Display Artist update form on GET.
  exports.artist_update_get = (req, res, next) => {
    Artist.findById(req.params.id, (err, artist) => {
        if (err) {
          return next(err);
        }
        if (artist == null) {
          // No results.
          const err = new Error("Artist not found");
          err.status = 404;
          return next(err);
        }
        // Success.
        res.render("artist_form", {
          title: "Update Artist",
          artist: artist
        });
      })
  };
  
  
  // Handle Artist update on POST.
  exports.artist_update_post = [
    // Validate and sanitize fields.
    body("band_or_first_name")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Band or first name must be specified."),
    body("last_name")
      .trim()
      .optional({ checkFalsy: true })
      .escape(),
    body("founded", "Invalid year founded")
      .optional({ checkFalsy: true }),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a Book object with escaped/trimmed data and old id.
      const artist = new Artist({
        band_or_first_name: req.body.band_or_first_name,
        last_name: req.body.last_name,
        founded: req.body.founded,
        _id: req.params.id
      });
  
      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        res.render("artist_form", {
          title: "Update Artist",
          artist: artist,
          errors: errors.array(),
        });
        return;
      } else {
        Artist.findByIdAndUpdate(req.params.id, artist, {}, (err, theartist) => {
          if (err) {
            return next(err);
          }
          // Successful: redirect to book detail page.
          res.redirect(theartist.url);
        });
      }
    }
  ];