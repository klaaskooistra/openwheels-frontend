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
    }

  };
})

.directive('fileInputChange', function () {

  return {
    restrict: 'EA',
    template: '<span><input id="{{id}}" type="file" class="inputfile" /><label for="{{id}}"><md-icon class="text-white">file_upload</md-icon> Selecteer een foto</label></span>',
    replace: true,
    scope: {
      onChange: '=',
      fileProps: '=',
      reset: '@',
    },
    link: function (scope, elm, attrs) {

      scope.id = 'file123';

      function clearFileProps() {
        scope.uploaded = {
          sizeOk: undefined,
          height: undefined,
          width: undefined,
          isImage: undefined,
          hasUploaded: false,
        };
      }
      clearFileProps();

      if (angular.isFunction(scope.onChange)) {
        elm.on('change', onChange);

        scope.$on('$destroy', function () {
          elm.off('change', onChange);
        });
      }


      function onChange (e) {
        scope.uploaded.hasUploaded = true;

				window.URL = window.URL || window.webkitURL;
        var img = new Image();
        img.src = window.URL.createObjectURL( e.target.files[0] );

        img.onload = function() {
          var width = img.naturalWidth;
          var height = img.naturalHeight;
          window.URL.revokeObjectURL( img.src );

          scope.uploaded.isImage = true;
          scope.uploaded.width = width;
          scope.uploaded.height = height;
          scope.uploaded.sizeOk = width >= 800 && height >= 600;
          updateScope();
        };

        img.onerror = function() {
          scope.uploaded.isImage = false;
          updateScope();
        };

        function updateScope() {
          scope.$apply(function () {
            if(scope.uploaded.isImage && scope.uploaded.sizeOk) {
              scope.onChange(e.target.files[0]);
            }
            scope.fileProps = scope.uploaded;

            if(scope.reset && scope.reset === 'noreset') {
              return;
            }
            elm.val('');
          });
        }

      }
    }
  };
})

.controller('fileUploaderController', function($mdDialog, $scope) {
  $scope.image = '';
  $scope.inputImage = '';

  $scope.aspectratio = 1.51;
  $scope.resultImageSize = {w: 1000, h: 660};
  $scope.rotated = false;

  $scope.newImage = function($event) {
    var src = URL.createObjectURL($event);
    $scope.inputImage = $event;
  };

  $scope.rotate = function(rotated) {

    if(rotated !== undefined) {
      $scope.rotated = rotated;
    } else {
      $scope.rotated = !$scope.rotated;
    }
    var aspectratio = 1.5151;

    if($scope.rotated) {
      $scope.aspectratio = 1 / aspectratio;
      $scope.resultImageSize = {w: 660, h: 1000};
    } else {
      $scope.aspectratio = aspectratio;
      $scope.resultImageSize = {w: 1000, h: 660};
    }

  };

  $scope.clear = function() {
    $scope.image = '';
    $scope.inputImage = '';
    $scope.crapject = {};
    $scope.showEditor = false;
    $scope.fileProps = {};
    $scope.rotate(false);
  };

  $scope.return = function(returnValue) {
    $mdDialog.hide(returnValue);
  };

  $scope.cancel = function(reason) {
    $mdDialog.cancel(reason);
  };

  $scope.doneEditing = function() {
    $scope.showEditor = false;
    if($scope.rotated) {
      $scope.image = rotateBase64Image90deg($scope.image);
    }
  };

  $scope.rotate180 = function() {
  };

  function rotateBase64Image90deg(base64Image, isClockwise) {
    // create an off-screen canvas
    var offScreenCanvas = document.createElement('canvas');
    var offScreenCanvasCtx = offScreenCanvas.getContext('2d');

    // cteate Image
    var img = new Image();
    img.src = base64Image;

    // set its dimension to rotated size
    offScreenCanvas.height = img.width;
    offScreenCanvas.width = img.height;

    // rotate and draw source image into the off-screen canvas:
    if (isClockwise) {
      offScreenCanvasCtx.rotate(90 * Math.PI / 180);
      offScreenCanvasCtx.translate(0, -offScreenCanvas.width);
    } else {
      offScreenCanvasCtx.rotate(-90 * Math.PI / 180);
      offScreenCanvasCtx.translate(-offScreenCanvas.height, 0);
    }
    offScreenCanvasCtx.drawImage(img, 0, 0);

    // encode image to data-uri with base64
    return offScreenCanvas.toDataURL('image/png', 100);
  }

})
;
