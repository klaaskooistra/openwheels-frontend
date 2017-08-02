'use strict';

angular.module('owm.person.license', [])

.controller('PersonLicenseController', function ($log, $http, $state, authService, person, personService, alertService, me, $scope, Analytics, $filter) {

  var images = {
    front: null
  };

  $scope.images = images;
  $scope.isBusy = false;
  $scope.person = person;
  $scope.licenceDateValid = true;
  $scope.licenceNumberValid = true;
  $scope.validLicenceMin = moment().format('YYYY');
  $scope.validLicenceMax = moment().add('years', 30).format('YYYY');

  $scope.containsLicence = me.status === 'book-only' ? true : false;
  $scope.licenceUploaded = me.status === 'book-only' ? true : false;
  $scope.licenceImage = me.status === 'book-only' ? 'assets/img/rijbewijs_uploaded.jpg' : 'assets/img/rijbewijs_voorbeeld.jpg'; //WHAT IS THE URL??
  $scope.licenceFileName = 'Selecteer je rijbewijs';

  initPerson(person);

  function initPerson(person) {
    // certain fields may only be edited if driver license is not yet checked by the office (see template)
    $scope.allowLicenseRelated = (person.driverLicenseStatus !== 'ok');

    $scope.licenceDate = {
      day: Number(moment($scope.person.drivingLicenseValidUntil).format('DD')),
      month: Number(moment($scope.person.drivingLicenseValidUntil).format('MM')),
      year: Number(moment($scope.person.drivingLicenseValidUntil).format('YYYY'))
    };

    $scope.driverLicenseNumber = $scope.person.driverLicenseNumber;
  }

  angular.element('#licenseFrontFile').on('change', function (e) {
    $scope.$apply(function () {
      images.front = e.target.files[0];
      $scope.licenceFileName = e.target.files[0].name;
      $scope.licenceImage = URL.createObjectURL(e.target.files[0]);
      $scope.containsLicence = true;
    });
  });

  $scope.cancelUpload = function () {
    $scope.containsLicence = false;
    $scope.licenceUploaded = false;
    $scope.licenceImage = me.status === 'book-only' ? 'assets/img/rijbewijs_uploaded.jpg' : 'assets/img/rijbewijs_voorbeeld.jpg'; //WHAT IS THE URL??
    $scope.licenceFileName = 'Selecteer je rijbewijs';
    angular.element('#licenseFrontFile').val('');
  };

  $scope.prepareUpload = function () {
    if($scope.driverLicenseNumber !== undefined && $scope.driverLicenseNumber.length < 11)
    {
      if(
        !isNaN($scope.licenceDate.day) &&
        $scope.licenceDataForm.day.$valid &&
        !isNaN($scope.licenceDate.month) &&
        $scope.licenceDataForm.month.$valid &&
        !isNaN($scope.licenceDate.year) &&
        $scope.licenceDataForm.year.$valid)
      {
        $scope.licenceDateValid = true;
        var newProps = $filter('returnDirtyItems')( angular.copy($scope.person), $scope.licenceDataForm);
        var licenceDateExpire = $scope.licenceDate.year + '-' + $scope.licenceDate.month+ '-' + $scope.licenceDate.day;

        newProps.driverLicenseNumber = $scope.driverLicenseNumber;
        newProps.drivingLicenseValidUntil = licenceDateExpire;

        alertService.closeAll();
        alertService.load();
        $scope.contactFormProcessing = true;
        personService.alter({
          id: person.id,
          newProps: newProps
        })
        .then(function () {
          return authService.me(!!'forceReload').then(function (me) {
            initPerson(me);
            $scope.startUpload();
          });
        })
        .catch(function (err) {
          alertService.addError(err);
        })
        .finally(function () {
          $scope.contactFormProcessing = false;
          alertService.loaded();
        });
      }
      else
      {
        $scope.licenceDateValid = false;
      }
      $scope.licenceNumberValid = true;
    }
    else
    {
      $scope.licenceNumberValid = false;
    }
  };

  $scope.startUpload = function () {
    if (me.driverLicense === null || me.driverLicense === undefined) {
      if (!images.front) {
        return;
      }
      $scope.isBusy = true;
      alertService.load();

      personService.addLicenseImages({
        person: me.id
      }, {
        frontImage: images.front
      })
      .then(function () {
        Analytics.trackEvent('person', 'driverlicense_uploaded', undefined, undefined, true);
        $scope.licenceUploaded = true;

        // reload user info (status may have changed as a result of uploading license)
        personService.me({
          version: 2
        })
        .then(function (person) {
          angular.extend(authService.user.identity, person);
          alertService.loaded();
          $scope.licenceUploaded = true;
          $scope.isBusy = false;
        })
        // silently fail
        .catch(function (err) {
          $log.debug('error', err);
          alertService.loaded();
          $scope.isBusy = false;
        })
        .finally(function () {
          alertService.loaded();
          $scope.isBusy = false;
          $state.go('owm.person.dashboard');
        });
      })
      .catch(function (err) {
        alertService.addError(err);
        $scope.containsLicence = false;
        alertService.loaded();
        $scope.isBusy = false;
      })
      .finally(function () {
        alertService.loaded();
        $scope.isBusy = false;
      });
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