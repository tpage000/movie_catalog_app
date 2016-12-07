var express = require('express');

var router = express.Router();

var User = require('../models/users');
// users/:id
//   - enter movie title for new movie
//   - select view movies alphabetical
//   - select view movies by year
//   - search your movies, see individual movie
router.get('/:id', function(req, res) {
  User.findById(req.params.id, function(err, userData) {
    res.render('users/show.ejs');
  });
});

// users_create









module.exports = router;
