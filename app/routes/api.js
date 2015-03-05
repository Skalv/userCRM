var User   = require('../models/user');
var jwt    = require('jsonwebtoken');
var config = require('../../config');

// secret for creating token
var superSecret = config.secret;

module.exports = function(app, express) {
  var apiRouter = express.Router();

  // route to authenticate a user
  apiRouter.post('/authenticate', function(req, res) {
    console.log(req.body.username);

    // Find the user
    // select the password explicitly since mongoose is not returning it by default
    User.findOne({
      username: req.body.username
    }).select('password').exec(function(err, user) {
      if (err) throw err;

      // no user with that username was found
      if (!user) {

        res.json({
          success: false,
          message: 'Authentication failed. User not found.'
        });

      } else if (user) {

        // check if password matches
        var validPassword = user.comparePassword(req.body.password);
        if (!validPassword) {

          res.json({
            success: false,
            message: "Authentication failed. Wrong password."
          });

        } else {

          // if user is found and password right
          // create token
          var token = jwt.sign(user, superSecret, {
            expiresInMinutes: 1440 // expires in 24 hours
          });

          // return the information, including token as JSON
          res.json({
            success: true,
            message: "Enjoy your token",
            token: token
          });

        }
      }
    });
  });

  // route middleware to verify a token
  apiRouter.use(function(req, res, next) {
    //do logging
    console.log('Somebody just came to our app!');

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.param('token') || req.headers['x-access-token'];

    // decode token
    if (token) {

      //verifies secret and checks exp
      jwt.verify(token, superSecret, function(err, decoded) {
        if (err) {
          return res.json({success: false, message: "Failed to authenticate token."});
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;

          next();
        }
      });

    } else {

      // if there is not token
      // return an HTTP response 403 and an error message
      return res.status(403).send({
        sucesse: false,
        message: "No token provided."
      });

    }
  });

  // test route to make sure everything working
  // accessed at GET /api
  apiRouter.get('/', function(req, res) {
    res.json({ message: "Hooray! Welcome to our api!"});
  });

  // on routes thant end in /users
  // --------------------------------------------------------------------------------------
  apiRouter.route('/users')

      // create user
      // accessed at POST /api/users)
      .post(function(req, res) {
        var user = new User();             // create new instance of the User model
        user.name = req.body.name;         // set the user name (comes from the request)
        user.username = req.body.username; // set tthe user username (come grom the request)
        user.password = req.body.password; // set tthe user username (come grom the request)

        user.save(function(err) {
          if (err) res.send(err);

          // return message
          res.json({ message: "User created!" });
        })
      })

      // get all the user
      // accessed at GET /api/users)
      .get(function(req, res) {
        User.find(function(err, users) {
          if (err) res.send(err);

          // return the users
          res.json(users);
        });
      });

  // on route that end in /users/:user_id
  // ----------------------------------------------------------------------------------------
  apiRouter.route('/users/:user_id')

    // get the user whith that id
    .get(function(req, res) {
      User.findById(req.params.user_id, function(err, user) {
        if (err) res.send(err);

        // return that user
        res.json(user);
      });
    })

    // update the user with this id
    .put(function(req, res) {
      User.findById(req.params.user_id, function(err, user) {
        if (err) res.send(err);

        // set the new user information if it exists in the request
        if (req.body.name) user.name = req.body.name;
        if (req.body.username) user.username = req.body.username;
        if (req.body.password) user.password = req.body.password;

        // save the user
        user.save(function(err) {
          if (err) res.send(err);

          // return a message
          res.json({ message: "user updated!" });
        });
      });
    })

    // delete the user with this id
    .delete(function(req, res) {
      User.remove({
        _id: req.params.user_id
      }, function(err, user) {
        if (err) res.send(err);

        // return a message and new list of users
        User.find(function(err, users) {
          if (err) res.send(err);

          res.json({ message: "Successfully deleted!", users: users });
        });
      });
    });

  return apiRouter;
}