var Commuter = require('commuter');
var commuterForm = require('commuter-form');
var log = require('log')('manager-router');
var Organization = require('organization');
var organizationForm = require('organization-form');
var p = require('page');
var session = require('session');
var utils = require('router-utils');

// Setup

p('*', function(ctx, next) {
  ctx.manager = true;
  next();
});

// Show alerts

p('*', require('alerts'));

// If the user is logged in, redirect to orgs, else redirect to login

p('/', session.checkIfLoggedIn, utils.redirect('/organizations'));

// Public links

p('/login', require('login-page'));
p('/logout', session.logoutMiddleware);
p('/forgot-password', require('forgot-password-page'));
p('/change-password/:key', require('change-password-page'));

// Admin only

p('/managers', session.checkIfLoggedIn, session.checkIfAdmin, require(
  'managers-page'));

// Organizations

p('/organizations*', session.checkIfLoggedIn);
p('/organizations', require('organizations-page'));
p('/organizations/new', organizationForm);
p('/organizations/:organization/show', Organization.load, Commuter.loadOrg, require(
  'organization-page'));
p('/organizations/:organization/edit', Organization.load, organizationForm);

// Commuters

p('/organizations/:organization/commuters/new', Organization.load, commuterForm);
p('/organizations/:organization/commuters/:commuter/*', Organization.load, Commuter.load);
p('/organizations/:organization/commuters/:commuter/show', Organization.load, Commuter.load, require(
  'commuter-page'));
p('/organizations/:organization/commuters/:commuter/edit', Organization.load, Commuter.load, commuterForm);

// Render all

p('*', utils.render);
