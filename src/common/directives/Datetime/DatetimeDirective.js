'use strict';

angular.module('datetimeDirective', [])

.directive('datetime', function () {
  return {
    restrict: 'E',
    scope: {
      datetime: '@'
    },
    replace: true,
    templateUrl: 'directives/datetime/datetime.tpl.html'
  };
});
