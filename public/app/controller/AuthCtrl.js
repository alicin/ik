app.controller('AuthCtrl', ['$scope', 'User', 'StorageService',
  function (                 $scope,   User,   StorageService ) {

    $scope.authenticate = function () {
      User.login($scope.user)
      .then(function (data) {
        StorageService.setSession(data, null, true);
      })
      .catch(function (data) {
        StorageService.destroySession();
      })
    };

    $scope.signup = function () {
      User.create($scope.user)
      .then(function (data) {
        console.log(data);
      })
      .catch(function (data) {
        console.log(data);
      })
    };

    window.angular.authenticate = function (email, password) {
      $scope.user = {email: email, password: password};
      $scope.authenticate();
    };
  
}])