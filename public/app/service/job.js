app.factory('Job', ['$http',  '$q', 
  function (         $http,    $q ) {

    var self = {

      list: function (credentials) {
        var deferred = $q.defer();

        $http.get('/api/job/list/0')
        .success(function (data, status, headers, config) {
          if ( data.error ) deferred.reject(data);
          deferred.resolve(data);
        })
        .error(function (data, status, headers, config) {
          deferred.reject(data);
        });

        return deferred.promise;
      },

      toggle: function (id) {
        var deferred = $q.defer();

        $http.put('/api/job/' + id + '/toggle')
        .success(function (data, status, headers, config) {
          if ( data.error ) deferred.reject(data);
          deferred.resolve(data);
        })
        .error(function (data, status, headers, config) {
          deferred.reject(data);
        });
        
        return deferred.promise;
      },

      update: function (job, toggle) {
        if ( toggle ) job.active = true;
        var deferred = $q.defer();

        $http.put('/api/job/' + job._id, job)
        .success(function (data, status, headers, config) {
          if ( data.error ) deferred.reject(data);
          deferred.resolve(data);
        })
        .error(function (data, status, headers, config) {
          deferred.reject(data);
        });
        
        return deferred.promise;
      },

      destroy: function (id) {
        var deferred = $q.defer();

        $http.delete('/api/job/' + id )
        .success(function (data, status, headers, config) {
          if ( data.error ) deferred.reject(data);
          deferred.resolve(data);
        })
        .error(function (data, status, headers, config) {
          deferred.reject(data);
        });
        
        return deferred.promise;
      }

    }
    
    return self;

  }]);
