var express = require('express');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy
var router = express.Router();

var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{
    'title':'Register'
  });
});

router.get('/login', function(req, res, next) {
  res.render('login',{
    'title':'LogIn'
  });
});

router.post('/register', function(req, res, next) {
  // get the form value
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

// multer is used to file managing system
  if(req.body.profileImage){
    console.log('Uploading File....');
  //File Info
    var profileImageOrImageName = req.files.profileImage.originalname;
    var profileImageName = req.files.profileImage.name;
    var profileImageMime = req.files.profileImage.mimetype;
    var profileImagePath = req.files.profileImage.path;
    var profileImageExt = req.files.profileImage.extension;
    var profileImageSize = req.files.profileImage.size;
  }else{
    var profileImageName = 'noImage.png'
  }

//form validation
  req.checkBody('name','Name is required').notEmpty();
  req.checkBody('email','Email address is required').notEmpty();
  req.checkBody('email','Email address is not valid').isEmail();
  req.checkBody('username','user name is required').notEmpty();
  req.checkBody('password','password is required').notEmpty();
  req.checkBody('password2','password do not match').equals(req.body.password);

// check for error
 var errors = req.validationErrors();

 if(errors){
   res.render('register',{
     errors : errors,
     name : name,
     email : email,
     username : username,
     password : password,
     password2 : password2
   });
 }else{
   var newUser = new User({
     name : name,
     email : email,
     username : username,
     password : password,
     profileImage : profileImageName
   });

   // create user
   User.createUser(newUser, function(err, user){
     if (err) throw err;
     console.log(user);
   });

   req.flash('success','You are now registered and may log in');

   res.location('/');
   res.redirect('/');

 }

});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new localStrategy(
  function(username, password, done){
    User.getUserByUsername(username,function(err,user){
      if (err) throw err;
      if (!user){
        console.log('Unknown User');
        return done(null, false,{message:'Unknown User'});
      }
      User.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        }else{
           console.log('Invalid password');
           return done(null, false, {message : 'Invalid password'});
        }
      });
    });
  }
));

router.post('/login',passport.authenticate('local',{failureRedirect:'users/login', failureFlash:'Invalid username or password'}),function(req,res){
  console.log('Authentication successful');
  req.flash('success','You are logged in');
  res.redirect('/');
});
module.exports = router;
