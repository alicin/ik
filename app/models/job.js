var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var utils    = require('../helpers/utils');
var Q        = require('q');
var _        = require('underscore');
var social   = require('../helpers/social');

var JobSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  organization: {
    type: ObjectId, 
    ref: 'Organization'
  },
  category: {
    type: ObjectId, 
    ref: 'Category'
  },
  jobTitle: String,
  description: String,
  active: {
    type: Boolean,
    default: false
  },
  requirements: String,
  slug: String,
  source: {
    type: String,
    required: true,
    unique: true
  },
  rejected: {
    type: Boolean,
    default: false
  },
  redirectCount: {
    type: Number,
    default: 0
  },
  // 1:full-time, 2:part-time
  type: {
    type: Number,
    default: 1
  },
  remote: {
    type: Boolean,
    default: false
  },
  posted_at: {
    type: Date,
    default: Date.now
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

JobSchema.pre('save', function (next) {
  if ( !this.slug ) this.slug = utils.slugify(this.title + '_' + this._id, true);
  next();
});

JobSchema.statics.list = function (user, group) {
  var user = user || {};
  var deferred = Q.defer();
  var month = Date.now() - 1000 * 60 * 60 * 24 * 30;

  var query = user.authLevel === 3 ? {posted_at: {$gt:  month}, rejected: {$ne: true}} : {active: true, posted_at: {$gt: month}, rejected: {$ne: true}};

  this.find(query)
  .sort({posted_at: -1})
  .populate('organization')
  .populate('category')
  .exec(function (error, jobs) {
    if (error) return deferred.reject(error);
    if (group) return deferred.resolve(utils.groupJobsByDate(jobs));
    deferred.resolve(jobs);
  })
  
  return deferred.promise;
};

JobSchema.statics.listByCategory = function (user, category, group) {
  var user = user || {};
  var deferred = Q.defer();
  var self = this;

  this.model('Category').find(category)
  .then(function (category) {

    self.find({active: true, category: category, posted_at: {$gt:  month}, rejected: {$ne: true}})
    .sort({posted_at: -1})
    .populate('organization')
    .populate('category')
    .exec(function (error, jobs) {
      if (error) return deferred.reject(error);
      if (group) return deferred.resolve(utils.groupJobsByDate(jobs));
      deferred.resolve(jobs);
    });
  })
  .catch(function (error) {
    deferred.reject(error.toString());
  });
  
  return deferred.promise;
};

JobSchema.statics.create = function (data) {
  var deferred = Q.defer();

  var Job = this;
  var Organization = this.model('Organization');

  Organization.findOrCreate(data.organization, data.location, data.organizationInfo, data.logo)
  .then(function (organizationId) {
    var job = new Job({
      title: data.title,
      type: data.type,
      remote: data.remote,
      organization: organizationId,
      description: data.description,
      requirements: data.requirements,
      source: data.source,
      jobTitle: data.jobTitle,
      posted_at: data.posted_at || Date.now()
    });

    job.save(function (error) {
      if (error) return deferred.reject(error);
      deferred.resolve({success: true, job: job});
    })
  })
  .catch(function (error) {
    deferred.reject(error.toString());
  });

  return deferred.promise;
};

JobSchema.statics.update = function (id, data) {
  var deferred = Q.defer();
  var jobUpdateData = _.pick(data, 'title', 'description', 'requirements', 'category', 'type', 'remote', 'jobTitle', 'active', 'rejected', 'posted_at');
  var organizationUpdateData = _.pick(data, 'organization').organization;
  var self = this;

  this.model('Organization').updateOrCreate(organizationUpdateData)
  .then(function (organizationId) {
    self.findById(id, function (error, job) {
      if ( error ) return deferred.reject(error);
      if ( !job ) return deferred.reject({error: 'Job not found'});
      if ( organizationId ) job.organization = organizationId;
      job = _.extend(job, jobUpdateData);
      job.save(function (error, job) {
        if (error) return deferred.reject(error);
        job.populate('organization category', function (err, job) {
          if (error) return deferred.reject(error);
          if ( !jobUpdateData.rejected && jobUpdateData.active ) {
            social(jobUpdateData.title + ' - ' + organizationUpdateData.title + ' ' + 'http://isguc.co?r=' + job._id);
          }
          deferred.resolve(job);
        });
      })
    });

  })
  .catch(function (error) {
    console.log(error);
    deferred.reject(error.toString());
  });

  return deferred.promise;
};

JobSchema.statics.toggle = function (id) {
  var deferred = Q.defer();

  this.findById(id, function (error, job) {
    if (error) return deferred.reject(error);
    if (!job) return deferred.reject({error: 'Job not found'});
    job.active = !job.active;
    job.save(function (error, job) {
      if (error) return deferred.reject(error);
      deferred.resolve(job);
    })
  });

  return deferred.promise;
};

JobSchema.statics.destroy = function (id) {
  var deferred = Q.defer();

  this.findByIdAndRemove(id, function (error) {
    if (error) return deferred.reject(error);
    deferred.resolve({success: true});
  })

  return deferred.promise;
};

JobSchema.statics.incrementAction = function (id) {
  this.findOneAndUpdate({_id: id}, {$inc: {redirectCount: 1}}, function (err) {
    if ( err ) return console.log(err);
  });
}

module.exports = mongoose.model('Job', JobSchema);
