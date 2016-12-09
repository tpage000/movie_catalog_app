// DEPENDENCIES FOR ROUTER
var express = require('express');
var router = express.Router();

// MODELS
var User = require('../models/users');

// INDEX OF USERS - json output for testing
// GET /users
router.get('/', function(req, res) {
  User.find(function(err, allUsers) {
    res.send(allUsers);
  });
});

// SIGNUP FORM
// GET /users/signup
router.get('/signup', function(req, res) {
  res.render('users/signup.ejs', { error: false });
});

// LOGOUT
// GET /users/logout
router.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      console.log('error destroying session: ', req.session);
    } else {
      res.redirect('/users/signup');
    }
  });
});

// MAIN PAGE
// USER SHOW - loads a page to make AJAX requests to OMDB API
// GET /users/:id
router.get('/:id', function(req, res) {
  User.findById(req.params.id, function(err, userData) {
    if (req.session.currentUser == userData.name) {
      res.render('users/show.ejs', { user: userData });
    } else {
      res.redirect('/users/signup');
    }
  });
});

// USER SHOW - json output for testing
// GET /users/:id/json
router.get('/:id/json', function(req, res) {
  User.findById(req.params.id, function(err, userData) {
    res.send(userData);
  });
});

// CREATE USER - data comes from signup page
// POST /users
router.post('/', function(req, res) {
  User.create(req.body, function(err, newUser) {
    // If user already exists, send error message to the page
    if (err) {
      res.render('users/signup.ejs', { error: true })
    // Else go to the user's show page -- New Movie
    } else {
      res.redirect('/users/' + newUser.id);
    }
  });
}); // end user create

// USER LOGIN - data comes from signup page
// POST /users/login
router.post('/login', function(req, res) {
  User.findOne({ name: req.body.name}, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      req.session.currentUser = foundUser.name;
      console.log('Session: ', req.session.currentUser);
      res.redirect('/users/' + foundUser.id);
    }
  });
});

// EXPORT THE ROUTER - required in server.js and used as middleware for '/users'
module.exports = router;
