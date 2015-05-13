'use strict';

/**
 * @ngdoc overview
 * @name realrig
 * @description
 * # realrig
 *
 * Main module of the application.
 */
angular
  .module('realrig', [
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/login.html',
        controller: 'LoginController'
      })

      .otherwise({
        redirectTo: '/'
      });
  });
