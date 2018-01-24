'use strict';

angular.module('owm.resource.create.carInfo', [])

.controller('carInfoControler', function ($scope, $filter, $state, $log, $q, $stateParams, $translate, resources, resourceService, authService, alertService, dialogService, me) {

  var resource;
  var masterResource;
  var masterResourceProperties;

  if ($scope.resource.registrationPlate) {
    resource = $scope.resource;
    masterResource = resource;
    masterResourceProperties = createResourceProperties(resource);
  } else {
    alertService.load();
    resource = {};
    masterResource = {};
    masterResourceProperties = {};
    $scope.$on('resource_added', function(event, resource2) {
      $scope.resourceAdded = true;
      $scope.resource = resource2;
      masterResource = resource2;
      masterResourceProperties = createResourceProperties(resource2);

      if($stateParams.brand) {
        $scope.resource.brand = $stateParams.brand;
      }
      if($stateParams.model) {
        $scope.resource.model = $stateParams.model;
      }
      if($stateParams.color) {
        $scope.resource.color = $stateParams.color;
      }
      if($stateParams.seats) {
        $scope.resource.numberOfSeats = parseInt($stateParams.seats);
      }
      if($stateParams.fuel) {
        $scope.resource.fuelType = $stateParams.fuel;
      }
      if($stateParams.type) {
        if($stateParams.type === 'stationwagen') {
          $scope.resource.resourceType = 'station';
        }
        else if ($stateParams.type === 'cabriolet') {
          $scope.resource.resourceType = 'cabrio';
        }
        else if ($stateParams.type === 'gesloten opbouw') {
          $scope.resource.resourceType = 'van';
        }
        else if ($stateParams.type === 'kampeerwagen') {
          $scope.resource.resourceType = 'camper';
        }
        else {
          $scope.resource.resourceType = $stateParams.type;
        }
      }
      alertService.loaded();
    });
  }

  $scope.minSeatOptions = [{
    value: undefined,
    label: ''
  }, {
    value: 1,
    label: 1
  }, {
    value: 2,
    label: 2
  }, {
    value: 3,
    label: 3
  }, {
    value: 4,
    label: 4
  }, {
    value: 5,
    label: 5
  }, {
    value: 6,
    label: 6
  }, {
    value: 7,
    label: 7
  }, {
    value: 8,
    label: 8
  }, {
    value: 9,
    label: 9
  }, {
    value: 10,
    label: 10
  }];

  $scope.fuelTypeOptions = [{
    value: 'benzine',
    label: $translate.instant('FUEL_TYPE.BENZINE')
  }, {
    value: 'diesel',
    label: $translate.instant('FUEL_TYPE.DIESEL')
  }, {
    value: 'lpg',
    label: $translate.instant('FUEL_TYPE.LPG')
  }, {
    value: 'elektrisch',
    label: $translate.instant('FUEL_TYPE.ELECTRIC')
  }, {
    value: 'hybride',
    label: $translate.instant('FUEL_TYPE.HYBRID')
  }, {
    value: 'cng',
    label: $translate.instant('FUEL_TYPE.CNG')
  }];

  $scope.resourceTypeOptions = [{
    value: 'car',
    label: $translate.instant('RESOURCE_TYPE.CAR')
  }, {
    value: 'cabrio',
    label: $translate.instant('RESOURCE_TYPE.CABRIO')
  }, {
    value: 'camper',
    label: $translate.instant('RESOURCE_TYPE.CAMPER')
  }, {
    value: 'van',
    label: $translate.instant('RESOURCE_TYPE.VAN')
  }, {
    value: 'station',
    label: $translate.instant('RESOURCE_TYPE.STATION')
  }, {
    value: 'oldtimer',
    label: $translate.instant('RESOURCE_TYPE.OLDTIMER')
  }];

  $scope.resourcePropertyOptions = [{
    value: 'airconditioning',
    label: $translate.instant('ACCESSORIES.AIRCONDITIONING')
  }, {
    value: 'automaat',
    label: $translate.instant('ACCESSORIES.AUTOMATICTRANSMISSION')
  }, {
    value: 'fietsendrager',
    label: $translate.instant('ACCESSORIES.BIKE_CARRIER')
  }, {
    value: 'kinderzitje',
    label: $translate.instant('ACCESSORIES.CHILD_SEAT')
  }, {
    value: 'mp3-aansluiting',
    label: $translate.instant('ACCESSORIES.MP3_CONNECTION')
  }, {
    value: 'navigatie',
    label: $translate.instant('ACCESSORIES.NAVIGATION')
  }, {
    value: 'rolstoelvriendelijk',
    label: $translate.instant('ACCESSORIES.WHEELCHAIR_FRIENDLY')
  }, {
    value: 'trekhaak',
    label: $translate.instant('ACCESSORIES.TOW_BAR')
  }, {
    value: 'winterbanden',
    label: $translate.instant('ACCESSORIES.WINTER_TIRES')
  }];

  $scope.disabledFields = (function () {
    return {
      registrationPlate: true,
      brand: false,
      model: false,
      color: false,
      numberOfSeats: false,
      fuelType: false,
      resourceType: false
    };
  }());

  $scope.cancel = function () {
    $scope.resource = angular.copy(masterResource);
    $scope.resourceProperties = angular.copy(masterResourceProperties);
    $scope.$parent.resource = angular.copy(masterResource);
  };

  $scope.cancel();

  $scope.save = function () {
    alertService.closeAll();
    alertService.load();

    var newProps;
    if($scope.resourceAdded) {
      newProps = $filter('returnDirtyItems')(angular.copy($scope.resource), $scope.editResourceForm, ['location', 'streetNumber', 'city', 'latitude', 'longitude', 'brand', 'model', 'numberOfSeats', 'fuelType', 'color', 'resourceType']);
    } else {
      newProps = $filter('returnDirtyItems')(angular.copy($scope.resource), $scope.editResourceForm, ['location', 'streetNumber', 'city', 'latitude', 'longitude']);
    }

    var alias = $scope.resource.alias,
      brand = $scope.resource.brand,
      model = $scope.resource.model,
      color = $scope.resource.color,
      fuelType = $scope.resource.fuelType;

    // check if every input field is filled in
    if (brand && model) {
      if (alias) {
        if (color) {
          if (fuelType) {
            saveResourceProperties()
            .then(function () {
              alertService.load();
              resourceService.alter({
                  resource: $scope.resource.id,
                  newProps: newProps
                })
                .then(function (resource) {
                  masterResource = resource;
                  masterResourceProperties = $scope.resourceProperties;
                  $scope.cancel();
                  $state.go('owm.resource.create.location', {brand: false, model: false, color: false, numberOfSeats: false, fuelType: false, resourceType: false});
                })
                .catch(function (err) {
                  alertService.addError(err);
                })
                .finally(function () {
                  alertService.loaded();
                });
            });
          } else {
            alertService.add('danger', 'Op welke brandstof rijdt jouw auto?', 5000);
            alertService.loaded();
          }
        } else {
          alertService.add('danger', 'Welke kleur heeft jouw auto?', 5000);
          alertService.loaded();
        }
      } else {
        alertService.add('danger', 'Kies een bijnaam voor jouw auto.', 5000);
        alertService.loaded();
      }
    } else {
      alertService.add('danger', 'Vul het merk en type van jouw auto in', 5000);
      alertService.loaded();
    }
  };

  function createResourceProperties(resource) {
    var resourceProperties = {};
    angular.forEach(resource.properties, function (resourceProperty) {
      resourceProperties[resourceProperty.id] = true;
    });
    return resourceProperties;
  }

  function saveResourceProperties() {
    var pending = [];
    angular.forEach($scope.resourceProperties, function (value, propertyName) {
      if (value === true && !masterResourceProperties[propertyName]) {
        pending.push(resourceService.addProperty({
          resource: $scope.resource.id,
          property: propertyName
        }));
      }
      $log.debug('propertyName', propertyName);
      if (value === false && masterResourceProperties[propertyName]) {
        pending.push(resourceService.removeProperty({
          resource: $scope.resource.id,
          property: propertyName
        }));
      }
    });
    return $q.all(pending);
  }
});
