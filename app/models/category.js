var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var utils    = require('../helpers/utils');
var Q        = require('q');

var CategorySchema = new Schema({
  title: {
    type: String,
    unique: true,
    required: true
  },
  slug: String,
  color: String,
  subCategory: [{
    type: ObjectId,
    ref: 'Category'
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

CategorySchema.pre('save', function (next) {
  this.slug = utils.slugify(this.title, true);
  next();
});

CategorySchema.statics.list = function () {
  var deferred = Q.defer();
  
  this.find()
  .exec(function (error, categories) {
    if (error) return deferred.reject(error);
    deferred.resolve(categories);
  });

  return deferred.promise;
};

CategorySchema.statics.findByTitle = function (title) {
  var deferred = Q.defer();
  
  this.findOne({title: title})
  .exec(function (error, category) {
    if (error) return deferred.reject(error);
    deferred.resolve(category);
  });

  return deferred.promise;
};

CategorySchema.statics.create = function (data) {
  var deferred = Q.defer();
  var Category = this;

  var category = new Category({
    title: data.title,
    color: data.color
  });

  category.save(function (error, category) {
    if (error) return deferred.reject(error);
    deferred.resolve(category);
  })

  return deferred.promise;
};

module.exports = mongoose.model('Category', CategorySchema);
