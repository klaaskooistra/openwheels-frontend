'use strict';

angular.module('owm.shell')

.controller('MenuController', function ($window, $log, $rootScope, $scope, $state, $translate, authService, featuresService, contractService) {

  $rootScope.$watch(function isAuthenticated () {
    return authService.user.isAuthenticated;
  }); // end $watch

  $scope.navigate = function (toState, toParams) {
    $scope.closeMenu();
    $state.go(toState, toParams);
  };

  $scope.translateAndNavigate = function (translateKey) {
    var translated = $translate.instant(translateKey);
    $scope.closeMenu();
    $window.location.href = translated;
  };

});
