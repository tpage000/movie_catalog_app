// DEPENDENCIES
var express     = require('express'),
    app         = express(),
    bodyParser  = require('body-parser'),
    mongoose    = require('mongoose');

// PORT
var port = 3000;

// DB
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/movies_app'
mongoose.connect(mongoURI);
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function() {
  console.log('DB: Connected');
  // var data = { name: "Thom", password: "Thom" }
  // var User = require('./models/users');
  // User.create(data, function(err, result) {
  //   if (err) { console.log(err) }
  //   console.log(result);
  //   mongoose.connection.close();
  // });
});

// CONTROLLERS
var moviesController = require('./controllers/moviesController');
var usersController = require('./controllers/usersController');

// MIDDLEWARE
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/users', usersController);
app.use('/movies', moviesController);


// ROOT
app.get('/', function(req, res) {
  res.redirect('/users/signup');
});

// LISTENER
app.listen(process.env.PORT || port, function() {
  console.log('=================================');
  console.log('MOVIE APP RUNNING ON PORT: ', process.env.PORT || port);
  console.log('=================================')
});
