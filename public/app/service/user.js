app.factory('User', ['$http', '$rootScope', '$q', 'StorageService',
  function (          $http,   $rootScope,   $q,   StorageService ) {

    var self = {

      checkSession: function () {
        var token = StorageService.getSession().token;

        if ( token && token !== 'undefined' ) {
          $http.post('/api/session', {token: token})
          .success(function (data, status, headers, config) {

            if ( data.error ) {
              return StorageService.destroySession();
            }

            StorageService.setUser(data.user);
            $rootScope.categories = data.categories;
          })
          .error(function (data, status, headers, config) {
            if ( status !== 0 ) {
              StorageService.destroySession();
            }
          });
        } else {
          StorageService.destroySession();
        }

      },

      create: function (credentials) {
        var deferred = $q.defer();

        $http.post('/api/user', credentials)
        .success(function (data, status, headers, config) {
          if ( data.error ) deferred.reject(data);
          deferred.resolve(data)
        })
        .error(function (data, status, headers, config) {
          deferred.reject(data);
        });

        return deferred.promise;
      },

      login: function (credentials) {
        var deferred = $q.defer();

        $http.post('/api/login', credentials)
        .success(function (data, status, headers, config) {
          if ( data.error ) deferred.reject(data);
          deferred.resolve(data)
        })
        .error(function (data, status, headers, config) {
          deferred.reject(data);
        });

        return deferred.promise;
      },

      logout: function () {
        var deferred = $q.defer();

        $http.get('/api/logout')
        .success(function (data, status, headers, config) {
          deferred.resolve(data)
        })
        .error(function (data, status, headers, config) {
          deferred.resolve(data)
        });

        return deferred.promise;
      }

    }
    
    return self;

  }]);
