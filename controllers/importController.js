// EXPRESS ROUTER
var express = require('express');
var router = express.Router();
var request = require('request');

// MODELS
var User = require('../models/users');

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

  var getNextKey = function() {
    globalKeyCount++;
    globalCurrentKey = Object.keys(DATA)[globalKeyCount];
    if (globalKeyCount == globalKeyLimit) { return done(); }
    getMovies(0);
  }

  var getMovies = function(count) {
    var lim = DATA[globalCurrentKey].length;
    var title = DATA[globalCurrentKey][count];
    var year = globalCurrentKey;

    // REQUEST MODULE GOES HERE
    console.log(year + ' ' + title);
    count++;
    if (count == lim) { return getNextKey(); }
    getMovies(count);
    // REQUEST MODULE ENDS HERE

    // $.ajax('http://www.omdbapi.com/?t=' + title + '&y=' + year + '&plot=short&r=json')
    //  .done(function(result) {
    //     if (result.Response == "false") { console.warn('NOT FOUND: ', title, year)}
    //     console.log(result.Year + ' ' + result.Title);
    //     count++;
    //     if (count == lim) { return getNextKey(); }
    //     getMovies(count);
    // }).fail(function(jqXHR, textStatus) {
    //     console.error('ERROR: ', textStatus);
    //     return done();
    // });
  } // end getMovies

  getMovies(0);

  res.send('import seed route');
});

module.exports = router;
