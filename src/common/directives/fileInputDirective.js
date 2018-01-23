'use strict';

angular.module('fileInputDirective', [])

.directive('fileInput', function ($mdDialog, $mdMedia) {

  return {
    restrict: 'EA',
    template: '<button ng-click="openModal()">Selecteer een foto</button>',
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
          clickOutsideToClose:true
        })
        .then(function(blob) {
          scope.onChange(blob);
        })
        .catch(function(err) {
        });
      };
    }

  };
})

.directive('fileInputChange', function () {

  return {
    restrict: 'EA',
    template: '<span><input id="{{id}}" type="file" class="inputfile" /><label for="{{id}}" ng-show="!fileProps.sizeOk && !uploaded.sizeOk"><md-icon class="text-white">file_upload</md-icon> Selecteer een foto</label><span ng-show="uploaded.hasUploaded && uploaded.isImage && fileProps.sizeOk"><i class="fa fa-spin fa-2x fa-fw fa-spinner"></i></span></span>',
    replace: true,
    scope: {
      onChange: '=',
      fileProps: '=',
      reset: '@',
    },
    link: function (scope, elm, attrs) {

      function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
      }
      
      scope.id = 'file_input_'+getRandomInt(11111,99999);
      chooseFile();

      function clearFileProps() {
        scope.uploaded = {
          sizeOk: true,
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

      function chooseFile() {
        setTimeout(function () {
          var element = angular.element(document.getElementById(scope.id));
          element.trigger('click');
          scope.clicked = true;
        }, 0);
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

  $scope.aspectratio = 1.5151;
  $scope.resultImageSize  = {w: 1000, h: 660};

  $scope.newImage = function($event) {
    var src = URL.createObjectURL($event);
    $scope.inputImage = $event;
  };

  $scope.clear = function() {
    $scope.image = '';
    $scope.inputImage = '';
    $scope.crapject = {};
    $scope.showEditor = false;
    $scope.fileProps = {};
  };

  $scope.return = function() {
    var blob = dataURItoBlob($scope.image);
    $mdDialog.hide(blob);
  };

  $scope.cancel = function(reason) {
    $mdDialog.cancel(reason);
  };

  $scope.doneEditing = function() {
    $scope.showEditor = false;
  };

  function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    var blob = new Blob([ab], {type: mimeString});
    return blob;
  }

})
;
