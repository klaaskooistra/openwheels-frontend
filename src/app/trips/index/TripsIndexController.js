'use strict';

angular.module('owm.trips.index', [])

.controller('TripsIndexController', function ($log, $timeout, $q, API_DATE_FORMAT, alertService, bookingService, me, $scope, linksService) {

  $scope.me = me;
  $scope.provider = me.provider.id;

  // Set the default values for the loader spinner and collapsible toggles

  $scope.showLoaderSpinner = false;
  $scope.showRenterBookings = false;
  $scope.showOwnerBookings = false;

  // Define the years to be displayed

  $scope.years = (function () {
    var y = moment().year();
    return [y-2, y-1, y, y+1];
  }());

  // Load all bookings for the current year on first run

  $scope.selectedYear = moment().year();
  loadYear();

  // When the year changes, load all bookings for the selected year
  $scope.$watch('selectedYear', function (year) {
    $scope.selectedYear = year;
    loadYear();
  });

  // Pagination for the owner bookings

  $scope.curPage = 1;
  $scope.perPage = 10;
  $scope.offset = ($scope.curPage - 1) * $scope.perPage;

  $scope.nextPage = function() {
    $scope.curPage = $scope.curPage + 1;
    $scope.offset = ($scope.curPage - 1) * $scope.perPage;
    loadOwnerBookings();
  };

  $scope.prevPage = function() {
    $scope.curPage = $scope.curPage - 1;
    $scope.offset = ($scope.curPage - 1) * $scope.perPage;
    loadOwnerBookings();
  };

  function loadYear ()
  {
    // Convert the year to a start and end  date

    $scope.startDate = moment([$scope.selectedYear, 0, 1]);
    $scope.endDate = moment([$scope.selectedYear + 1, 0, 1]);

    // Get the bookings for this person as renter

    bookingService.getBookingList({
      person: me.id,
      timeFrame: {
        startDate: $scope.startDate.format(API_DATE_FORMAT),
        endDate: $scope.endDate.format(API_DATE_FORMAT)
      }
    }).then(function(renterBookings) {
      $scope.renterBookings = renterBookings;
    });

    // Get the bookings for this person as an owner
    loadOwnerBookings();
  }

  function loadOwnerBookings()
  {
    // Get the bookings for this person as owner with pagination

    bookingService.forOwner({
      person: me.id,
      timeFrame: {
        startDate: $scope.startDate.format(API_DATE_FORMAT),
        endDate  : $scope.endDate.format(API_DATE_FORMAT),
      },
      offset: $scope.offset,
      limit: $scope.perPage
    }).then(function(ownerBookings) {
      $scope.ownerBookings = ownerBookings.result;
      $scope.totalOwnerBookings = ownerBookings.total;
      $scope.lastPage = Math.ceil($scope.totalOwnerBookings / $scope.perPage);
    });
  }

  $scope.createTripDetailsLink = function (booking) {
    return linksService.tripDetailsPdf(booking.id);
  };

});