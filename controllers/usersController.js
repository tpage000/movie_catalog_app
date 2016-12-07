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

// CREATE














module.exports = router;
