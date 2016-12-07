// DEPENDENCIES FOR ROUTER
var express = require('express');
var router = express.Router();

// MODELS
var Movie = require('../models/movies');
var User = require('../models/users');

// MOVIES INDEX ALPHABETICAL
// GET /movies/:user_id/alphabetical
router.get('/:user_id/alphabetical', function(req, res) {
  User.findById(req.params.user_id, function(err, foundUser) {
    // non-destructive sorting of array objects by title
    var sortedByTitle = foundUser.movies.slice().sort(function(a, b) {
      if (a.Title < b.Title) { return -1; }
      if (a.Title > b.Title) { return 1; }
      return 0;
    });
    res.render('movies/index.ejs', { movies: sortedByTitle, userId: foundUser.id });
  });
});

// MOVIES INDEX BY RELEASE DATE
// GET /movies/:user_id/release_date
router.get('/:user_id/release_date', function(req, res) {
  User.findById(req.params.user_id, function(err, foundUser) {
    // non-destructive sorting of array objects by year
    var sortedByYear = foundUser.movies.slice().sort(function(a, b) {
      if (a.Year < b.Year) { return -1; }
      if (a.Year > b.Year) { return 1; }
      return 0;
    });
    res.send(sortedByYear);
  });
});

// MOVIES INDEX BY DATE WATCHED
// GET /movies/:user_id/date_watched
router.get('/:user_id/date_watched', function(req, res) {
  res.send('this user\'s movies date watched');
});


// SHOW A MOVIE
router.get('/:user_id/:movie_id', function(req, res) {
  Movie.findById(req.params.movie_id, function(err, foundMovie) {
    res.send(foundMovie);
  })
})

// CREATE NEW MOVIE
// POST /movies/:user_id
router.post('/:user_id', function(req, res) {
  console.log('CREATE MOVIE, data received: ', req.body);
  Movie.create(req.body, function(err, createdMovie) {
    User.findById(req.params.user_id, function(err, foundUser) {
      foundUser.movies.push(createdMovie);
      foundUser.save(function(err, savedUser) {
        res.send(savedUser);
      }); // end foundUser.save()
    }); // end User.findByID()
  }); // end Movie.create()

}); // end create

module.exports = router;
