'use strict';

angular.module('owm.home', ['owm.resource', 'slick'])

//Module in app/pages/pagesModule.js
.controller('HomeController', function ($scope, $translate, $location, resourceQueryService, $state, resourceService, $localStorage, $http) {

  $scope.$watch(function () {
    return $translate.use();
  }, function (lang) {
    if (lang) {
      $scope.lang = lang;
    }
  });

  loadBlogItems();

  function loadBlogItems () {
    $http({
      method: 'GET',
      url: 'https://mywheels.nl/blog/feed/json'
    })
    .then(function (response) {
      var maxResults = 4;
      if (response.data && response.data.items) {
        $scope.blogItems = response.data.items.slice(0, maxResults);
      }
    })
    .catch(function () {
      $scope.blogItems = [];
    });
  }

  if ($scope.features.featuredSlider) {
    resourceService.all({
        'onlyFeatured': 'true'
      })
      .then(function (res) {
        $scope.resources_slider = res;
      });
    $scope.gotoProfile = function (resource) {
      $state.go('owm.resource.show', {
        city: resource.city,
        resourceId: resource.id
      });
    };
  }

  $scope.search = {
    text: ''
  };

  $scope.doSearch = function (placeDetails) {
    if (placeDetails) {
      resourceQueryService.setText($scope.search.text);
      resourceQueryService.setLocation({
        latitude: placeDetails.geometry.location.lat(),
        longitude: placeDetails.geometry.location.lng()
      });
    }
    $state.go('owm.resource.search.list', resourceQueryService.createStateParams());
  };

});
