// DEPENDENCIES FOR ROUTER
var express = require('express');
var router = express.Router();

// MODELS
var User = require('../models/users');

//==========================================================
// SET SESSION DATA

// CREATE USER - data comes from signup page
// POST /users
router.post('/', function(req, res) {
  User.create(req.body, function(err, newUser) {
    // If user already exists, send error message to the page
    if (err) {
      console.log('user create error: ', err);
      req.session.wrongPass = false;
      req.session.wrongUser = '';
      req.session.userTaken = true;
      res.redirect('/signup');
    // Else go to the user's show page -- New Movie
    } else {
      req.session.wrongPass = false;
      req.session.wrongUser = '';
      req.session.userTaken = false;
      req.session.loggedInUser = { name: newUser.name, id: newUser.id }
      req.session.currentUser = newUser.name;
      res.redirect('/movies/new');
    }
  });
}); // end user create

// USER LOGIN - data comes from signup page
// POST /users/login
router.post('/login', function(req, res) {
  User.findOne({ name: req.body.name}, function(err, foundUser) {
    if (err) { console.log('user login error: ', err); }
    // if user does not exist:
    if (!foundUser) {
      req.session.userTaken = false;
      req.session.wrongPass = false;
      req.session.wrongUser = req.body.name;
      res.redirect('/signup');

    // calls the 'authenticate' method in the user model (returns true or false)
    // for checking the password --->

    // if password matches:
    } else if (foundUser.authenticate(req.body.password)) {
      req.session.userTaken = false;
      req.session.wrongUser = '';
      req.session.wrongPass = false;
      req.session.loggedInUser = { name: foundUser.name, id: foundUser.id }
      req.session.currentUser = foundUser.name;
      res.redirect('/movies/new');
    // if password does not match:
    } else {
      req.session.userTaken = false;
      req.session.wrongUser = '';
      req.session.wrongPass = true;
      res.redirect('/signup');
    }
  });
});
//  =============================================================
//
// Testing
//
// See all users json
router.get('/', function(req, res) {
  User.find(function(err, allUsers) {
    res.send(allUsers);
  });
});



// EXPORT THE ROUTER - required in server.js and used as middleware for '/users'
module.exports = router;
