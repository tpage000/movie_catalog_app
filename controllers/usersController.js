var express = require('express');

var router = express.Router();

var User = require('../models/users');
var Movie = require('../models/movies');

// INDEX to json
router.get('/json', function(req, res) {
  User.find(function(err, allUsers) {
    res.send(allUsers);
  });
});

// SHOW to view
router.get('/:id', function(req, res) {
  User.findById(req.params.id, function(err, userData) {
    res.render('users/show.ejs');
  });
});

// SHOW to json
router.get('/:id/json', function(req, res) {
  User.findById(req.params.id, function(err, userData) {
    res.send(userData);
  });
});




// users_create














module.exports = router;
