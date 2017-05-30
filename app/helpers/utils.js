var request = require('request').defaults({ encoding: null });
var Q       = require('q');
var fs      = require('fs');
var mkdirp  = require('mkdirp');
var _       = require('underscore');

module.exports = {
  
  slugify: function (text, removeSpecialCharactes) {
    var text = removeSpecialCharactes ? this.removeSpecialCharactes(text) : text
    var slug = text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
    return slug;
  },

  removeSpecialCharactes: function (text) {
    var specialChar = {
      'çÇ':'c',
      'ğĞ':'g',
      'şŞ':'s',
      'úüÜùûÚÙÛ':'u',
      'íıìîïIİÍÌÎÏ':'i',
      'óöÖòôÓÒÔ':'o',
      'éèëêÉÈËÊ': 'e',
      'áäâàâÄÂÁÀÂ': 'a',
    };
    for(var key in specialChar) {
      text = text.replace(new RegExp('['+key+']','g'), specialChar[key]);
    }

    return text;
  },

  generateRandomString: function (length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
    return result;
  },

  getQueryParams: function  (url, parameter) {
    
    parameter = parameter.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + parameter + '=([^&#]*)');
    var results = regex.exec(url);
    
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));

  },

  meetMinimumAge: function (bithDate, minAge) {
    var today = new Date();
    var birthDate = new Date(bithDate);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= minAge;
  },

  dateDiff: function( firstDate, secondDate ) {
    var diff = Date.parse( secondDate ) - Date.parse( firstDate ); 
    return isNaN( diff ) ? NaN : {
      diff : diff,
      ms : Math.floor( diff            % 1000 ),
      s  : Math.floor( diff /     1000 %   60 ),
      m  : Math.floor( diff /    60000 %   60 ),
      h  : Math.floor( diff /  3600000 %   24 ),
      d  : Math.floor( diff / 86400000        )
    };
  },

  // Project Specific

  generateSessionData: function (user, platform) {
    return {
      id: user._id,
      username: user.username, 
      email: user.email,
      full_name: user.full_name,
      avatar: user.avatar,
      authLevel: user.authLevel,
      ttl: (platform === 'mobile') ? 17280000 : null
    }
  },

  generateDownloadPath: function (hash, type) {

    return __dirname.replace('app/helpers', 'public/u/' + type + '/') + hash.substr(0, 2) + '/' + hash.substr(2, 2) + '/' + hash.substr(4, 2) + '/';
  },

  downloadLogo: function (url) {
    var self = this;
    var deferred = Q.defer();

    request(url, function (error, res, buffer) {
      if ( error ) deferred.reject(error);

      var extension = res.headers['content-type'].split('/')[1].replace('jpeg', 'jpg');
      var hash = require('crypto').createHash('md5').update(buffer).digest('hex');
      var dir = self.generateDownloadPath(hash, 'logo');

      mkdirp(dir, function (error) {
        if ( error ) deferred.reject(error);
        fs.writeFile(dir + hash + '.' + extension, buffer, function (error) {
          if ( error ) deferred.reject(error);
          deferred.resolve(dir + hash + extension);
        })
      });

    });

    return deferred.promise;
  },

  groupJobsByDate: function (jobs) {
    var self = this;
    var today = new Date();
    return _.groupBy(jobs, function (item) {
      if ( !item.active ) return 'passive';
      var postDate = item.posted_at
      if ( !self.dateDiff(postDate, today).d ) return 'today';
      if ( self.dateDiff(postDate, today).d === 1 ) return 'yesterday';
      if ( self.dateDiff(postDate, today).d > 1 && self.dateDiff(postDate, today).d < 7 ) return 'lastWeek';
      if ( self.dateDiff(postDate, today).d > 6 && self.dateDiff(postDate, today).d < 30 ) return 'lastMonth';
    });

  }

};
