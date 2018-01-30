'use strict';

angular.module('owm.trips.index', [])

.controller('TripsIndexController', function ($log, $timeout, $q, API_DATE_FORMAT, alertService, bookingService, me, $scope, linksService) {

  $scope.me = me;
  $scope.provider = me.provider.id;

  // Set the default values for the loader spinner and collapsible toggles

  $scope.showLoaderSpinner = false;
  $scope.showBookings = {};
  $scope.showBookings.asRenter = false;
  $scope.showBookings.asOwner = false;

  // Define the booking variables

  $scope.bookings = {};
  $scope.totalBookings = {};

  // Set pagination defaults

  $scope.curPage = {};
  $scope.perPage = {};
  $scope.offset = {};
  $scope.lastPage = {};

  //TODO: ???
  setPaginationDefaults('asRenter');
  setPaginationDefaults('asOwner');

  function setPaginationDefaults (role) {
    $scope.curPage[role] = 1;
    $scope.perPage[role] = 35;
    $scope.offset[role] = 0;
  }

  // Pagination buttons and their actions

  $scope.nextPage = function(role) {
    $scope.offset[role] = $scope.curPage[role] * $scope.perPage[role];
    $scope.curPage[role] = $scope.curPage[role] + 1;
    loadBookings(role);
  };

  $scope.prevPage = function(role) {
    $scope.offset[role] = ($scope.curPage[role] - 2) * $scope.perPage[role];
    $scope.curPage[role] = $scope.curPage[role] - 1;
    loadBookings(role);
  };

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

  // Load all bookings for the selected year

  function loadYear()
  {
    // Convert the year to a start and end  date

    $scope.startDate = moment([$scope.selectedYear, 0, 1]);
    $scope.endDate = moment([$scope.selectedYear + 1, 0, 1]);

    // Get the bookings for this person as renter
    loadBookings('asRenter');

    // Get the bookings for this person as an owner
    loadBookings('asOwner');
  }

  // Load all bookings for this person in the role of either a renter or an owner with pagination

  function loadBookings(role)
  {
    // Set the offset for the pagination for this role based on the current page and elements per page
    //$scope.offset[role] = ($scope.curPage[role] - 1) * $scope.perPage[role];

    // Define the parameters for getting the bookings
    var parameters = {
      person: me.id,
      timeFrame: {
        startDate: $scope.startDate.format(API_DATE_FORMAT),
        endDate: $scope.endDate.format(API_DATE_FORMAT)
      },
      offset: $scope.offset[role],
      limit: $scope.perPage[role]
    };

    // Define which API call to use for which role

    $scope.showLoaderSpinner = true;
    var bookingsPromise = {};

    if(role === 'asRenter') {
      bookingsPromise = bookingService.getBookingList(parameters);
    }

    if(role === 'asOwner') {
      bookingsPromise = bookingService.forOwner(parameters);
    }

    // Get the bookings

    bookingsPromise
      .then(function(bookings) {

        $scope.bookings[role] = bookings;
        $scope.totalBookings[role] = bookings.total;
        $scope.lastPage[role] = Math.ceil($scope.totalBookings[role] / $scope.perPage[role]);

        $scope.showLoaderSpinner = false;
      });
  }

  $scope.createTripDetailsLink = function (booking) {
    return linksService.tripDetailsPdf(booking.id);
  };

});