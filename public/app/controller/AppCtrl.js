app.controller('AppCtrl', ['$scope', '$rootScope', 'User',
  function (                 $scope,  $rootScope ) {

    $rootScope.$on('auth::loggedIn', function (event, data) {
      if (data.authLevel === 3) $scope.isAdmin = true;
      $scope.user = data;
    });

    $rootScope.$on('auth::loggedOut', function (event, data) {
      $scope.isAdmin = false;
      $scope.user = undefined;
    });
  
}])