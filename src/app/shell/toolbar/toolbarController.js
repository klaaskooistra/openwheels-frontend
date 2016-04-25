'use strict';

angular.module('owm.shell')

.controller('ToolbarController', function ($state, $scope, resourceQueryService) {
    $scope.doSearch = function (placeDetails) {
      if (placeDetails) {
        resourceQueryService.setText($scope.search.text);
        resourceQueryService.setLocation({
          latitude : placeDetails.geometry.location.lat(),
          longitude: placeDetails.geometry.location.lng()
        });
      }
      $state.go('owm.resource.search.list', resourceQueryService.createStateParams());
    };

  });
