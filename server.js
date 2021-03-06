// server.js
var db = require('./models')






//attempting to try some things with api and if i can use variable inside it
var twilloNumber = "'+14156662190'";
var numberToText = "'+18013585821'";
var myMessage;


// require express framework and additional modules
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    session = require('express-session');
    // client = require('twilio')(accountSid, authToken);








// middleware
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
// mongoose.connect('mongodb://localhost/simple-login');

//middleware for session
app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: 'SuperSecretCookie',
    cookie: {
        maxAge: 30 * 60 * 1000
    } // 30 minute cookie lifespan (in milliseconds)
}));





var User = require('./models/user');

//link to index.html??
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

// signup route (renders signup view)
app.get('/signup', function(req, res) {
    res.render('signup');


});

// login route with placeholder response
app.get('/login', function(req, res) {
    res.render('login');
});

app.post('/sessions', function(req, res) {
    // call authenticate function to check if password user entered is correct
    User.authenticate(req.body.email, req.body.password, req.body.phoneNumber, function(err, user) {
        if (user) {
            req.session.userId = user._id;
            res.redirect('/profile');
        } else {
            res.redirect('/login');
        }
    });
});

//shows user profile page
app.get('/profile', function(req, res) {

    // find the user currently logged in
    User.findOne({
        _id: req.session.userId
    }, function(err, currentUser) {
        res.render('profile.ejs', {
            user: currentUser
        })
    });
});


// A create user route - creates a new user with a secure password
app.post('/users', function(req, res) {
    // use the email and password to authenticate here
    User.createSecure(req.body.email, req.body.password, req.body.phoneNumber, function(err, user) {
        res.redirect('/login');
    });
});

//route to log out of account
app.get('/logout', function(req, res) {
    // remove the session user id
    req.session.userId = null;
    // redirect to login (for now)
    req.user = null;
    res.redirect('/login');
});


app.use('/', function(req, res, next) {
    req.currentUser = function(callback) {
        User.findOne({
            _id: req.session.userId
        }, function(err, user) {
            if (!user) {
                callback("No User Found", null)
            } else {
                req.user = user;
                callback(null, user);
            }
        });
    };

    next();
});



//Routes for thoughts
// get all thoughts
app.get('/api/thoughts', function(req, res) {
    // send all thoughts as JSON
    db.Thought.find(function(err, thoughts) {
        if (err) {
            return console.log("index error: " + err);
        }
        res.json(thoughts);
    });
});

// get one thought
app.get('/api/thoughts/:id', function(req, res) {
    db.Thoughts.findOne({
        _id: req.params._id
    }, function(err, data) {
        res.json(data);
    });
});
// create new thought
app.post('/api/thoughts', function(req, res) {
    // create new thought with form data (`req.body`)
    console.log('thoughts create', req.body);
    var newThought = new db.Thought(req.body);
     newThought.save(function handleDBThoughtSaved(err, savedThought) {
        res.json(savedThought);
         myMessage = "\""+ 'New Thought: ' + newThought.description+ ' Category: ' +newThought.category+"\"";


    // client.messages.create({
    //
    //     to: numberToText,
    //     from: twilloNumber,
    //     body: myMessage,
    // }, function(err, message){
    //     console.log(message.sid);
    // });
    });

});


//attempting update
app.put('/api/thoughts/:id', function (req, res) {
  db.Thought.findOne({_id: req.params.id}, function (err, selectedThought) {
    selectedThought.description = req.body.description,
    selectedThought.category = req.body.category
    selectedThought.save(function (err, savedUpdate) {
      if (err) {return console.console.log(err);}
      res.json(savedUpdate);
    });
  });
});


// delete thought
app.delete('/api/thoughts/:id', function(req, res) {
    // get thought id from url params (`req.params`)
    console.log('thoughts delete', req.params);
    var thoughtId = req.params.id;
    // find the index of the thought we want to remove
    db.Thought.findOneAndRemove({
        _id: thoughtId
    }, function(err, deletedThought) {
        res.json(deletedThought);
    });
});


// listen on port 3000
app.listen(3000, function() {
    console.log('server started on locahost:3000');
});
