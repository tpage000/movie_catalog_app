var express = require('express');
var router = express.Router();


// users/:id/movies/alphabetical
router.get('/:user_id/movies/alphabetical', function(req, res) {
  res.send('this user\'s movies alphabetical');
});

// users/:id/movies/release_date
router.get('/:user_id/movies/release_date', function(req, res) {
  res.send('this user\'s movies release date');
});

// users/:id/movies/date_watched
router.get('/:user_id/movies/date_watched', function(req, res) {
  res.send('this user\'s movies date watched');
});





module.exports = router;
