// DEPENDENCIES
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser');

// PORT
var port = 3000;

// MIDDLEWARE
app.use(express.static('public'));

// LISTENER
app.listen(port, function() {
  console.log('=================================');
  console.log('MOVIE APP RUNNING ON PORT: ', port);
  console.log('=================================')
});
