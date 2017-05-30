var User     = require('../models/user.js');
var Category = require('../models/category.js');

module.exports = {

  create: function (req, res) {

    User.create(req.body)
    .then(function (message) {
      res.json(message);
    })
    .catch(function (error) {
      res.json(error);
    })
  },

  getCurrentSession:  function (req, res) {
    var user = req._user || {};

    if ( user.authLevel === 3 ) {
      Category.list()
      .then(function (categories) {
        res.json({user: user, categories: categories})
      })
    } else {
      if ( req._user ) {
        res.json({user: req._user});
      }else {
        res.json({error: 'Session not found'});
      }
    }
  },

  login: function (req, res) {
    User.login(req.body.email, req.body.password)
    .then(function (data) {
      res.json(data);
    })
    .catch(function (error) {
      res.status(401).json(error);
    });
  },

  logout: function (req, res) {
    User.logout(req.headers)
    .then(function (message) {
      res.json(message);
    })
    .catch(function (error) {
      res.status(401).json(error);
    });
  }

}