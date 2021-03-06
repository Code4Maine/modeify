var geocode = require('../geocode');

/**
 * Expose `plugin`
 */

module.exports = function(schema, options) {

  /**
   * Add address and coordinate fields
   */

  schema.add({
    address: String,
    neighborhood: String,
    city: String,
    county: String,
    state: String,
    zip: Number,
    country: String,
    coordinate: {
      type: Object,
      default: {
        lng: 0,
        lat: 0
      }
    },
    original_address: String
  });

  /**
   * Geocode address on change
   */

  schema.pre('save', true, function(next, done) {
    next();
    var self = this;

    // Save the original address
    if (this.isNew) {
      this.original_address = this.address;
    }

    if (this.addressChanged()) {
      this.geocode(function(err) {
        if (err) {
          // TODO: Handle
          done();
        } else {
          self.reverseGeocode(done);
        }
      });
    } else if (this.isModified('coordinate')) {
      this.reverseGeocode(done);
    } else {
      done();
    }
  });

  /**
   * Address changed
   */

  schema.methods.addressChanged = function() {
    return this.isModified('address') || this.isModified('city') || this.isModified(
      'state') || this.isModified('zip') || this.isModified('country');
  };

  /**
   * Geocode
   */

  schema.methods.geocode = function(callback) {
    var self = this;
    geocode.encode(this.fullAddress(), function(err, addresses) {
      if (err) {
        callback(err);
      } else {
        var ll = addresses[0].feature.geometry;
        self.coordinate = {
          lng: ll.x,
          lat: ll.y
        };

        callback(null, self.coordinate);
      }
    });
  };

  /**
   * Reverse Geocode
   */

  schema.methods.reverseGeocode = function(callback) {
    var self = this;
    geocode.reverse(this.coordinate, function(err, address) {
      if (err) {
        callback(err);
      } else {
        self.address = address.address;
        self.neighborhood = address.neighborhood;
        self.city = address.city;
        self.county = address.county;
        self.state = address.state;
        self.zip = address.zip;
        self.country = address.country;

        callback(null, address);
      }
    });
  };

  /**
   * Add geospatial index to coordinate
   */

  schema.index({
    coordinate: '2d'
  });

  /**
   * Full address
   */

  schema.methods.fullAddress = function() {
    return [this.address, this.city, this.state, this.zip].filter(function(v) {
      return !!v;
    }).join(', ');
  };
};
