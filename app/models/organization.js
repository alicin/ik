var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Q        = require('q');
var _        = require('underscore');
var utils    = require('../helpers/utils');

var OrganizationSchema = new Schema({
  title: {
    type: String,
    unique: true,
    required: true
  },
  location: String,
  info: String,
  logo: String,
  homepage: String,
  email: String,
  phone: String,
  claimed: {
    type: Boolean,
    default: false
  },
  slug: {
    type: String,
    unique: true
  },
  rating: Number,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

OrganizationSchema.pre('save', function (next) {
  this.slug = utils.slugify(this.title, true);
  next();
});

OrganizationSchema.statics.findOrCreate = function (title, location, info, logo) {
  var deferred = Q.defer();
  var Organization = this;
  Organization.findOne({title: title})
  .exec(function (error, organization) {
    if ( error ) deferred.reject(error);
    if ( organization ) {
      return deferred.resolve(organization._id)
    };
    
    
    var organization;

    if ( logo ) {
      utils.downloadLogo(logo)
      .then(function (file) {
        organization = new Organization({
          title: title,
          info: info,
          location: location,
          logo: file
        });

        organization.save(function (error) {
          if ( error ) deferred.reject(error);
          deferred.resolve(organization._id);
        });
        
      })
      .catch(function (error) {
        deferred.reject(error.toString());
      })
    } else {
      organization = new Organization({
        title: title,
        info: info,
        location: location
      });

      organization.save(function (error, organization) {
        if ( error ) deferred.reject(error);
        deferred.resolve(organization._id);
      });

    };

  })
  return deferred.promise;
};

OrganizationSchema.statics.update = function (organizationData) {
  var deferred = Q.defer();

  this.findById(organizationData._id, function (error, organization) {
    if ( error ) deferred.reject(error);
    organization = _.extend(organization, _.pick(organizationData, 'title', 'location', 'local'));
    organization.save(function (error) {
      if ( error ) deferred.reject(error);
      deferred.resolve(organization);
    })

  })

  return deferred.promise;
};

OrganizationSchema.statics.updateOrCreate = function (organizationData) {
  var deferred = Q.defer();
  var self = this;
  this.findById(organizationData._id, function (error, _organization) {
    if ( error ) deferred.reject(error);
    if ( _organization ) {
      _organization = _.extend(_organization, _.pick(organizationData, 'title', 'location', 'local'));
      _organization.save(function (error) {
        var message = error ? error.toString() : '';
        if ( message.indexOf('$title_1') > -1 && message.indexOf('E11000') > -1 ) {
          self.findOne({title: organizationData.title}, function (error, organization) {
            if ( error ) return deferred.reject(error);
            deferred.resolve(organization._id);
          });
          return;
        }
        if ( error ) return deferred.reject(error);
        deferred.resolve();
      })

    };

  });

  return deferred.promise;
};

module.exports = mongoose.model('Organization', OrganizationSchema);
