'use strict';

angular.module('owm.person.license', [])

.controller('PersonLicenseController', function ($log, $http, $state, authService, person, personService, alertService, me, $scope, Analytics, $filter, $translate) {

  $scope.isBusy = false;
  $scope.person = person;
  $scope.licenseNumberValid = true;
  $scope.licenseNumberRepeatValid = true;
  $scope.licenseNumberMatch = true;
  $scope.licenseDateValid = true;
  $scope.validLicenseMin = moment().format('YYYY');
  $scope.validLicenseMax = moment().add('years', 30).format('YYYY');
  $scope.onlyNumbers = /^\d+$/;

  initPerson(person);

  function initPerson(person) {
    // certain fields may only be edited if driver license is not yet checked by the office (see template)
    $scope.allowLicenseRelated = (person.driverLicenseStatus !== 'ok');

    $scope.licenseDate = {
      day: Number(moment($scope.person.drivingLicenseValidUntil).format('DD')),
      month: Number(moment($scope.person.drivingLicenseValidUntil).format('MM')),
      year: Number(moment($scope.person.drivingLicenseValidUntil).format('YYYY'))
    };

    $scope.driverLicenseNumber = $scope.person.driverLicenseNumber;
  }

  $scope.submitDriverLicense = function () {
    if($scope.driverLicenseNumber !== undefined && $scope.driverLicenseNumber.length === 10)
    {
      if($scope.driverLicenseNumberRepeat !== undefined && $scope.driverLicenseNumberRepeat.length === 10)
      {
        if(
          !isNaN($scope.licenseDate.day) &&
          $scope.licenseDataForm.day.$valid &&
          !isNaN($scope.licenseDate.month) &&
          $scope.licenseDataForm.month.$valid &&
          !isNaN($scope.licenseDate.year) &&
          $scope.licenseDataForm.year.$valid)
        {
          if($scope.driverLicenseNumber === $scope.driverLicenseNumberRepeat) {

            var newProps = $filter('returnDirtyItems')( angular.copy($scope.person), $scope.licenseDataForm);
            var licenseDateExpire = $scope.licenseDate.year + '-' + $scope.licenseDate.month+ '-' + $scope.licenseDate.day;

            newProps.driverLicenseNumber = $scope.driverLicenseNumber;
            newProps.drivingLicenseValidUntil = licenseDateExpire;

            alertService.closeAll();
            alertService.load();
            $scope.isBusy = true;

            personService.alter({
              id: person.id,
              newProps: newProps
            })
            .then(function () {
              Analytics.trackEvent('person', 'driverlicense_uploaded', undefined, undefined, true);
              alertService.add('success', $translate.instant('LICENSE_UPLOADED_CONFIRM'), 5000);
              $state.go('owm.person.dashboard');
            })
            .catch(function (err) {
              alertService.addError(err);
              $scope.isBusy = false;
            })
            .finally(function () {
              alertService.loaded();
              $scope.isBusy = false;
            });

          } else {
            $scope.licenseNumberMatch = false;
          }
        } else {
          $scope.licenseDateValid = false;
        }
      } else {
        $scope.licenseNumberRepeatValid = false;
      }
    } else {
      $scope.licenseNumberValid = false;
    }
  };

  var inputs = {
    init: function () {
      this.autoDate();
    },
    autoDate: function () { //date input field
      var autoDateInput = angular.element('.autoDateInput')[0];
      autoDateInput.onkeyup = function (e) {
        var target = e.srcElement;
        var maxLength = parseInt(target.attributes.maxlength.value, 10);
        var myLength = target.value.length;
        if (myLength >= maxLength) {
          var next = target;
          next = next.nextElementSibling;
          if (next !== null) {
            if (next.tagName.toLowerCase() === 'input') {
              next.focus();
            }
          }
        }
      };
    }
  };
  inputs.init();

});