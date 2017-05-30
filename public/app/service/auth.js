app.factory('AuthInterceptor', ['$location', '$q', '$window', 'StorageService', '$rootScope',
  function (                     $location,   $q,   $window,   StorageService,   $rootScope ) {
    
    return {
      request: function (config) {
        var token = StorageService.getSession().token;

        config.headers = config.headers || {};
        if (token && token !== 'undefined') {
          config.headers.Authorization = 'Bearer ' + token;
        }
        return config;
      },
      response: function (response) {
        
        if ( response.status === 401 ) {
          StorageService.destroySession();
        } else if ( response.status === 404 ) {
          $rootScope.$emit('httpError::404');
        } else if ( response.status === 500 ) {
          $rootScope.$emit('httpError::500');
        }

        return response || $q.when(response);
      },
      responseError: function(rejection) {

        if ( rejection.status === 401 ) {
          StorageService.destroySession();
        } else if ( rejection.status === 404 ) {
          $rootScope.$emit('httpError::404');
        } else if ( rejection.status === 500 ) {
          $rootScope.$emit('httpError::500');
        }
        return $q.reject(rejection);
      }
    };
  }]);
