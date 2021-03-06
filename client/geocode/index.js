var log = require('log')('geocode');
var get = require('request').get;

/**
 * Geocode
 */

module.exports = geocode;
module.exports.suggest = suggest;

/**
 * Geocode
 */

function geocode(address, callback) {
  log('--> geocoding %s', address);
  get('/geocode/' + address, function(err, res) {
    if (err) {
      log('<-- geocoding error %s', err);
      callback(err, res);
    } else {
      log('<-- geocoding complete %j', res.body);
      callback(null, res.body);
    }
  });
}

/**
 * Suggestions!
 */

function suggest(text, callback) {
  log('--> getting suggestion for %s', text);
  get('/geocode/suggest/' + text, function(err, res) {
    if (err) {
      log('<-- suggestion error %s', err);
      callback(err, res);
    } else {
      log('<-- got %s suggestions', res.body.length);
      callback(null, res.body);
    }
  });
}
