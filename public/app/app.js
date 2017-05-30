var app = angular.module('app', ['ngAnimate', 'ngSanitize', 'ui.router', 'angularytics']);

app.config(['$httpProvider', '$stateProvider', '$locationProvider', '$urlRouterProvider', 'AngularyticsProvider',
  function ( $httpProvider,   $stateProvider,   $locationProvider,   $urlRouterProvider,   AngularyticsProvider ) {
  
    // Push state enable
    $locationProvider.html5Mode({
      enabled: true
    });

    // Auth interceptor
    $httpProvider.interceptors.push('AuthInterceptor');

    // Angularytics
    AngularyticsProvider.setEventHandlers(['Console', 'GoogleUniversal']);

    // States

    $stateProvider.state('list', {
      url: '/',
      templateUrl: 'templates/list.tpl.html',
      controller: 'ListCtrl'
    })
    .state('listByCategory', {
      url: '/c/:category',
      templateUrl: 'templates/list.tpl.html',
      controller: 'CategoryListCtrl'
    })

    $urlRouterProvider.otherwise('/');

}])
.run(      ['Angularytics', 'User', 
  function ( Angularytics,   User ) {

  Angularytics.init();
  User.checkSession();

}])
