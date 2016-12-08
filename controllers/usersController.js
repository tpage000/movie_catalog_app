// DEPENDENCIES FOR ROUTER
var express = require('express');
var router = express.Router();

// MODELS
var User = require('../models/users');

// INDEX to json
router.get('/', function(req, res) {
  User.find(function(err, allUsers) {
    res.send(allUsers);
  });
});

// signup
router.get('/signup', function(req, res) {
  res.render('users/signup.ejs');
});

// SHOW to view
router.get('/:id', function(req, res) {
  User.findById(req.params.id, function(err, userData) {
    res.render('users/show.ejs', { user: userData });
  });
});

// SHOW to json
router.get('/:id/json', function(req, res) {
  User.findById(req.params.id, function(err, userData) {
    res.send(userData);
  });
});

router.post('/', function(req, res) {

  console.log('USER CREATE ROUTE HIT');

  console.log('req.body is: ', req.body);

  User.create(req.body, function(err, newUser) {
    if (err) { console.log(err); }
    console.log('new user created: ', newUser);
    res.redirect('/users/' + newUser.id);
  });

});

router.post('/login', function(req, res) {

  console.log('login route hit!');
  console.log('req.body is: ', req.body);

  User.findOne({ name: req.body.name}, function(err, foundUser) {
      if (err) { console.log(err); }
      res.redirect('/users/' + foundUser.id);
  });

});









module.exports = router;
