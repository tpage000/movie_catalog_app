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

// MAIN PAGE
// USER SHOW - loads a page to make AJAX requests to OMDB API
// GET /users/:id
router.get('/:id', function(req, res) {
  User.findById(req.params.id, function(err, userData) {
    if (req.session.currentUser == userData.name) {
      res.render('users/show.ejs', { user: userData });
    } else {
      res.redirect('/signup');
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
      req.session.userTaken = true;
      res.redirect('/signup');
    // Else go to the user's show page -- New Movie
    } else {
      req.session.userTaken = false;
      req.session.currentUser = newUser.name;
      res.redirect('/users/' + newUser.id);
    }
  });
}); // end user create

// USER LOGIN - data comes from signup page
// POST /users/login
router.post('/login', function(req, res) {
  User.findOne({ name: req.body.name}, function(err, foundUser) {
    if (err) { console.log('error: ', err); }
    if (!foundUser) {
      req.session.noUser = true;
      res.redirect('/signup');
    } else if (req.body.password == foundUser.password) {
      req.session.noUser = false;
      req.session.wrongPass = false;
      req.session.currentUser = foundUser.name;
      res.redirect('/users/' + foundUser.id);
    } else {
      req.session.wrongPass = true;
      res.redirect('/signup');
    }
  });
});

// EXPORT THE ROUTER - required in server.js and used as middleware for '/users'
module.exports = router;
