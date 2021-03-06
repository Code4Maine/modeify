var auth = require('./auth');
var bodyParser = require('body-parser');
var compression = require('compression');
var config = require('./config');
var env = process.env.NODE_ENV;
var express = require('express');
var log = require('./log');
var morgan = require('morgan');
var read = require('fs').readFileSync;
var serveFavicon = require('serve-favicon');
var serveStatic = require('serve-static');
var hogan = require('hogan.js');

/**
 * Expose `app`
 */

var app = module.exports = express()
  .use(compression());

// Serve static files
if (env === 'development') {
  app
    .use('/assets', serveStatic(__dirname + '/../assets'))
    .use(serveFavicon(__dirname + '/../assets/images/favicon.png'))
    .use(morgan('dev'));
}

app.use(bodyParser.urlencoded({
  extended: true
}))
  .use(bodyParser.json());

var planner = compile('planner');
var manager = compile('manager');

app.use('/api', auth);
app.use('/api/campaigns', require('./campaign'));
app.use('/api/commuters', require('./commuter'));
app.use('/api/events', require('./event'));
app.use('/api/emails', require('./email'));
app.use('/api/feedback', require('./feedback/api'));
app.use('/api/health', require('./health'));
app.use('/api/geocode', require('./geocode'));
app.use('/api/journeys', require('./journey'));
app.use('/api/locations', require('./location'));
app.use('/api/organizations', require('./organization'));
app.use('/api/otp', require('./otp/api'));
app.use('/api/users', require('./user'));
app.use('/api/webhooks', require('./webhooks'));

/**
 * Logger
 */

app.post('/api/log', function(req, res) {
  var type = req.body.type;
  if (log[type]) log[type](req.body.text);
  res.status(200).end();
});

/**
 * Manager
 */

app.all('/manager*', function(req, res) {
  res.status(200).send(manager);
});

/**
 * Planner
 */

app.all('*', function(req, res) {
  res.status(200).send(planner);
});

/**
 * Handle Errors
 */

app.use(function(err, req, res, next) {
  err = err || new Error('Server error.');
  res.status(err.status || 500).send(err.message || err);
});

/**
 * Compile templates
 */

function compile(name) {
  return hogan.compile(read(__dirname + '/../client/' + name + '.html', {
    encoding: 'utf8'
  })).render({
    application: config.application,
    segmentio_key: config.segmentio_key,
    static_url: config.static_url
  });
}
