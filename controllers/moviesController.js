// DEPENDENCIES FOR ROUTER
var express = require('express');
var router = express.Router();

// MODELS
var Movie = require('../models/movies');
var User = require('../models/users');

// MOVIES INDEX ALPHABETICAL AND WITH COLUMN HEADERS
// GET /movies/:user_id/alphabetical_columns
router.get('/:user_id/alphabetical_columns', function(req, res) {
  User.findById(req.params.user_id, function(err, foundUser) {
    // alphabetical column movie data is provided using mongoose 'virtual' in models/users.js
    res.render('movies/index_columns_alpha.ejs', { movies: foundUser.moviesColumnsAlpha, userId: foundUser.id });
  });
});

// MOVIES INDEX CHRONOLOGICAL AND WITH COLUMN HEADERS
// GET /movies/:user_id/chronological_columns
router.get('/:user_id/chronological_columns', function(req, res) {
  User.findById(req.params.user_id, function(err, foundUser) {
    // chronological column movie data is provided using mongoose 'virtual' in models/users.js
    res.render('movies/index_columns_year.ejs', { movies: foundUser.moviesColumnsYear, userId: foundUser.id });
  });
});

// MOVIES INDEX ALPHABETICAL
// GET /movies/:user_id/alphabetical
router.get('/:user_id/alphabetical', function(req, res) {
  User.findById(req.params.user_id, function(err, foundUser) {
    // alphabetical list of movie data is provided using mongoose 'virtual' in models/users.js
    res.render('movies/index.ejs', { movies: foundUser.moviesAlphabetical, userId: foundUser.id });
  });
});

// MOVIES INDEX CHRONOLOGICAL
// GET /movies/:user_id/release_date
router.get('/:user_id/release_date', function(req, res) {
  User.findById(req.params.user_id, function(err, foundUser) {
    // chronological list of movie data is provided using mongoose 'virtual' in models/users.js
    res.render('movies/index_year.ejs', { movies: foundUser.moviesChronological, userId: foundUser.id });
  });
});

// MOVIES INDEX BY DATE WATCHED - not implemented
// GET /movies/:user_id/date_watched
router.get('/:user_id/date_watched', function(req, res) {
  res.send('this user\'s movies date watched');
});

// SHOW MOVIE JSON
router.get('/:movie_id/json', function(req, res) {
  Movie.findById(req.params.movie_id, function(err, foundMovie) {
    res.send(foundMovie);
  });
});

// SHOW A USER'S MOVIE
// GET /movies/:user_id/:movie_id
router.get('/:user_id/:movie_id', function(req, res) {
  Movie.findById(req.params.movie_id, function(err, foundMovie) {
    // res.send(foundMovie);
    res.render('movies/show.ejs', { movie: foundMovie, userId: req.params.user_id });
  });
});

// CREATE NEW MOVIE
// POST /movies/:user_id
router.post('/:user_id', function(req, res) {
  Movie.create(req.body, function(err, createdMovie) {
    User.findById(req.params.user_id, function(err, foundUser) {
      foundUser.movies.push(createdMovie);
      foundUser.save(function(err, savedUser) {
        res.send({ userId: savedUser.id, movieId: createdMovie.id });
      }); // end foundUser.save()
    }); // end User.findByID()
  }); // end Movie.create()
}); // end create route


// UPDATE MOVIE Rating
router.post('/:user_id/:movie_id/update_rating', function(req, res) {
  Movie.findByIdAndUpdate(req.params.movie_id, { $set: req.body }, { new: true }, function(err, updatedMovie) {
    User.findById(req.params.user_id, function(err, foundUser) {
      foundUser.movies.id(req.params.movie_id).remove();
      foundUser.movies.push(updatedMovie);
      foundUser.save(function(err, savedUser) {
        res.redirect('/movies/' + req.params.user_id + '/' + updatedMovie.id);
      });
    });
  });
});

// UPDATE MOVIE DatesWatched array
router.post('/:user_id/:movie_id/update_date', function(req, res) {
  // Incoming date is formatted with dashes: 2016-11-9
  // If dashes are used in new Date() it will give you yesterday's date.
  // Convert dashes to slashes to get the proper date:
  var slashDate = req.body.newDate.replace(/-/g, '/');
  // get date output in separated strings
  var dt = new Date(slashDate).toString().split(' ');
  // => "Sun Dec 11 2016"
  var dateString = dt[0] + ' ' + dt[1] + ' ' + dt[2] + ' ' + dt[3];
  console.log(dateString);

  var dateObject = { dateString: dateString, yymmdd: req.body.newDate }

  Movie.findById(req.params.movie_id, function(err, foundMovie) {
    foundMovie.DatesWatched.push(dateObject);
    foundMovie.save(function(err, savedMovie) {
      User.findById(req.params.user_id, function(err, foundUser) {
        foundUser.movies.id(req.params.movie_id).remove();
        foundUser.movies.push(savedMovie);
        foundUser.save(function(err, savedUser) {
          res.redirect('/movies/' + req.params.user_id + '/' + savedMovie.id);
        });
      });
    });
  });
});

// EXPORT THE ROUTER - required in server.js and then used as middleware
module.exports = router;
