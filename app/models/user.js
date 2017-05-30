var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Q        = require('q');
var bcrypt   = require('bcrypt');
var gravatar = require('gravatar');
var auth     = require('../helpers/auth');
var slug     = require('../helpers/slug');
var utils    = require('../helpers/utils');

var SALT_WORK_FACTOR = 11;

var UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,9})+$/, 'Please enter a valid email address.']
  },
  password: String,
  local: String,
  username: {
    type: String,
    lowercase: true,
    unique: true
  },
  active: {
    type: Boolean,
    default: false
  },
  full_name: String,
  avatar: String,
  // authLevel 1: user, 2: company, 3: admin
  authLevel: {
    type: Number,
    default: 1
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Hooks
UserSchema.pre('save', function (next) {
  var user = this;
  // Avatar
  if ( !this.avatar ) {
    this.avatar = gravatar.url(this.email, {s: '300', d: 'retro'}, true);
  };

  if (!this.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
      console.log(err);
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });

})

// Model methods
UserSchema.statics.create = function (userData) {
  var deferred = Q.defer();

  var User = this;
  var user = new User({
    email: userData.email,
    local: utils.removeSpecialCharactes(userData.email.split('@')[0]),
    password: userData.password
  });

  user.save(function (error) {
    if ( error ) return deferred.reject(error);
    deferred.resolve({ success: true });
    // create and send activation link through email
  });

  return deferred.promise;
}

UserSchema.statics.login = function (email, password) {
  var deferred = Q.defer();

  this.findOne({email: email.toLowerCase()}, function (error, user) {
    if ( error ) return deferred.reject(error);
    if ( !user ) return deferred.reject({error: 'Wrong email and password combination.'});
    if ( !user.active ) return deferred.reject({error: 'User is not activated, please check your inbox for activation link.'});

    user.comparePassword(password, function (err, match) {
      if ( error ) return deferred.reject({error: 'An error occured, please try again.'});
      if ( !match ) return deferred.reject({error: 'Wrong email and password combination.'});

      var userData = utils.generateSessionData(user);
          
      auth.createAndStoreToken(userData, function (error, token) {
        if ( error ) return deferred.reject(error);
        deferred.resolve({ token: token, user: userData });
      });

    })

  });

  return deferred.promise;
};

UserSchema.statics.logout = function (headers) {
  var deferred = Q.defer();

  auth.expireToken(headers, function(error, success) {
    if ( error ) return deferred.reject({error: 'Unauthorized'});
    if ( !success ) return deferred.reject({error: 'Unauthorized'})
    deferred.resolve({success: true});
  });

  return deferred.promise;
};

// Document methods
UserSchema.methods.comparePassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(error, isMatch) {
    cb(error, isMatch);
  });
};

// Plugins

UserSchema.plugin(slug('local', {
  field: 'username'
}));

module.exports = mongoose.model('User', UserSchema);
