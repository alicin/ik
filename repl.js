var repl     = require("repl");
var moment   = require("moment");
var glob     = require('glob');
var mongoose = require('mongoose');
var express  = require('express');
var config   = require('./config/config');

mongoose.connect(config.db);
mongoose.set('debug', false);
var db = mongoose.connection;

db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var app = express();
var env = app.get('env');

var replServer = repl.start({
  prompt: "isguc.com [" + env + "] > ",
});

replServer.context.app = app;
replServer.context.db = db;
replServer.context.moment = moment;

replServer.context.Category = require(config.root + '/app/models/category.js');
replServer.context.Job = require(config.root + '/app/models/job.js');
replServer.context.Organization = require(config.root + '/app/models/organization.js');
replServer.context.User = require(config.root + '/app/models/user.js');
