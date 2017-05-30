

var express = require('express'),
  config = require('./config/config'),
  glob = require('glob'),
  mongoose = require('mongoose');

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
  require(model);
});
var app = express();

require('./config/express')(app, config);
require('./app/helpers/crawler').init();

if ( app.get('env') !== 'production' ) {
  mongoose.set('debug', true);
}

app.listen(config.port, function () {
  console.log('Made with <3 by Ali Can Bardakci');
});

