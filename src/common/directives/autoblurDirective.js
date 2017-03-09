'use strict';

angular.module('autoblurDirective', [])
.directive('autoblur', [function () {

  return {
    restrict: 'A',
    link: function (scope, element) {
      element.on('click', function () {
        element.blur();
      });
    }
  };
}]);
