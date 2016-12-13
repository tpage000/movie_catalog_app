// DEPENDENCIES FOR ROUTER
var express = require('express');
var router = express.Router();

// MODELS
var Movie = require('../models/movies');
var User = require('../models/users');

// ==========================================================
// MAIN PAGE
// NEW MOVIE - loads a page to make AJAX requests to OMDB API
// GET /movies/new
router.get('/new', function(req, res) {
  User.findById(req.session.loggedInUser.id, function(err, userData) {
    res.render('users/show.ejs', { user: userData });
  });
});
// =========================================================


// MOVIES INDEX ALPHABETICAL AND WITH COLUMN HEADERS
// GET /movies/alphabetical_columns
router.get('/alphabetical_columns', function(req, res) {
  User.findById(req.session.loggedInUser.id, function(err, foundUser) {
    // alphabetical column movie data is provided using mongoose 'virtual' in models/users.js
    res.render('movies/index_columns_alpha.ejs', { movies: foundUser.moviesColumnsAlpha });
  });
});

// MOVIES INDEX CHRONOLOGICAL AND WITH COLUMN HEADERS
// GET /movies/chronological_columns
router.get('/chronological_columns', function(req, res) {
  User.findById(req.session.loggedInUser.id, function(err, foundUser) {
    // chronological column movie data is provided using mongoose 'virtual' in models/users.js
    res.render('movies/index_columns_year.ejs', { movies: foundUser.moviesColumnsYear });
  });
});

// MOVIES INDEX ALPHABETICAL
// GET /movies/alphabetical
router.get('/alphabetical', function(req, res) {
  User.findById(req.session.loggedInUser.id, function(err, foundUser) {
    // alphabetical list of movie data is provided using mongoose 'virtual' in models/users.js
    res.render('movies/index.ejs', { movies: foundUser.moviesAlphabetical });
  });
});

// MOVIES INDEX CHRONOLOGICAL
// GET /movies/release_date
router.get('/release_date', function(req, res) {
  User.findById(req.session.loggedInUser.id, function(err, foundUser) {
    // chronological list of movie data is provided using mongoose 'virtual' in models/users.js
    res.render('movies/index_year.ejs', { movies: foundUser.moviesChronological });
  });
});

// MOVIES INDEX BY DATE WATCHED - not implemented
// GET /movies/recent
router.get('/recent', function(req, res) {
  User.findById(req.session.loggedInUser.id, function(err, foundUser) {
    res.send(foundUser.moviesRecent);
  });
});

// SHOW MOVIE JSON
router.get('/:movie_id/json', function(req, res) {
  Movie.findById(req.params.movie_id, function(err, foundMovie) {
    res.send(foundMovie);
  });
});

// SHOW A USER'S MOVIE
// GET /movies/:movie_id
router.get('/:movie_id', function(req, res) {
  Movie.findById(req.params.movie_id, function(err, foundMovie) {
    if (err) {
      res.redirect('/movies/new');
    } else {
      res.render('movies/show.ejs', { movie: foundMovie });
    }
  });
});

// CREATE NEW MOVIE
// POST /movies
router.post('/', function(req, res) {
  Movie.create(req.body, function(err, createdMovie) {
    User.findById(req.session.loggedInUser.id, function(err, foundUser) {
      foundUser.movies.push(createdMovie);
      foundUser.save(function(err, savedUser) {
        res.send({ movieId: createdMovie.id });
      }); // end foundUser.save()
    }); // end User.findByID()
  }); // end Movie.create()
}); // end create route


// UPDATE MOVIE Rating
// POST /movies/:movie_id/update_rating
router.post('/:movie_id/update_rating', function(req, res) {
  Movie.findByIdAndUpdate(req.params.movie_id, { $set: req.body }, { new: true }, function(err, updatedMovie) {
    User.findById(req.session.loggedInUser.id, function(err, foundUser) {
      foundUser.movies.id(req.params.movie_id).remove();
      foundUser.movies.push(updatedMovie);
      foundUser.save(function(err, savedUser) {
        res.redirect('/movies/' + updatedMovie.id);
      });
    });
  });
});

// UPDATE MOVIE DatesWatched array
// POST /movies/:movie_id/update_date
router.post('/:movie_id/update_date', function(req, res) {
  // Incoming date is formatted with dashes: 2016-12-11
  // If dashes are used in new Date() it will give you yesterday's date.
  // Convert dashes to slashes to get the proper date:
  var slashDate = req.body.newDate.replace(/-/g, '/');
  // get date output in separated strings
  var dt = new Date(slashDate).toString().split(' ');
  // => "Sun Dec 11 2016"
  var dateString = dt[0] + ' ' + dt[1] + ' ' + dt[2] + ' ' + dt[3];
  var dateObject = { dateString: dateString, yymmdd: req.body.newDate }

  Movie.findById(req.params.movie_id, function(err, foundMovie) {
    foundMovie.DatesWatched.push(dateObject);
    foundMovie.save(function(err, savedMovie) {
      User.findById(req.session.loggedInUser.id, function(err, foundUser) {
        foundUser.movies.id(req.params.movie_id).remove();
        foundUser.movies.push(savedMovie);
        foundUser.save(function(err, savedUser) {
          res.redirect('/movies/' + savedMovie.id);
        });
      });
    });
  });
});

// DELETE MOVIE
// DELETE /movies/:movie_id
router.delete('/:movie_id', function(req, res) {
  Movie.findByIdAndRemove(req.params.movie_id, function(err, removedMovie) {
    User.findById(req.session.loggedInUser.id, function(userErr, foundUser) {
      foundUser.movies.id(req.params.movie_id).remove();
      foundUser.save(function(savedUserErr, savedUser) {
        res.redirect('/movies/alphabetical_columns');
      });
    });
  });
});


// EXPORT THE ROUTER - required in server.js and then used as middleware
module.exports = router;
