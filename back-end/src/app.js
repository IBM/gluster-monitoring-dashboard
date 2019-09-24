// Imports for logging and setting up REST-API
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const passwordHasher = require('password-hash');
const Notify = require('./notify')

// Bearer Token Authentication
const jwt = require('jsonwebtoken');
const config = require('./config');

// Setting up express app
const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

// Setting the secret as the configuration secret
app.set('Secret', config.secret);
app.set('registration_secret', config.registration_secret);

// Connecting to mongodb with authentication
var mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.connect('mongodb://' + process.env.MONGODB_SERVICE + ':27017/gluster-dashboard', {
    "user": process.env.MONGODB_USER,
    "pass": process.env.MONGODB_PASSWORD,
});
var db = mongoose.connection;
db.on("error", function (err) {  
  console.log('Mongoose connection error: ' + err);
  process.exit(1);
});
db.once("open", function(callback) {
  console.log("Connection Succeeded");
});

// Setting up the bearer token model
var BearerToken = require('../models/bearer');

// First time setup to save a bearer token to the mongodb database
// or retreive one that already exists
BearerToken.find({}, 'token', function (error, tokens) {
  if (error) {
    console.error(error);
  }
  if (tokens.length < 1) {
    var token = jwt.sign({authorized: true}, app.get('Secret'));

    var new_token = new BearerToken({
      token: token
    })

    new_token.save(function (error) {
      if (error) {
        console.log(error)
      }
      console.log("Bearer Token Generated: " + token);
    })
  }
  else{
    console.log("Existing Bearer Token: " + tokens[0].token);
  }
});

// Setting up notification model and Notifier class
var Notification = require('../models/notification');
var Notifier = new Notify.Notify(null);

// Setting initial notification settings
Notification.find({}, 'name settings events message', function (error, notification_settings) {
  if (error) { 
      console.error(error); 
  }
  Notifier.updateSettings(notification_settings);
});

// Setting up REST API to receive notification settings
app.post('/notification', async function (req, res) {
  var notification_settings = req.body.notification_settings;
  var username = req.body.username;
  var token = req.body.token;
  if (token) {
    await User.find({ username: username }, 'username passwordHash', async function (error, users) {
      if (error) {
        console.error(error);
      }
      if (users.length < 1) {
        res.send({
          verified: false,
          message: "This user does not exist"
        });
      } else {
        await jwt.verify(token, users[0].passwordHash, async function (err, _) {
          if (err) {
            res.send({
              verified: false,
              message: 'Authorization Token is not valid'
            });
          } else {
            var response = [];
            for (var i = 0; i < notification_settings.length; i++) {
              var notification_setting = notification_settings[i];
              await Notification.deleteMany({ name: notification_setting.name }, async function (error) {
                if (error) {
                  console.error(error);
                }
                var new_notification = new Notification({
                  name: notification_setting.name,
                  settings: notification_setting.settings,
                  events: notification_setting.events,
                });
                const success = await new_notification.save();
                if (!success) {
                  console.error(error);
                } else {
                  await Notification.find({}, 'name settings events', async function (error, new_notification_settings) {
                    if (error) { 
                      console.error(error); 
                    } else {
                      Notifier.updateSettings(new_notification_settings);
                      response.push({
                        name: notification_setting.name,
                        settings: notification_setting.settings,
                        events: notification_setting.events,
                      });
                      if (i == (notification_settings.length)) {
                        res.send({
                          verified: true,
                          notification_rules: response
                        });
                      }
                    }
                  });
                }
              });
            }
          }
        });
      }
    });
  } else {
    res.send({
      verified: false,
      message: 'No Authorization Token Provided'
    });
  }
});
app.options('/notification', cors());

app.post('/notification-rules', async function (req, res) {
  var username = req.body.username;
  var token = req.body.token;
  if (token) {
    await User.find({ username: username }, 'username passwordHash', async function (error, users) {
      if (error) {
        console.error(error);
      }
      if (users.length < 1) {
        res.send({
          verified: false,
          message: "This user does not exist"
        });
      } else {
        await jwt.verify(token, users[0].passwordHash, async function (err, _) {
          if (err) {
            res.send({
              verified: false,
              message: 'Authorization Token is not valid'
            });
          } else {
            res.send({
              verified: true,
              notification_rules: Notifier.getRules()
            });
          }
        });
      }
    });
  } else {
    res.send({
      verified: false,
      message: 'No Authorization Token Provided'
    });
  }
});
app.options('/notification-rules', cors());

app.get('/notification-options', (req, res) => {
  res.send({
    notification_options: Notifier.getOptions()
  });
});

// Setting up event model
var Event = require('../models/event');

// Setting up REST API for getting events
app.post('/events', (req, res) => {
  var username = req.body.username;
  var token = req.body.token;
  if (token) {
    User.find({ username: username }, 'username passwordHash', function (error, users) {
      if (error) {
        console.error(error);
      }
      if (users.length < 1) {
        res.send({
          verified: false,
          message: "This user does not exist"
        });
      } else {
        jwt.verify(token, users[0].passwordHash, (err, _) => {
          if (err) {
            res.send({
              verified: false,
              message: 'Authorization Token is not valid'
            });
          } else {
            Event.find({}, 'nodeid ts event message created_at', function (error, events) {
              if (error) { 
                console.error(error); 
              }
              res.send({
                verified: true,
                events: events
              });
            });
          }
        });
      }
    });
  }
});
app.options('/events', cors());

// Setting up REST API for receiving events
app.post('/listen', (req, res) => {
  var token = req.headers['x-access-token'] || req.headers['authorization'];
  if (token) {
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
  }
  if (token) {
    jwt.verify(token, app.get('Secret'), (err, _) => {
      if (err) {
        res.send({
          success: false,
          message: 'Bearer Token is not valid'
        });
      } else {
        var nodeid = req.body.nodeid;
        var ts = req.body.ts;
        var event = req.body.event;
        var message = req.body.message;
        var created_at = new Date()
        var new_event = new Event({
          nodeid: nodeid,
          ts: ts,
          event: event,
          message: message,
          created_at: created_at
        });
        new_event.save(function (error) {
          if (error) {
            console.error(error);
          }
          res.send({
            success: true,
            message: 'Event saved successfully!',
            values: {
              nodeid: nodeid,
              ts: ts,
              event: event,
              message: message,
              created_at: created_at
            }
          });
        });
        Notifier.ingest({nodeid: nodeid, ts: ts, event: event, message: message, created_at: created_at});
      }
    });
  } else {
    res.send({
      success: false,
      message: 'Bearer Token not supplied'
    });
  }
});
app.options('/listen', cors());

// Setting up user model
var User = require('../models/user');

// Setting up REST API for checking if this is a first run
app.get('/firstrun', (req, res) => {
  User.find({}, 'username passwordHash', function (error, users) {
    if (error) {
      console.error(error);
    }
    if (users.length < 1) {
      res.send({
        firstrun: true
      });
    } else {
      res.send({
        firstrun: false
      });
    }
  });
});

// Setting up REST API for registering users
app.post('/register', (req, res) => {
  var username = req.body.username;
  var passwordHash = req.body.passwordHash;
  var token = req.body.token;
  if (token) {
    jwt.verify(token, app.get('registration_secret'), (err, _) => {
      if (err) {
        res.send({
          verified: false,
          success: false,
          message: 'Registration Token is not valid'
        });
      } else {
        var new_user = new User({
          username: username,
          passwordHash: passwordHash
        });
        User.find({}, 'username passwordHash', function (error, users) {
          if (error) {
            console.error(error);
          }
          if (users.length < 1) {
            new_user.save(function (error) {
              if (error) {
                console.error(error);
              }
              res.send({
                verified: true,
                success: true,
                message: 'User registered successfully!',
                values: {
                  username: username,
                  passwordHash: passwordHash
                }
              });
            })
          } else {
            res.send({
              verified: true,
              success: false,
              message: 'A user already exists.',
              values: {
                username: username,
                passwordHash: passwordHash
              }
            });
          }
        });
      }
    });
  }
});
app.options('/register', cors());

// Setting up REST API for logging in users
app.post('/login', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var token = req.body.token;
  if (token) {
    User.find({ username: username }, 'username passwordHash', function (error, users) {
      if (error) {
        console.error(error);
      }
      if (users.length < 1) {
        res.send({
          verified: false,
          message: "This user does not exist"
        });
      } else {
        jwt.verify(token, users[0].passwordHash, (err, _) => {
          if (err) {
            res.send({
              verified: false,
              message: 'Authorization Token is not valid'
            });
          } else {
            res.send({
              verified: true,
              message: "User logged in"
            })
          }
        });
      }
    });
  } else {
    User.find({ username: username }, 'username passwordHash', function (error, users) {
      if (error) {
        console.error(error);
      }
      if (users.length < 1) {
        res.send({
          verified: false,
          message: "This user does not exist"
        });
      }
      else {
        if (users[0].username == username && passwordHasher.verify(password, users[0].passwordHash)) {
          var token = jwt.sign({userAuth: true}, users[0].passwordHash);
          res.send({
            verified: true,
            message: "User logged in",
            token: token
          })
        }
        else{
          res.send({
            verified: false,
            message: "Incorrect username or password"
          })
        }
        
      }
    });
  }
});
app.options('/login', cors());

app.listen(process.env.PORT || 9000);
