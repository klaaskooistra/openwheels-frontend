'use strict';

angular.module('phoneNumberDirective', [])

.directive('phoneNumber', function () {
  return {
    restrict: 'A',
    replace: true,
    transclude: true,
    templateUrl: 'directives/phoneNumber/phoneNumber.tpl.html',
    controller: function functionName($scope, $log, personService, alertService, $mdDialog, $mdMedia) {

      $scope.addOrVerifyNumber = function (id, number, confidential) {
        if(!id) {
          $scope.addPhoneNumber(number, confidential);
        } else {
          //default edit a phone number
          $scope.editPhoneNumber(id, number, confidential);
        }
      };

      $scope.addPhoneNumber = function (number, confidential) {
        alertService.closeAll();
        alertService.load();

        personService.addPhoneNumber({
          person: $scope.person.id,
          number: number,
          type: 'mobile',
          confidential: confidential
        })
        .then(function(phoneNumber) {
          $scope.updatePhoneNumbers(phoneNumber);
        })
        .catch(function(e) {
          alertService.addError(e);
        })
        .finally(function() {
          alertService.loaded();
        });
      };

      $scope.editPhoneNumber = function (id, number, confidential) {
        alertService.closeAll();
        alertService.load();

        personService.alterPhoneWithPhoneId({
          phoneNumber: id,
          newProps: {
            number: number,
            confidential: confidential
          }
        })
        .then(function(phoneNumber) {
          $scope.updatePhoneNumbers(phoneNumber);
        })
        .catch(function(e) {
          alertService.addError(e);
        })
        .finally(function() {
          alertService.loaded();
        });
      };

      $scope.updatePhoneNumbers = function (phoneNumber) {
        alertService.closeAll();
        alertService.load();

        personService.get({
          id: $scope.person.id
        })
        .then(function(person){
          $scope.person.phoneNumbers = person.phoneNumbers;
          if(phoneNumber) {
            $scope.sendVerificationCode(phoneNumber.id, phoneNumber.number, $scope.person);
          }
        })
        .catch(function(e) {
          alertService.addError(e);
        })
        .finally(function() {
          alertService.loaded();
        });
      };

      $scope.sendVerificationCode = function (id, number, person, resend) {
        alertService.closeAll();
        alertService.load();

        //reset codeIsResend
        $scope.codeIsResend = false;

        personService.sendVerificationCode({
          phoneNumber: id
        })
        .then(function(phoneNumber) {
          if(resend) {
            //show feedback in template
            $scope.codeIsResend = true;
          } else {
            //open the dialog
            $scope.verifyPhoneNumberDialog(id, number, person);
          }
        })
        .catch(function(e) {
          alertService.addError(e);
        })
        .finally(function() {
          alertService.loaded();
        });
      };

      $scope.verifyPhoneNumberDialog = function (id, number, person) {
        alertService.closeAll();

        $mdDialog.show({
          fullscreen: $mdMedia('xs'),
          preserveScope: true,
          locals: {
            id: id,
            number: number,
            person: person
          },
          scope: $scope,
          templateUrl: 'directives/phoneNumber/phoneNumberDialog.tpl.html',
          controller: ['$scope', '$mdDialog', '$mdMedia', 'id', 'number', 'person', function ($scope, $mdDialog, $mdMedia, id, number, person) {
            $scope.id = id;
            $scope.number = number;
            $scope.person = person;
            $scope.verificationCode = '';

            $scope.verifyPhoneNumber = function (id, number, person) {
              alertService.closeAll();
              alertService.load();

              personService.verifyPhoneNumber ({
                person: person.id,
                number: number,
                verificationCode: $scope.verificationCode
              })
              .then(function(phoneNumber) {
                $scope.updatePhoneNumbers();
              })
              .catch(function(e) {
                alertService.addError(e);
              })
              .finally(function() {
                $scope.hide();
                alertService.loaded();
              });
            };

            $scope.hide = function () {
              $mdDialog.hide();
            };

            $scope.cancel = function () {
              $mdDialog.cancel();
            };
          }]
        });
      };

      $scope.removePhone = function(phone, index) {
        if (!phone.id) {
          $scope.person.phoneNumbers.splice(index, 1);
          return;
        }

        alertService.closeAll();
        alertService.load();

        personService.dropPhoneWithPhoneId({
          id: phone.id
        })
        .then(function () {
          $scope.person.phoneNumbers.splice(index, 1);
        })
        .catch(function (err) {
          alertService.addError(err);
        })
        .finally(function () {
          alertService.loaded();
        });
      };

      $scope.addPhone = function () {
        $scope.person.phoneNumbers.push({
          number: '',
          type: 'mobile'
        });
      };

    }
  };
});
