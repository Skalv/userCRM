// BASE SETUP
// ==================================================================

// Call packages
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var mongoose   = require('mongoose');
var db         = mongoose.connection;
var config     = require('./config');
var path       = require('path');


// APP CONFIGURATION
// ==================================================================

// use body parser so we can grab information from POST request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
  next();
});

// log all request to console
app.use(morgan('dev'));

// connect to our database.
mongoose.connect(config.database);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('Connected to database!');
});

// set static files lcation
// used for request that our frontend will mage
app.use(express.static(__dirname + '/public'));


// ROUTES FOR API
// ===================================================================

// API ROUTES
var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);

// Main catchall Route
// Send user to frontend
// has to be registered after API routes
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});


// START THE SERVER
// ====================================================================

app.listen(config.port);
console.log('Magic happens on port' + config.port + '.');
