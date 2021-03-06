var alerts = require('alerts');
var log = require('log')('change-password-page');
var page = require('page');
var request = require('request');
var template = require('./template.html');
var create = require('view');

/**
 * Create view
 */

var View = create(template);

/**
 * On button click
 */

View.prototype.changePassword = function(e) {
  e.preventDefault();
  var password = this.find('#password').value;
  var repeat = this.find('#repeat-password').value;
  if (password !== repeat) return window.alert('Passwords do not match.');

  var self = this;
  request.post('/users/change-password', {
    change_password_key: this.model.key,
    password: password
  }, function(err, res) {
    if (err) {
      log.error(err);
      window.alert(
        'Failed to change password. Use the link sent to your email address.'
      );
    } else {
      alerts.push({
        type: 'success',
        text: 'Login using your new password.'
      });

      page(self.back());
    }
  });
};

/**
 * Back
 */

View.prototype.back = function() {
  if (this.model.manager) return '/manager/login';
  return '/login';
};

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  ctx.view = new View({
    key: ctx.params.key,
    manager: ctx.manager
  });

  next();
};
