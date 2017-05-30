app.factory('StorageService', ['$window', '$rootScope', '$location',
  function (                    $window,   $rootScope,   $location ) {

    var isLocalStorageSupported = function () {
      var testKey = 'test', storage = window.sessionStorage;
      try 
      {
        storage.setItem(testKey, '1');
        storage.removeItem(testKey);
        return true;
      } 
      catch (error) 
      {
        return false;
      }
    }();

    var self = {
      
      setSession: function (data, redirect, remember) {

        if ( !data || !data.token || !data.user ) {
          return;
        }

        if ( isLocalStorageSupported ) {

          $window.localStorage.remember = remember;
          
          if ( remember ) {
            $window.localStorage.token = data.token;
            $window.localStorage.user  = JSON.stringify(data.user);
          } else {
            $window.sessionStorage.token = data.token;
            $window.sessionStorage.user  = JSON.stringify(data.user);
          }

        } else {

          Cookies.set('token', data.token)
          Cookies.set('user', JSON.stringify(data.user));

        }

        $rootScope.$emit('auth::loggedIn', data.user);

        if ( redirect ) {
          $location.url(redirect);
        }

      },

      setUser: function (data) {

        if ( !data ) {
          return;
        }

        if ( isLocalStorageSupported ) {

          var remember = this.getSessionType();
          if ( remember ) {
            $window.localStorage.user  = JSON.stringify(data);
          } else {
            $window.sessionStorage.user  = JSON.stringify(data);
          }

        } else {

          Cookies.set('user', JSON.stringify(data.user));

        }

        $rootScope.$emit('auth::loggedIn', data);
      },

      getSession: function () {

        if ( isLocalStorageSupported ) {

          var remember = this.getSessionType();
          if ( remember ) {
            return {
              user: ($window.localStorage.user && $window.localStorage.user !== 'undefined') ? JSON.parse($window.localStorage.user) : null,
              token: $window.localStorage.token
            }  
          } else {
            return {
              user: ($window.sessionStorage.user && $window.localStorage.user !== 'undefined') ? JSON.parse($window.sessionStorage.user) : null,
              token: $window.sessionStorage.token
            }
          }

        } else {

          return {

            user: (Cookies.get('user') && Cookies.get('user') !== 'undefined') ? JSON.parse(Cookies.get('user')) : null,
            token: Cookies.get('token')

          }

        }
        
      },

      destroySession: function () {
        if ( isLocalStorageSupported ) {

          var remember = this.getSessionType();
          if ( remember ) {
            $window.localStorage.removeItem('token');
            $window.localStorage.removeItem('user');
          } else {
            $window.sessionStorage.removeItem('token');
            $window.sessionStorage.removeItem('user');
          }
          
          $window.localStorage.removeItem('remember');

        } else {
          Cookies.expire('token');
          Cookies.expire('user');
        }
        
        $rootScope.$emit('auth::loggedOut');
      },

      getSessionType: function () {
        if ( isLocalStorageSupported ) {
          return ($window.localStorage.remember ) ? true : false;
        } else {
          return false;
        }
      }

    }
    
    return self;

  }]);
