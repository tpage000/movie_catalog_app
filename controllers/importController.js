// EXPRESS ROUTER
var express = require('express');
var router = express.Router();
var request = require('request');

// MODELS
var User = require('../models/users');
var Movie = require('../models/movies');

// GET /import/seed
router.get('/seed', function(req, res) {
  // SEED FILE
  var movies = require('../data/movies');
  var sample = require('../data/sample');
  var DATA = sample;

  var globalKeyCount = 0;
  var globalKeyLimit = Object.keys(DATA).length;
  var globalCurrentKey = Object.keys(DATA)[globalKeyCount];

  var done = function() {
    globalKeyCount = 0;
    globalKeyLimit = Object.keys(DATA).length;
    globalCurrentKey = Object.keys(DATA)[globalKeyCount];
    console.log('process complete');
    return
  }

  var getNextKey = function(user) {
    globalKeyCount++;
    globalCurrentKey = Object.keys(DATA)[globalKeyCount];
    if (globalKeyCount == globalKeyLimit) { return done(); }
    getMovies(0, user);
  }

  var getMovies = function(count, user) {
    var lim = DATA[globalCurrentKey].length;
    var title = DATA[globalCurrentKey][count];
    var year = globalCurrentKey;

    // REQUEST MODULE BEGINS HERE
    request({
      url: 'https://www.omdbapi.com/?t=' + title + '&y=' + year + '&plot=short&r=json', headers: { 'content-type': 'application/json' }}, function (error, response, body) {

        if (!error && response.statusCode == 200) {
          if (body.Response == "false") { console.warn('NOT FOUND: ', title, year)}
          var parsedBody = JSON.parse(body);
          Movie.create(parsedBody, function(err, createdMovie) {
            user.movies.push(createdMovie);
            user.save(function(userErr, savedUser) {
              console.log(createdMovie.Year + ' ' + createdMovie.Title + ' added . . .');
              count++;
              if (count == lim) { return getNextKey(user); }
              getMovies(count, user);
            });
          });
          // END create db data

        } else {
          console.error('REQUEST ERROR: ', error);
          return done();
        }
    });// REQUEST MODULE ENDS HERE
  } // end getMovies


  if (req.session.loggedInUser) {
    User.findById(req.session.loggedInUser.id, function(err, foundUser) {
      if (!err) {
        // Invoke recursive function chain to make async requests
        getMovies(0, foundUser);
        res.send('getting movies for user: ' + foundUser.name);
      } else {
        res.send('error');
      }
    }); // end User
  } else {
    res.send('gotta log in');
  } // end if
});

module.exports = router;

// var keepData = {
//   Title: parsedBody.Title,
//   Director: parsedBody.Director,
//   Writer: parsedBody.Writer,
//   Year: parsedBody.Year,
//   Poster: parsedBody.Poster,
//   Plot: parsedBody.Plot
// }
// console.log('KEEP DATA: ', keepData);
// CREATE DB DATA HERE
// console.log('body: ', body);
