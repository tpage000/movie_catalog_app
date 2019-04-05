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

// Use this method for debugging purposes if data might be corrupted
const validateData = arrayOfMovieObjects => {
  let isValid = true;
  arrayOfMovieObjects.forEach(movie => {
    if (!movie) {
      isValid = false;
      console.log('Corrupted data, no movie', movie)
      return
    } else if (!movie.Title || !movie.Year) {
      console.log('Corrupted data for movie: ', movie);
      isValid = false;
    } 
  })
  return isValid;
}

// MOVIES INDEX ALPHABETICAL AND WITH COLUMN HEADERS
// GET /movies/alphabetical_columns
router.get('/alphabetical_columns', function(req, res) {
  User.findById(req.session.loggedInUser.id, function(err, foundUser) {
    // alphabetical column movie data is provided using mongoose 'virtual' in models/users.js
    // validateData(foundUser.movies);
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
    res.render('movies/index_recent.ejs', { movies: foundUser.moviesRecent });
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
router.post('/', async function(req, res) {
  let movieThatAlreadyExists = null;
  const user = await User.findById(req.session.loggedInUser.id);
  // abstract this in to the model
  for (let movie of user.movies) {
    if (movie.Title == req.body.Title && movie.Year == req.body.Year && movie.Director == req.body.Director) {
      console.log('movie by that title already exists! ');
      movieThatAlreadyExists = movie;
    }
  }

  if (movieThatAlreadyExists) {
    res.send({ movieId: movieThatAlreadyExists.id });
  } else {
    try {
      console.log('Creating movie: ', req.body)
      const createdMovie = await Movie.create(req.body);
      user.movies.push(createdMovie);
      await user.save();
      res.send({ movieId: createdMovie.id });
    } catch (err) {
      console.log('error creating movie: ', err);
      res.send({ message: 'Error creating movie', error: err })
    }      
  }

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

// UPDATE MOVIE -- Create date: Add date to DatesWatched array
// POST /movies/:movie_id/update_date
router.post('/:movie_id/update_date', async (req, res) => {
  // Incoming date is formatted with dashes: 2016-12-11
  // If dashes are used in new Date() it will give you yesterday's date.
  // Convert dashes to slashes to get the proper date:
  var slashDate = req.body.newDate.replace(/-/g, '/');
  // get date output in separated strings
  var dt = new Date(slashDate).toString().split(' ');
  // => "Sun Dec 11 2016"
  var dateString = dt[0] + ' ' + dt[1] + ' ' + dt[2] + ' ' + dt[3];
  var dateObject = { dateString: dateString, yymmdd: req.body.newDate }

  // update movie independently
  try {
    let foundMovie = await Movie.findById(req.params.movie_id)
    console.log('found movie to update: ', foundMovie._id);
    foundMovie.DatesWatched.push(dateObject);
    try {
      let savedMovie = await foundMovie.save();
      console.log('saved movie: ', savedMovie._id);
      try {
        // update user's movies collection with updated movie
        let foundUser = await User.findById(req.session.loggedInUser.id);
        console.log('found user to update: ', foundUser._id);
        const movieOfUser = foundUser.movies.id(savedMovie._id);
        console.log('movie to remove and update: ', movieOfUser._id);
        movieOfUser.remove();
        foundUser.movies.push(savedMovie);
        try {
          let savedUser = await foundUser.save();
          console.log('saved user: ', savedUser._id)
          // SUCCESS
          res.redirect(`/movies/${savedMovie._id}`);
          /////////
        } catch (saveUserErr) {
          console.log('Could not save user', saveUserErr)
          res.send({ message: 'Could not save user', error: saveUserErr })
        }
      } catch (findUserErr) {
        console.log('Could not find user', findUserErr)
        res.send({ message: 'Could not find user', error: findUserErr })
      }
    } catch (saveMovieErr) {
        console.log('Could not save movie', saveMovieErr)
        res.send({ message: 'Could not save movie', error: saveMovieErr })
    }
  } catch(findMovieErr) {
      console.log('Could not find movie', findMovieErr)
      res.send({ message: 'Could not find movie', error: findMovieErr })
  }



  // Movie.findById(req.params.movie_id, function(err, foundMovie) {
  //   foundMovie.DatesWatched.push(dateObject);
  //   foundMovie.save(function(err, savedMovie) {
  //     console.log('Movie saved with new date: ', savedMovie)
  //     User.findById(req.session.loggedInUser.id, function(err, foundUser) {
  //       foundUser.movies.id(req.params.movie_id).remove();
  //       foundUser.movies.push(savedMovie);
  //       foundUser.save(function(err, savedUser) {
  //         if (err) {
  //           console.log('Error saving movie new date')
  //           res.send({ message: 'Error saving movie date', error: err })
  //         } else {
  //           console.log('Movie saved to user: ', foundUser.movies.id(savedMovie.id))
  //           res.redirect('/movies/' + savedMovie.id);
  //         }
  //       });
  //     });
  //   });
  // });
});

// UPDATE MOVIE -- Remove date: Remove date from DatesWatched array
router.put('/:movie_id/remove_date', async (req, res) => {

  try {
    let updatedMovie = await Movie.findByIdAndUpdate(
      req.params.movie_id, 
      { $pull: { DatesWatched: { yymmdd: req.body.yymmdd }}},
      { new: true }
    );
        
    // manual solution to update user's movie
    let user = await User.findById(req.session.loggedInUser.id);
    user.movies.id(updatedMovie._id).remove();
    user.movies.push(updatedMovie);
    await user.save();
    
    res.redirect('back');
  } catch (err) {
    console.log('error removing date: ', err);
    res.redirect('back');
  }
});

// works in mongo shell but not Mongoose
// let user = await User.findByIdAndUpdate(
//   req.session.loggedInUser.id, 
//   { $pull: { 'movies.$.DatesWatched': { yymmdd: req.body.yymmdd }}},
//   { new: true }
// );

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
