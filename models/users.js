var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var movieSchema = require('../models/movies').schema;

var Schema = mongoose.Schema;

var userSchema = new Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  movies: [movieSchema]
});

// =================================================================
// PASSWORD HASHING AND AUTHENTICATION

// Before each save of the user, check if the password has been added or modified,
// and if it has, hash the provided password and store it.
// Used at signup / creating a user.
userSchema.pre('save', function(next) {
  if (!this.isModified('password')) { return next(); }
  var hashedPassword = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
  this.password = hashedPassword;
  next();
});

// Method for comparing the provided password with the stored hashed password.
// Used at login / authenticating a user.
userSchema.methods.authenticate = function(password) {
  return bcrypt.compareSync(password, this.password);
}

// =================================================================

// VIRTUALS FOR SORTING THE MOVIES ARRAY

// Reusable function to sort an array of objects
// The 'key' param is the key in each object to use for the sorting criterion
var sortArrayOfObjects = function(arrayOfObjects, key) {
  return arrayOfObjects.slice().sort(function(a, b) {
    if (a[key] < b[key]) { return -1; }
    if (a[key] > b[key]) { return 1; }
    return 0;
  });
};
// Same thing, but different for movie titles
var sortArrayOfObjectsByTitle = function(arrayOfObjects) {
  return arrayOfObjects.slice().sort(function(a, b) {
    var titleA = validateTitle(a.Title.toLowerCase());
    var titleB = validateTitle(b.Title.toLowerCase());
    if (titleA < titleB) { return -1; }
    if (titleA > titleB) { return 1; }
    return 0;
  });
};

// This function is used to validate titles according to how I want them sorted
var validateTitle = function(originalTitle) {
  var title = originalTitle.split(" ");
  if (title.length <= 1) { return originalTitle; };
  // First, ignore an initial "The"
  if (title[0] == 'The' || title[0] == 'the' ) {
    var modifiedTitle = title.splice(1).join(" ");
    // Then, remove all non-alphanumerical characters that would get in the way
    while( modifiedTitle.charAt(0).match(/[^\w\s]/)) {
      modifiedTitle = modifiedTitle.substr(1);
    }
    return modifiedTitle;
  }
  return originalTitle;
} // end validateTitle

// Virtual for sorting the user's movies array by alphabetical movie.Title
// [{Title: "An Autumn Afternoon"}, {Title: "Late Spring"}, {Title: "Tokyo Story"}]
userSchema.virtual('moviesAlphabetical').get(function() {
  return sortArrayOfObjectsByTitle(this.movies);
});

// Virtual for sorting the user's movies array by chronological movie.Year
userSchema.virtual('moviesChronological').get(function() {
  return sortArrayOfObjects(this.movies, "Year");
});

// Virtual for sorting the user's movies array by alphabetical movie.Title AND
// return an object whose keys are the relevant first letters
// { A: [{Title: "An Autumn Afternoon"}], L: [{Title: "Late Spring"}], T: [{Title: "Tokyo Story"}]}
userSchema.virtual('moviesColumnsAlpha').get(function() {
  // sort the array of movie objects by title
  var sortedByTitle = sortArrayOfObjectsByTitle(this.movies);
  // Loop over the sorted movie objects array, and use the first valid letter
  // of the movie's title as a unique letter-key in a new object
  var obj = {}
  for (var i=0; i < sortedByTitle.length; i++) {
    obj[validateTitle(sortedByTitle[i].Title)[0].toUpperCase()] = [];
  }
  // Now that the letter-keys have been constructed, loop over them and
  // loop over the sorted movie objects again. If the movie title starts with the same letter as the key,
  // push the movie object into that key's array
  for (var key in obj) {
    for (var i=0; i < sortedByTitle.length; i++) {
      if (validateTitle(sortedByTitle[i].Title)[0].toUpperCase() == key) {
        obj[key].push(sortedByTitle[i]);
      }
    }
  }
  return obj;
});

// Virtual for sorting the user's movies array by chronological movie.Year AND
// Return an object whose keys are the relevant years
userSchema.virtual('moviesColumnsYear').get(function() {
  // Sorts movies by year
  var sortedByYear = sortArrayOfObjects(this.movies, "Year");
  // Gets only the relevant years, unique
  // => { 2005: [], 2006: [], 2007: [] }
  var obj = {}
  for (var i=0; i < sortedByYear.length; i++) {
    obj[sortedByYear[i].Year] = [];
  }
  // Adds the movies to the relevant arrays
  // => { 2005: [{ Title: "movie" ...}], 2006: [{ Title: "movie" ...}, { Title: "movie2" ...}] }
  for (var key in obj) {
    for (var i=0; i < sortedByYear.length; i++) {
      if (sortedByYear[i].Year == key) {
        obj[key].push(sortedByYear[i]);
      }
    }
  }
  // Destructively sorts the movies by rating within each year
  for (var key in obj) {
    obj[key].sort(function(a, b) {
      if (a.Rating > b.Rating) { return - 1 ;}
      if (a.Rating < b.Rating) { return 1; }
      return 0;
    });
  }
  return obj;
});

// Virtual for sorting all movies by DatesWatched
// Movies can have multiple watch dates and therefore need separate entries for each
userSchema.virtual('moviesRecent').get(function() {
  var allDatesByMovie = [];
  this.movies.forEach(function(movie) {
    movie.DatesWatched.forEach(function(date) {
      allDatesByMovie.push({ id: movie._id, Title: movie.Title, dateString: date.dateString, yymmdd: date.yymmdd, Rating: movie.Rating });
    });
  });
  // Sort by 'yymmdd' and reverse so that the latest films come first
  return sortArrayOfObjects(allDatesByMovie, "yymmdd").reverse();
});

// ===============================================================

// Create the User model
var User = mongoose.model('User', userSchema);
// Export the model
module.exports = User;
