// DEPENDENCIES
var express     = require('express'),
    app         = express(),
    bodyParser  = require('body-parser'),
    mongoose    = require('mongoose');

// PORT
var port = 3000;

// DB

// CONTROLLERS
var moviesController = require('./controllers/moviesController');

// MIDDLEWARE
app.use(express.static('public'));
app.use(bodyParser.json());

app.use('/movies', moviesController);

// LISTENER
app.listen(port, function() {
  console.log('=================================');
  console.log('MOVIE APP RUNNING ON PORT: ', port);
  console.log('=================================')
});
