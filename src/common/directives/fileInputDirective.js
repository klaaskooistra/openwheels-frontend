'use strict';

angular.module('fileInputDirective', [])

.directive('fileInput', function ($mdDialog, $mdMedia) {

  return {
    restrict: 'EA',
    template: '<button ng-click="openModal()">Upload foto</button>',
    replace: true,
    scope: {
      onChange: '=',
      reset: '@',
    },
    link: function (scope, elm, attrs) {

      scope.openModal = function() {
        $mdDialog.show({
          controller: 'fileUploaderController',
          templateUrl: 'directives/uploadDialog.tpl.html',
          parent: angular.element(document.body),
					fullscreen: $mdMedia('xs'),
          clickOutsideToClose:true,
        })
        .then(function(answer) {
          console.log(answer);
        })
        .catch(function(answer) {
          console.log(answer);
        });
      };

      if (angular.isFunction(scope.onChange)) {
        elm.on('change', onChange);

        scope.$on('$destroy', function () {
          elm.off('change', onChange);
        });
      }

      function onChange (e) {
        scope.$apply(function () {
          scope.onChange(e.target.files[0]);
          if(scope.reset && scope.reset === 'noreset') {
            return;
          }
          elm.val('');
        });
      }
    }
  };
})
.directive('fileInputChange', function () {

  return {
    restrict: 'EA',
    template: '<input type="file" />',
    replace: true,
    scope: {
      onChange: '=',
      reset: '@',
    },
    link: function (scope, elm, attrs) {

      if (angular.isFunction(scope.onChange)) {
        elm.on('change', onChange);

        scope.$on('$destroy', function () {
          elm.off('change', onChange);
        });
      }

      function onChange (e) {
        scope.$apply(function () {
          scope.onChange(e.target.files[0]);
          if(scope.reset && scope.reset === 'noreset') {
            return;
          }
          elm.val('');
        });
      }
    }
  };
})
.controller('fileUploaderController', function($mdDialog, $scope) {
  $scope.image = '';
  $scope.inputImage = '';

  $scope.newImage = function($event) {
    $scope.inputImage = $event;
		console.log('set inputImage');
  };

  $scope.return = function(returnValue) {
    $mdDialog.hide(returnValue);
  };

  $scope.cancel = function(reason) {
    $mdDialog.cancel(reason);
  };
})
;
