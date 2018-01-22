'use strict';
angular.module('owm.resource.edit.pictures', [])
.controller('ResourceEditPicturesController', function ($q, $timeout, $filter, $scope, $state, alertService, resourceService, Analytics) {

  $scope.ownerflow = $state.current.name === 'owm.resource.create.carPhotos' ? true : false;
  var resource = $scope.$parent.resource;

  // scope exports
  angular.extend($scope, {
    photos       : [],
    emptySlots   : [],
    addPicture   : addPicture,
    removePicture: removePicture
  });

  // configure "as-sortable" - see https://github.com/a5hik/ng-sortable
  $scope.sortableOptions = {
    containment: '.photo-grid',
    orderChanged: function (e) {
      savePictures($scope.photos);
    }
  };

  initPhotos();

  function initPhotos () {
    $scope.photos = createArray(resource.pictures);
  }

  function reloadResource () {
    return resourceService.get({
      id: resource.id
    }).then(function (reloaded) {
      resource.pictures = reloaded.pictures;
      initPhotos();
    }).catch(function (err) {
      alertService.addError(err);
    });
  }

  function createArray (pictures) {
    var out = [];
    var sorted = $filter('orderBy')(pictures, 'order');
    angular.forEach(sorted, function (picture) {
      out.push({
        url: $filter('resourceAvatar')(picture, 'large'),
        originalPicture: picture
      });
    });

    return out;
  }

  function addPicture (file) {
    $scope.isBusy = true;

    return resourceService.addPicture({
      resource: resource.id
    }, {
      image: file
    })
    .then(function (something) {
      Analytics.trackEvent('resource', 'picture_uploaded', resource.id, undefined, true);
      return reloadResource();
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      $scope.isBusy = false;
    });
  }

  function removePicture (photo, index) {
    $scope.isBusy = true;

    return resourceService.removePicture({
      picture: photo.originalPicture.id
    })
    .then(function (res) {
      return reloadResource();
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      $scope.isBusy = false;
    });
  }

  function savePictures (photos) {
    var pending = [];
    $scope.isBusy = true;

    angular.forEach(photos, function (photo, index) {
      pending.push(
        resourceService.alterPicture({
          picture: photo.originalPicture.id,
          newProps: {
            order  : index
          }
        })
      );
    });

    return $q.all(pending).then(function (results) {
      return reloadResource();
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      $scope.isBusy = false;
    });
  }

});
