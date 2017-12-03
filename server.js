// DEPENDENCIES

const express        = require('express');
const app            = express();
const dotenv         = require('dotenv').config();
const methodOverride = require('method-override');
const mongoose       = require('mongoose');
const session        = require('express-session');

// PORT
const port = process.env.PORT || 3000;

// DB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/movies_app'
mongoose.connect(mongoURI, { useMongoClient: true });
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', () => {
  console.log('DB: Connected ', mongoURI);
});
mongoose.Promise = global.Promise;

// CONTROLLERS
const moviesController = require('./controllers/moviesController');
const usersController = require('./controllers/usersController');
const importController = require('./controllers/importController');

//==============================================================
// MIDDLEWARE
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  maxAge: 2592000000
}));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use('/users', usersController);
app.use('/movies', isLoggedIn, moviesController);
app.use('/imports', isLoggedIn, importController);

// CUSTOM MIDDLEWARE
// Check if a user is logged in (used for '/movies..' and '/imports..' routes)
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
app.get('/', (req, res) => {
  res.redirect('/signup');
});

//============================================================
// REGISTER

// SIGNUP FORM
// GET /signup
app.get('/signup', skipLogIn, (req, res) => {
  res.render('users/signup.ejs', { userTaken: req.session.userTaken,  wrongPass: req.session.wrongPass, wrongUser: req.session.wrongUser, badAttempt: req.session.badAttempt });
});

// LOGOUT
// GET /logout
app.get('/logout', async (req, res) => {
  try {
    await req.session.destroy();
    res.redirect('/signup');
  } catch (err) {
    console.log('error destroying session: ', req.session);
  }
});

// End Register
// ============================================================

// LISTENER
app.listen(port, () => {
  console.log('=================================');
  console.log('MOVIE APP RUNNING ON PORT: ', port);
  console.log('=================================')
});
