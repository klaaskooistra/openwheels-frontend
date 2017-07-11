'use strict';

angular.module('owm.resource.edit.price', [])

  .controller('ResourceEditPriceController', function ($filter, $scope, alertService, resourceService) {

// Require $scope.resource
    var master = $scope.resource;

// Work on a copy
    $scope.resource = angular.copy(master);

    $scope.save = function () {
      alertService.load();
      var newProps = $filter('returnDirtyItems')(angular.copy($scope.resource), $scope.form);

      resourceService.alter({
        id: $scope.resource.id,
        newProps: newProps
      })
        .then(function (resource) {
          alertService.addSaveSuccess();

          // Update master
          angular.forEach(newProps, function (value, key) {
            master[key] = resource[key];
          });

          // Update working copy
          reset();
        })
        .catch(function (err) {
          alertService.addError(err);
        })
        .finally(function () {
          alertService.loaded();
        });

    };

    $scope.reset = reset;

    $scope.checkInput = function (e) {
      var dayRateTotal = $scope.resource.dayRateTotal,
        hourRate = $scope.resource.hourRate,
        kilometerRate = $scope.resource.kilometerRate,
        providerId = $scope.me.provider.id;

      if(e === 'dayRateTotal' && !$scope.resource.kilometerRate.$touched) {
        return dayRateTotal < 15 && providerId === 1;
      }
      else if(e === 'hourRate' && !$scope.resource.kilometerRate.$touched) {
        return hourRate < 1.5 && providerId === 1;
      }
      else if(e === 'kilometerRate' && !$scope.resource.kilometerRate.$touched) {
        return kilometerRate < 0.05 && providerId === 1;
      }
      else {
        return kilometerRate < 0.05 || hourRate < 1.5 || dayRateTotal < 15 && providerId === 1;
      }
    };

    function reset() {
      $scope.resource = angular.copy(master);
      $scope.form.$setPristine();
    }

  });
