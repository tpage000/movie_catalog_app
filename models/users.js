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


var User = mongoose.model('User', userSchema);

module.exports = User;
