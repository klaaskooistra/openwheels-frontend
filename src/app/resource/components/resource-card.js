'use strict';

angular.module('owm.resource')

.directive('owResourceCard', function () {
  return {
    restrict: 'E',
    scope: {
      resource: '=',
      onSelect: '&'
    },
    templateUrl: 'resource/components/resource-card.tpl.html',
    controller: function ($scope) {
      var ageInDays = moment().diff($scope.resource.created, 'days');
      $scope.resource.isNew = ageInDays < 180;

      $scope.select = function () {
        if ($scope.onSelect) {
          $scope.onSelect($scope.resource);
        }
      };
    }
  };
});
