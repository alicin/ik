var express   = require('express');
var router    = express.Router();
var app       = express();

var auth = require('../app/helpers/auth');
var job  = require('../app/controllers/job');
var home = require('../app/controllers/home');
var user = require('../app/controllers/user');
var seo  = require('../app/controllers/seo/seo');

module.exports = function (app) {

  router.get('/', seo.home, home.show);
  router.get('/isler', home.show);
  router.get('/c/:category', home.show);
  router.get('/facebook', function (req, res) {
    res.json(req.body);
  })

  // JOBS
  router.get('/api/job/list/:page', auth.passUserData, job.list);
  router.get('/api/job/category/:category', job.listByCategory);
  router.post('/api/job', auth.verify, job.create);
  router.put('/api/job/:id', auth.passUserData, auth.verifyAdmin, job.update);
  router.put('/api/job/:id/toggle', auth.passUserData, auth.verifyAdmin, job.toggle);
  router.delete('/api/job/:id', auth.verify, job.destroy);

  // AUTH
  router.post('/api/login', user.login);
  router.get('/api/logout', auth.verify, user.logout);
  router.post('/api/session', auth.verify, user.getCurrentSession);

  // USER
  router.post('/api/user', user.create)

  app.use('/', router);

};
