// DEPENDENCIES
var express     = require('express'),
    app         = express(),
    bodyParser  = require('body-parser'),
    mongoose    = require('mongoose'),
    session     = require('express-session');

// PORT
var port = process.env.PORT || 3000;

// DB
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/movies_app'
mongoose.connect(mongoURI);
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function() {
  console.log('DB: Connected');
  // ORIGINAL TESTING CODE FOR CREATING A USER DURING DEVELOPMENT
  // var data = { name: "Brain Gremlin", password: "Brain Gremlin" }
  // var User = require('./models/users');
  // User.create(data, function(err, result) {
  //   if (err) { console.log(err) }
  //   console.log(result);
  //   mongoose.connection.close();
  // });
  // END TESTING CODE
});

// CONTROLLERS
var moviesController = require('./controllers/moviesController');
var usersController = require('./controllers/usersController');

// MIDDLEWARE
app.use(session({
  secret: 'braingremlin',
  resave: false,
  saveUninitialized: false
}));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use('/users', usersController);
app.use('/movies', moviesController);

// ROOT
app.get('/', function(req, res) {
  res.redirect('/signup');
});

//============================================================
// REGISTER

// SIGNUP FORM
// GET /signup
app.get('/signup', function(req, res) {
  res.render('users/signup.ejs', { userTaken: req.session.userTaken });
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
