// EXPRESS ROUTER
var express = require('express');
var router = express.Router();
var request = require('request');

// MODELS
var User = require('../models/users');
var Movie = require('../models/movies');

// SEED FILES
var movies = require('../data/movies');
var sample = require('../data/sample');
var DATA = sample;

// Global vars to set values
//    - used in the recursive getMovies function to get values for title, year, and limit
//    - used in the getNextKey function for terminating the process when complete
var globalKeyCount = 0;
var globalKeyLimit = Object.keys(DATA).length;
var globalCurrentKey = Object.keys(DATA)[globalKeyCount];

// For collecting the movies that OMDB could not match / find
var moviesNotAdded = [];

// When all the top-level keys (Years) in the data Object have been used,
// or if there is a server error from Request, this function pops up to tell
// you that's it's over
var done = function() {
  globalKeyCount = 0;
  globalKeyLimit = Object.keys(DATA).length;
  globalCurrentKey = Object.keys(DATA)[globalKeyCount];
  console.log('Process complete!');
  console.log('---');
  console.log('Movies not added: ', moviesNotAdded);
  console.log('---');
  moviesNotAdded = [];
  return
}

// Set the next top-level key (the Year) from the data Object
// When the keys are exhausted, this function terminates the whole process
var getNextKey = function(user) {
  globalKeyCount++;
  globalCurrentKey = Object.keys(DATA)[globalKeyCount];
  if (globalKeyCount >= globalKeyLimit) { return done(); }
  getMovies(0, user);
}

// getMovies is the first function in the chain to run. Invoked within the /imports/seed route below.
// getMovies is recursive: the 'count' parameter starts at zero upon invocation and is increased
// before getMovies is re-called. When the 'count' value reaches the value in 'lim', below, the next
// Year is grabbed from getNextKey and the recursive process begins again.
var getMovies = function(count, user) {
  // getMovies is recursive: the lim variable holds how many times it should run
  var lim = DATA[globalCurrentKey].length;
  // don't bother if the limit is zero (nothing in the array of movies)
  if (lim <= 0) { return getNextKey(user); }
  var title = DATA[globalCurrentKey][count];
  var year = globalCurrentKey;

  // REQUEST MODULE BEGINS HERE
  // Make request to OMDB with _both_ title and year in the URL. Both values are need to get the desired
  // movie, unless you do want the 2014 version of RoboCop instead of the 1987 version. The other way to
  // get specific movies is by imdb id which I might implement at some other time.
  request({
    url: 'https://www.omdbapi.com/?t=' + title + '&y=' + year + '&plot=short&r=json'},
    function (error, response, body) {

      // Run only if there is no error and the request works:
      if (!error && response.statusCode == 200) {
        // If the request works:
        // The data comes in as a string: parse the data to JSON
        var parsedBody = JSON.parse(body);
        // if the movie title is spelled incorrectly, or the year and title do not match, or the movie is not on OMDB:
        // log the error and move on to the next movie
        if (parsedBody.Response == "False") {
          console.warn('NOT FOUND: ' + year + ' ' + title);
          moviesNotAdded.push(year + ' ' + title);
          count++;
          if (count >= lim) { return getNextKey(user); }
          getMovies(count, user);
        // if OMDB returns the movie data:
        } else {
          // Begin adding the OMDB data to the Mongo db
          Movie.create(parsedBody, function(err, createdMovie) {
            // 'user' comes in as a parameter for getMovies, originally sent in when getMovies is invoked in the
            // /import/seed route, and sent in subsequently from the getNextKey function. This is to avoid
            // .find-ing the user in Mongo every single time the recursive loop runs. (Find the user once in
            // the route, and pass that user through to this function).
            user.movies.push(createdMovie);
            user.save(function(userErr, savedUser) {
              // Log of the movie added when all the Mongo db processes have completed and are OK:
              console.log('ADDED: ' + createdMovie.Year + ' ' + createdMovie.Title);
              // Increase count for the next recursive call. Used both for getting the index value of the next
              // movie to find, and to determine when the recursive loop should move on to the next
              // top-level key (Year)
              count++;
              // if all the movies for this year have been added, move on to the next year (the next top-level
              // key in the data object)
              if (count >= lim) { return getNextKey(user); }
              // if there are more movies to add for this year, run getMovies again recursively.
              // Recursion is used to iterate over the array of titles and to step around async:
              // only run getMovies within the Request module's promise. (That way the loop doesn't finish
              // before the requests have come back!)
              getMovies(count, user);
            });
          });
          // END create db data
        } // end if
      // If there was a request server error, log the server error and quit
      } else {
        console.error('REQUEST ERROR: ', error);
        return done();
      }
  });// REQUEST MODULE ENDS HERE
} // end getMovies

// Only 'admin' can get anything out of visiting this route.
// The route starts a potentially large chain of ajax requests, so . . .

// Can only visit route ONCE per session to avoid multiple reloads

// GET /import/seed
router.get('/seed', function(req, res) {
  if (!req.session.imported && req.session.loggedInUser.name === 'admin') {
    req.session.imported = true;
    User.findById(req.session.loggedInUser.id, function(err, foundUser) {
      if (!err) {
        // Invoke recursive function chain to make async requests
        getMovies(0, foundUser);
        res.redirect('/movies/chronological_columns');
      } else {
        res.send('error');
      }
    }); // end User
  } else {
    res.send('gotta log in as admin to use this route');
  } // end if
});

module.exports = router;
