/**
 * Dependencies
 */

var async = require('async');
var geocode = require('../../lib/geocode');
var request = require('./supertest');

/**
 * Valid addresses
 */

var valid = [{
  address: '1111 Army Navy Dr',
  city: 'Arlington',
  state: 'Virginia',
  zip: 22202,
  ll: {
    lng: -77.06398575433832,
    lat: 38.86583364990412
  }
}, {
  address: '1133 15th St NW',
  city: 'Washington',
  state: 'DC',
  zip: 20005,
  ll: {
    lng: -77.03453573533511,
    lat: 38.90486028317662
  },
}];

/**
 * Invalid addresses
 */

/**
 * BDD
 */

describe('gecoder', function() {
  describe('#encode()', function() {
    it('should correctly convert the valid addresses into ll points',
      function(done) {
        async.each(valid, function(row, next) {
          geocode.encode(row, function(err, addresses) {
            if (err) return next(err);
            var ll = addresses[0].feature.geometry;
            row.ll.should.eql({
              lng: ll.x,
              lat: ll.y
            });
            next();
          });
        }, done);
      });
  });

  describe('#reverse()', function() {
    it('should correctly convert the valid ll points into addresses',
      function(done) {
        async.each(valid, function(row, next) {
          geocode.reverse(row.ll, function(err, address) {
            if (err) return next(err);
            address.address.should.eql(row.address);
            next();
          });
        }, done);
      });
  });
});
