'use strict';

angular.module('owm.person.details', [])

  .controller('DetailsProfileController', function ($scope, $filter, $timeout, $translate, $window, $log, $state, $stateParams, $mdDialog, discountService, contractService, account2Service, person, alertService, personService, authService, me, dutchZipcodeService, voucherService, $q, appConfig, paymentService, bookingService, invoice2Service, API_DATE_FORMAT, $anchorScroll, Analytics) {
    $scope.isBusy = false;
    $scope.me = me;

    //person info
    var masterPerson = null;
    $scope.loadLicenseState = true;
    $scope.pageNumber = JSON.parse($stateParams.pageNumber);
    $scope.showFirst = $scope.pageNumber === 1 ? true : false;
    $scope.showSecond = $scope.pageNumber === 2 ? true : false;
    $scope.showThird = $scope.pageNumber === 3 ? true : false;
    $scope.person = null;

    $scope.checkedLater = false;
    $scope.allowLicenseRelated = false;
    $scope.alerts = null;
    $scope.accountApproved = false;
    $scope.isBlocked = person.status === 'blocked' ? true : false;

    var resourceId = $stateParams.resourceId,
      bookingId = $stateParams.bookingId,
      city = $stateParams.city,
      discountCode = $stateParams.discountCode,
      remarkRequester = $stateParams.remarkRequester,
      riskReduction = $stateParams.riskReduction,
      timeFrame = {
        startDate: moment($stateParams.startDate).format(API_DATE_FORMAT),
        endDate: moment($stateParams.endDate).format(API_DATE_FORMAT)
      };


    $scope.dateConfig = {
      //model
      modelFormat: 'YYYY-MM-DD',
      formatSubmit: 'yyyy-mm-dd',

      //view
      viewFormat: 'DD-MM-YYYY',
      format: 'dd-mm-yyyy',

      //options
      selectMonths: true,
      selectYears: '100',
      max: true
    };


    //booking section
    var URL_DATE_TIME_FORMAT = 'YYMMDDHHmm';
    var cachedBookings = {};
    $scope.priceCalculated = true;
    $scope.bookingFound = false;
    $scope.booking = {};
    $scope.requiredValue = null;
    $scope.isAvailable = true;
    $scope.errorCreateBooking = false;
    $scope.errorRentalCheck = false;
    $scope.errorRentalCheckMessage = null;
    $scope.isbooking = $stateParams.resourceId !== undefined ? true : false;
    $scope.bookingStart = moment($stateParams.startDate).format(URL_DATE_TIME_FORMAT);
    $scope.bookingEnd = moment($stateParams.endDate).format(URL_DATE_TIME_FORMAT);
    $scope.licenseNumberValid = true;
    $scope.licenseNumberRepeatValid = true;
    $scope.licenseNumberMatch = true;
    $scope.licenseDateValid = true;
    $scope.validLicenseMin = moment().format('YYYY');
    $scope.validLicenseMax = moment().add('years', 30).format('YYYY');
    $scope.onlyNumbers = /^\d+$/;

    //reload
    initLicensePage();

    function initLicensePage() {
      if($scope.showSecond) {
        return authService.me(!!'forceReload')
        .then(function (me) {
          initPerson(me);
          $scope.licenseUploaded = me.status === 'book-only' || me.status === 'active' ? true : false;
          $scope.loadLicenseState = false;
        })
        .catch(function (err) {
          $scope.loadLicenseState = false;
        })
        .finally(function () {
          $scope.loadLicenseState = false;
        });
      }
    }

    // toggle the sections
    $scope.nextSection = function () {
      if ($scope.pageNumber < 3) {
        $scope.pageNumber++;
        goToNextState($scope.pageNumber);
        $anchorScroll('scroll-to-top-anchor');
      }
      // setHeight($scope.pageNumber);
    };
    $scope.prevSection = function (elementNumber, elementNumberTwo) {
      if ($scope.pageNumber > 1) {
        var number = JSON.parse(elementNumber);
        var numberTwo = JSON.parse(elementNumberTwo);

        initLicensePage();

        angular.element('.details--card__section')[number].classList.add('prevSection');
        angular.element('.details--card__section')[numberTwo].classList.add('prevSection');
        $timeout(function () {
          angular.element('.details--card__section')[number].classList.remove('prevSection');
          angular.element('.details--card__section')[numberTwo].classList.remove('prevSection');
        }, 2000);
        $scope.pageNumber--;
        goToNextState($scope.pageNumber);
        $anchorScroll('scroll-to-top-anchor');
      }
    };

    function goToNextState(stateNumber, bookingId) {
      $state.transitionTo('owm.person.details', { // should register
        pageNumber: stateNumber,
        city: $stateParams.city,
        resourceId: $stateParams.resourceId,
        bookingId: bookingId || $stateParams.bookingId,
        startDate: $stateParams.startDate,
        endDate: $stateParams.endDate,
        discountCode: $stateParams.discountCode,
        remarkRequester: $stateParams.remarkRequester,
        riskReduction: $stateParams.riskReduction
      });
    }
    // toggle the sections

    var unbindWatch = $scope.$watch('detailNumber', function (val) {
      $scope.showFirst = $scope.pageNumber === 1 ? true : false;
      $scope.showSecond = $scope.pageNumber === 2 ? true : false;
      $scope.showThird = $scope.pageNumber === 3 ? true : false;
    });

    initPerson(person);

    function initPerson(person) {
      masterPerson = person;
      $scope.person = angular.copy(person);

      // certain fields may only be edited if driver license is not yet checked by the office (see template)
      $scope.allowLicenseRelated = (person.driverLicenseStatus !== 'ok');

      // Gender dropdown is bound to $scope.genderText instead of person.male
      // Binding to person.male doesn't work, because ng-options doesn't differentiate between false and null
      $scope.genderText = (person.male === true ? 'male' : (person.male === false ? 'female' : ''));
      $scope.date = {
        day: Number(moment($scope.person.dateOfBirth).format('DD')),
        month: Number(moment($scope.person.dateOfBirth).format('MM')),
        year: Number(moment($scope.person.dateOfBirth).format('YYYY'))
      };

      $scope.licenseDate = {
        day: Number(moment($scope.person.drivingLicenseValidUntil).format('DD')),
        month: Number(moment($scope.person.drivingLicenseValidUntil).format('MM')),
        year: Number(moment($scope.person.drivingLicenseValidUntil).format('YYYY'))
      };

      $scope.driverLicenseNumber = $scope.person.driverLicenseNumber;

      if($scope.showThird) {
        account2Service.forMe({
          'onlyApproved': true
        }).then(function (value) {
          if (value.length > 0) {
            $scope.accountApproved = true;
          }

        });
      }

      initAlerts();
    }

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

    function initAlerts() {
      var p = $scope.person;
      var alerts = {
        contactData: (!p.streetName || !p.streetNumber || !p.city || (!p.phoneNumbers || !p.phoneNumbers.length)),
        licenseData: (p.status === 'new')
      };
      alertService.loaded($scope);
      $scope.alerts = alerts;
    }

    $scope.submitDriverLicense = function () {
      if($scope.driverLicenseNumber !== undefined && $scope.driverLicenseNumber.length === 10 && ['3', '4', '5'].indexOf($scope.driverLicenseNumber.charAt(0)) >= 0)
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
                $scope.licenseUploaded = true;
                $scope.nextSection();
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

    //the button on the upload linece page
    $scope.skipFlow = function () {
      personService.emailBookingLink({
        person: me.id,
        url: $state.href('owm.person.details', {
          pageNumber: $scope.pageNumber,
          city: $stateParams.city,
          resourceId: $stateParams.resourceId,
          bookingId: $stateParams.bookingId,
          startDate: $stateParams.startDate,
          endDate: $stateParams.endDate,
          discountCode: $stateParams.discountCode,
          remarkRequester: $stateParams.remarkRequester,
          riskReduction: $stateParams.riskReduction
        }, {
          absolute: true
        })
      });
      $scope.checkedLater = true;
    };
    //booking

    $scope.createBookingFlow = function () {
      alertService.load();
      $scope.isBusy = true;
      if ($scope.isbooking) { //check if the recoure id is in the url
        if (bookingId) { //check if there is a bookingId in the url
          var _booking;
          bookingService.get({
            booking: bookingId
          }).then(function (booking) {
            $scope.isAvailable = true;
            alertService.loaded();
            $scope.booking = booking;
            $scope.bookingFound = true;
            $scope.isBusy = false;
          });
        } else { //if there is no booking Id in the url
          if (discountCode !== undefined) { //check if there is a discount code
            //set the discount
            return verifyDiscountCode().then(function (value) {
              if (value === true) {
                return createBooking().then(function (value) {
                  return addDiscount(value).then(function (value) {
                    // final
                    alertService.loaded();
                    $scope.isBusy = false;
                    $scope.nextSection();
                  });
                });
              } else {
                showDialog('De kortingscode die je hebt ingevuld, is helaas niet van toepassing op deze rit. Wil je de boeking alsnog maken?');
              }
            });
          } else {
            return createBooking().then(function (value) {});
          }
        }
      } else {
        $scope.isBusy = false;
        alertService.loaded();
      }
    };

    function isValid(value) {
      return !value;
    }

    function createBooking() {
      return bookingService.create({ //creat a booking
        resource: resourceId,
        timeFrame: timeFrame,
        person: me.id,
        remark: remarkRequester
      }).then(function (value) { //go to an other state
        goToNextState(3, value.id); //set the booking id in the url
        $scope.isAvailable = true; //set isAvailable to true to render the table
        return value;
      }).catch(function (err) {
        $log.debug(err.message);
        if (err.message === 'De auto is niet beschikbaar') {
          $scope.isAvailable = false; //set isAvailable to false to show the trip is not Available page
        }
        else if(err.message === 'Deze boeking kan niet gemaakt worden, je account is gedeactiveerd.') {
          $scope.isBlocked = true;
        }
        else if (err.message === 'Er is een fout opgetreden') {
          $scope.errorCreateBooking = true;
        }
        else if (err.message.indexOf('Voor je kunt reserveren, hebben we jouw') >= 0) {
          $scope.errorCreateBooking = true;
          $scope.errorRentalCheckMessage = err.message;
          $scope.errorRentalCheck = true;
        }
        else if (err.message) {
          $scope.errorCreateBooking = true;
          $scope.errorMessage = err.message;
        }
        alertService.loaded();
        $scope.isBusy = false;
        $scope.nextSection();
      });
    }

    function addDiscount(value) {
      return discountService.apply({ //apply the discount code
        booking: value.id,
        discount: discountCode
      }).catch(function (err) {
        $scope.isBusy = false;
        alertService.addError(err); //if there is something wrong show a err
      });
    }

    //check if the discount is applicable
    function verifyDiscountCode() {
      if (!$stateParams.discountCode) {
        return;
      }
      return contractService.forDriver({
        person: person.id
      }).then(function getFirstContract(contracts) {
        if (contracts && contracts.length) {

          return contracts[0];
        } else {
          return false;
        }
      }).then(function (contract) {
        return discountService.isApplicable({
          resource: resourceId,
          person: me.id,
          contract: contract.id,
          discount: discountCode,
          timeFrame: timeFrame
        })
          .then(function (result) {
            if (result && result.applicable) {
              $log.debug('discount code is applicable');
              return true; // resolve
            } else {
              $log.debug('discount code not applicable');
              return false;
            }
          }).catch(function (err) {
            return false;
          });
      });
    }

    function showDialog(content) { //show a dialog
      var confirm = $mdDialog.confirm()
        .title('kortingscode')
        .textContent(content)
        .ok('Ja')
        .cancel('Nee');

      $mdDialog.show(confirm).then(function () {
        return createBooking().then(function (value) {
          // final
          alertService.loaded();
          $scope.isBusy = false;
          $scope.nextSection();
        });
      }, function () {
        $state.go('owm.resource.show', {
          resourceId: resourceId,
          city: city
        });
        return false;
      });
    }

    if (JSON.parse($stateParams.pageNumber) === 3) {
      $scope.createBookingFlow();
    }

    // to buy the vouchure
    $scope.buyVoucher = function() {
      alertService.load($scope);
      voucherService.calculateRequiredCreditForBooking({booking: $scope.booking.id})
        .then(function(results) {
          return voucherService.createVoucher({
            person: $scope.me.id,
            value: results.booking_price.total + results.km_price,
          });
        })
        .then(function (voucher) {
          return paymentService.payVoucher({
            voucher: voucher.id
          });
        })
        .then(function (data) {
          if (!data.url) {
            throw new Error('Er is een fout opgetreden');
          }
          /* redirect to payment url */
          redirect(data.url);
        })
        .catch(function (err) {
          alertService.addError(err);
        })
        .finally(function () {
          alertService.loaded($scope);
        });
    };
    //redireceht to the pay service
    function redirect(url) {
      var redirectTo = appConfig.appUrl + $state.href('owm.finance.payment-result');
      $window.location.href = url + '?redirectTo=' + encodeURIComponent(redirectTo);
    }

  });
