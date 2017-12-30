'use strict';

angular.module('owm.resource.filter', [])

  .controller('ResourceFilterController', function ($scope, $stateParams, $mdDialog, $translate, props, filters, options) {
    $scope.props   = props; // .radius, ...
    $scope.filters = filters;
    $scope.options = options;

    $scope.radiusOptions = [
      { value:  1000, label: '< 1 km' },
      { value:  5000, label: '< 5 km' },
      { value: 10000, label: '< 10 km' },
      { value: 25000, label: '< 25 km' },
      { value: 50000, label: '< 50 km' }
    ];

    $scope.fuelTypeOptions = [
      {value: 'cng', label: $translate.instant('FUEL_TYPE.CNG')},
      {value: 'benzine', label: $translate.instant('FUEL_TYPE.BENZINE')},
      {value: 'diesel', label: $translate.instant('FUEL_TYPE.DIESEL')},
      {value: 'elektrisch', label: $translate.instant('FUEL_TYPE.ELECTRIC')},
      {value: 'hybride', label: $translate.instant('FUEL_TYPE.HYBRID')},
      {value: 'lpg', label: $translate.instant('FUEL_TYPE.LPG')}
    ];

    $scope.resourceTypeOptions = [
      {value: 'van', label: $translate.instant('RESOURCE_TYPE.VAN')},
      {value: 'cabrio', label: $translate.instant('RESOURCE_TYPE.CABRIO')},
      {value: 'camper', label: $translate.instant('RESOURCE_TYPE.CAMPER')},
      {value: 'station', label: $translate.instant('RESOURCE_TYPE.STATION')},
      {value: 'oldtimer', label: $translate.instant('RESOURCE_TYPE.OLDTIMER')}
    ];

    $scope.minSeatOptions = [
      {value: 3, label: '3'},
      {value: 4, label: '4'},
      {value: 5, label: '5'},
      {value: 6, label: '6'},
      {value: 7, label: '7'}
    ];

    $scope.optionsLabels = {
      'airconditioning':     $translate.instant('ACCESSORIES.AIRCONDITIONING'),
      'automaat':            $translate.instant('ACCESSORIES.AUTOMATICTRANSMISSION'),
      'fietsendrager':       $translate.instant('ACCESSORIES.BIKE_CARRIER'),
      'kinderzitje':         $translate.instant('ACCESSORIES.CHILD_SEAT'),
      'mp3-aansluiting':     $translate.instant('ACCESSORIES.MP3_CONNECTION'),
      'navigatie':           $translate.instant('ACCESSORIES.NAVIGATION'),
      'rolstoelvriendelijk': $translate.instant('ACCESSORIES.WHEELCHAIR_FRIENDLY'),
      'trekhaak':            $translate.instant('ACCESSORIES.TOW_BAR'),
      'winterbanden':        $translate.instant('ACCESSORIES.WINTER_TIRES')
    };

    $scope.selectResourceType = function(value){
      $scope.filters.resourceType = value;
    };

    $scope.resetResourceType= function() {
      $scope.filters.resourceType = undefined;
    };

    $scope.selectFuelType = function(value){
      $scope.filters.fuelType = value;
    };

    $scope.resetFuelType= function() {
      $scope.filters.fuelType = undefined;
    };

    $scope.selectMinSeats = function(value){
      $scope.filters.minSeats = value;
    };

    $scope.resetMinSeats = function() {
      $scope.filters.minSeats = undefined;
    };

    $scope.selectRadius = function(value){
      $scope.props.radius = value;
    };

    $scope.resetRadius = function() {
      $scope.props.radius = 25000;
    };

    $scope.ok = function () {
      $mdDialog.hide({filters: $scope.filters, options: $scope.options, props: $scope.props });
    };

    $scope.cancel = function () {
      $mdDialog.hide('cancel');
    };
  })

;
