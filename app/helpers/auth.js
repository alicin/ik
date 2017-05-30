var redisHelper = require('./redis');
var tokenHelper = require('./token');
var TIME_TO_LIVE = 60 * 60 * 24 * 15;


/*
* Middleware to verify the token and store the user data in req._user
*/
exports.verify = function(req, res, next) {
  var headers = req.headers;
  if (headers == null) return res.status(401).json({error: 'Unauthorized'});

  // Get token
  try {
    var token = tokenHelper.extractTokenFromHeader(headers);
  } catch (err) {
    return res.status(401).json({error: 'Unauthorized'});
  }

  //Verify it in redis, set data in req._user
  redisHelper.getDataByToken(token, function(err, data) {

    if (err) return res.status(401).json({error: 'Unauthorized'});

    req._user = data;

    next();
  });
};

exports.verifyAdmin = function (req, res, next) {
  if ( req._user.authLevel === 3 ) {
    next()
  } else {
    return res.status(401).json({error: 'Unauthorized'});
  }
}

exports.passUserData = function (req, res, next) {
  
  var headers = req.headers;
  if (headers == null) {
    req._user = false;
    return next();
  }


  try {
    var token = tokenHelper.extractTokenFromHeader(headers);
  } catch (err) {
    req._user = false;
    return next();
  }

  //Verify it in redis, set data in req._user
  redisHelper.getDataByToken(token, function(err, data) {

    if (err) {
      req._user = false;
      return next();
    }

    req._user = data;

    next();
  });

};

/*
* Create a new token, stores it in redis with data during ttl time in seconds
* callback(err, token);
*/
exports.createAndStoreToken = function(data, callback) {
  data = data || {};

  if (data.ttl) {
    ttl = data.ttl;
  } else {
    ttl = TIME_TO_LIVE;
  }

  if (data != null && typeof data !== 'object') callback(new Error('data is not an Object'));
  if (ttl != null && typeof ttl !== 'number') callback(new Error('ttl is not a valid Number'));

  tokenHelper.createToken(function(err, token) {
    if (err) callback(err);

    redisHelper.setTokenWithData(token, data, ttl, function(err, success) {
      if (err) callback(err);

      if (success) {
        callback(null, token);
      }
      else {
        callback(new Error('Error when saving token'));
      }
    });
  });
};

/*
* Expires the token (remove from redis)
*/
exports.expireToken = function(headers, callback) {
  if (headers == null) callback(new Error('Headers are null'));
  // Get token
  try {
    var token = tokenHelper.extractTokenFromHeader(headers);

    if (token == null) callback(new Error('Token is null'));

    redisHelper.expireToken(token, callback);
  } catch (err) {
    console.log(err);
    return callback(err);
  } 
}