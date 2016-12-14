// DEPENDENCIES
var express        = require('express'),
    app            = express(),
    bodyParser     = require('body-parser'),
    methodOverride = require('method-override'),
    mongoose       = require('mongoose'),
    session        = require('express-session');

// PORT
var port = process.env.PORT || 3000;

// DB
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/movies_app'
mongoose.connect(mongoURI);
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function() {
  console.log('DB: Connected');
});

// CONTROLLERS
var moviesController = require('./controllers/moviesController');
var usersController = require('./controllers/usersController');
var importController = require('./controllers/importController');

//==============================================================
// MIDDLEWARE
app.use(session({
  secret: 'braingremlin',
  resave: false,
  saveUninitialized: false,
  maxAge: 2592000000
}));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

app.use('/users', usersController);
app.use('/movies', isLoggedIn, moviesController);
app.use('/import', importController);

// CUSTOM MIDDLEWARE
// Check if a user is logged in (used for '/movies..' route)
function isLoggedIn(req, res, next) {
  if (req.session.loggedInUser) {
    return next();
  } else {
    req.session.badAttempt = true;
    res.redirect('/signup');
  }
}
// if a user is logged in, they can skip the signup page (used for '/signup' route)
function skipLogIn(req, res, next) {
  if (req.session.loggedInUser) {
    res.redirect('/movies/new');
  } else {
    return next();
  }
}
//====================================================================

// ROOT ROUTE
app.get('/', function(req, res) {
  res.redirect('/signup');
});

//============================================================
// REGISTER

// SIGNUP FORM
// GET /signup
app.get('/signup', skipLogIn, function(req, res) {
  res.render('users/signup.ejs', { userTaken: req.session.userTaken,  wrongPass: req.session.wrongPass, wrongUser: req.session.wrongUser, badAttempt: req.session.badAttempt });
});

// LOGOUT
// GET /logout
app.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      console.log('error destroying session: ', req.session);
    } else {
      res.redirect('/signup');
    }
  });
});

// End Register
// ============================================================

// LISTENER
app.listen(port, function() {
  console.log('=================================');
  console.log('MOVIE APP RUNNING ON PORT: ', port);
  console.log('=================================')
});
