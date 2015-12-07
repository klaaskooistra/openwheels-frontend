'use strict';

angular.module('owm.navigation', [])

.controller('NavigationController', function ($window, $log, $state, $rootScope, $scope, alertService, authService, featuresService, contractService) {

  $scope.user = authService.user;
  
  $scope.$watch('!user.isPending && user.isAuthenticated', function (value) {
    if(value) {
      var options = $window.LHCChatOptions = $window.LHCChatOptions || {};
      options.attr = [{
        name: 'userid',
        value: authService.user.identity.id,
        type: 'hidden',
        size: 12,
      }];
      options.attr_prefill = [{
        name: 'email',
        value: '',
        hidden: true
      }, {
        name: 'username',
        value: authService.user.identity.firstName,
        hidden: true
      }];
    } else {
      
    }
  });
  /**
   * HACK
   * Determine whether to show the vouchers menu item by checking the user's contracts
   */
  $rootScope.vouchersEnabled = false;
  if (featuresService.get('invoiceModuleV3')) {
    authService.userPromise().then(function (user) {
      if (!user.identity) { return; }

      contractService.forDriver({ person: user.identity.id }).then(function (contracts) {
        if (!contracts.length) { return; }

        contracts.some(function (contract) {
          if (contract.type.id === 60) {
            $rootScope.vouchersEnabled = true;
            return true;
          }
        });
        $log.debug('Vouchers enabled? ' + $rootScope.vouchersEnabled);
      });
    });
  }

  $scope.login  = function () {
    authService.loginPopup().then(function () {
      $log.debug('Successfully logged in');
      if ($state.current.name === 'home') {
        $state.go('owm.person.dashboard');
      }
    });
  };

  $scope.logout = function () {
    alertService.load();
    authService.logoutRedirect();
  };

})
;
