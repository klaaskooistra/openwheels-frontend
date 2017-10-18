'use strict';

angular.module('owm.booking.new', [])

  .controller('NewBookingShowController', function ($scope, booking, me) {

    $scope.booking = booking;
    $scope.resource = booking.resource;
    $scope.userPerspective = booking.person.id === me.id ? 'renter' : 'owner';
    $scope.timeFrame = null;

  })
;
