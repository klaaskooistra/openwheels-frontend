'use strict';

angular.module('phoneNumberDirective', [])

.directive('phoneNumber', function () {
  return {
    restrict: 'A',
    replace: true,
    transclude: true,
    templateUrl: 'directives/phoneNumber/phoneNumber.tpl.html',
    controller: function functionName($scope, $log, personService, alertService, $mdDialog, $mdMedia) {

      $scope.verificationCodeAlreadySent = false;
      $scope.verificationCodeError = false;

      $scope.addOrVerifyNumber = function (id, number, confidential) {
        if(!id) {
          //add the phone number if it not exists already
          $scope.addPhoneNumber(number, confidential);
        } else {
          //default edit a phone number to save changes
          $scope.editPhoneNumber(id, number, confidential);
        }
      };

      $scope.addPhoneNumber = function (number, confidential) {
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
          alertService.loaded();
          alertService.addError(e);
        });
      };

      $scope.editPhoneNumber = function (id, number, confidential) {
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
          alertService.loaded();
          alertService.addError(e);
        });
      };

      $scope.updatePhoneNumbers = function (phoneNumber) {
        alertService.load();

        personService.get({
          id: $scope.person.id
        })
        .then(function(person){
          //update phone numbers in the scope
          $scope.person.phoneNumbers = person.phoneNumbers;

          //send the code for the first time
          if(phoneNumber && !$scope.verificationCodeAlreadySent) {
            $scope.sendVerificationCode(phoneNumber.id, phoneNumber.number, $scope.person);
          }
          //don't send the code again on opening the dialog
          else if (phoneNumber && $scope.verificationCodeAlreadySent) {
            $scope.verifyPhoneNumberDialog(phoneNumber.id, phoneNumber.number, $scope.person);
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
        alertService.load();

        //reset codeIsResend
        $scope.codeIsResend = false;

        //open the dialog if it is not a resend
        if(!resend) {
          $scope.verifyPhoneNumberDialog(id, number, person);
        }

        //send a new code
        personService.sendVerificationCode({
          phoneNumber: id
        })
        .then(function(phoneNumber) {
          $scope.verificationCodeAlreadySent = true;

          if(resend) {
            //show feedback in dialog
            $scope.codeIsResend = true;
          }
        })
        .catch(function(e) {
          alertService.loaded();
          if (e.message === 'Too many verification codes sent') {
            alertService.add(e.level, 'Je hebt het maximaal aantal verificatiecodes bereikt.', 5000);
          } else {
            alertService.addError(e);
          }
          //close the dialog if there is a problem with sending a code
          $mdDialog.hide();
        })
        .finally(function() {
          alertService.loaded();
        });
      };

      $scope.verifyPhoneNumberDialog = function (id, number, person) {
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
              alertService.load();

              personService.verifyPhoneNumber ({
                person: person.id,
                number: number,
                verificationCode: $scope.verificationCode
              })
              .then(function(phoneNumber) {
                $scope.hide();
                $scope.updatePhoneNumbers();
              })
              .catch(function(e) {
                //show error in dialog
                $scope.verificationCodeError = true;
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
