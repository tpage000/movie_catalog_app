var mongoose = require('mongoose');

var movieSchema = require('../models/movies').schema;

var Schema = mongoose.Schema;

var userSchema = new Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  movies: [movieSchema]
});

userSchema.virtual('moviesAlphabetical').get(function() {
  var sortedByTitle = this.movies.slice().sort(function(a, b) {
    if (a.Title < b.Title) { return -1; }
    if (a.Title > b.Title) { return 1; }
    return 0;
  });

  return sortedByTitle;
});

userSchema.virtual('moviesChronological').get(function() {
  var sortedByYear = this.movies.slice().sort(function(a, b) {
    if (a.Year < b.Year) { return -1; }
    if (a.Year > b.Year) { return 1; }
    return 0;
  });

  return sortedByYear;
});

userSchema.virtual('moviesColumnsAlpha').get(function() {
  var sortedByTitle = this.movies.slice().sort(function(a, b) {
    if (a.Title < b.Title) { return -1; }
    if (a.Title > b.Title) { return 1; }
    return 0;
  });

  // Get unique letters as keys in an object
  var obj = {}
  for (var i=0; i < sortedByTitle.length; i++) {
    obj[sortedByTitle[i].Title[0]] = [];
  }

  // If the title starts with the same letter as the key,
  // push it into that key's array
  for (var key in obj) {
    for (var i=0; i < sortedByTitle.length; i++) {
      if (sortedByTitle[i].Title[0] == key) {
        obj[key].push(sortedByTitle[i]);
      }
    }
  }

  return obj;
});

userSchema.virtual('moviesColumnsYear').get(function() {
  var sortedByYear = this.movies.slice().sort(function(a, b) {
    if (a.Year < b.Year) { return -1; }
    if (a.Year > b.Year) { return 1; }
    return 0;
  });

  // Get unique letters as keys in an object
  var obj = {}
  for (var i=0; i < sortedByYear.length; i++) {
    obj[sortedByYear[i].Year] = [];
  }

  // If the title starts with the same letter as the key,
  // push it into that key's array
  for (var key in obj) {
    for (var i=0; i < sortedByYear.length; i++) {
      if (sortedByYear[i].Year == key) {
        obj[key].push(sortedByYear[i]);
      }
    }
  }

  return obj;
});


var User = mongoose.model('User', userSchema);

module.exports = User;
