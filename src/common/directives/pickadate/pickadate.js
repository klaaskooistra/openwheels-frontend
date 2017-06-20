'use strict';

angular.module('pickadate', [])

.constant('pickadateConfig', {})
.constant('pickatimeConfig', {})

.directive('pickadate', function (pickadateConfig, $compile, API_DATE_FORMAT) {
  return {
    restrict: 'EA',
    require: '?ngModel',
    scope: true,
    template: '',
    link: function($scope, $element, attrs, ngModel) {

      if (!ngModel) {
        return;
      } else {
        init();
      }

      function init() {
        replaceElement();
        registerWatch();

        $scope.placeholder = attrs.placeholder;
        $scope.disabled = $scope.$eval(attrs.ngDisabled);
        $scope.change = internalValueChanged;
      }

      function registerWatch() {
        $scope.$watch(function() {
          return ngModel.$modelValue;
        }, externalValueChanged);
      }

      function replaceElement() {
        var addMe = angular.element('<div><md-input-container><md-datepicker ng-disabled="disabled" ng-change="change()" ng-model="date" md-placeholder="{{placeholder}}" md-open-on-focus ></md-datepicker></md-input-container></div>');
        $element.replaceWith($compile(addMe)($scope));
      }

      function externalValueChanged(newValue) {
        if(!newValue) {
          return;
        }
        $scope.date = moment(newValue, API_DATE_FORMAT).toDate();
      }

      function internalValueChanged() {
        var mDate, mCurDate;

        mDate = moment($scope.date);
        mCurDate = moment(ngModel.$modelValue);

        if(!ngModel.$modelValue) {
          mCurDate = moment(mDate);
        }

        mCurDate.date(mDate.date());
        mCurDate.month(mDate.month());
        mCurDate.year(mDate.year());
        var newDate = mCurDate.format(API_DATE_FORMAT);
        ngModel.$setViewValue(newDate);
      }
    }
  };

})

.directive('pickatime', function (pickatimeConfig, $compile, API_DATE_FORMAT) {
  var options = {};
  angular.extend(options, pickatimeConfig);

  return {
    restrict: 'EA',
    scope: true,
    require: '?ngModel',
    link: function($scope, $element, attrs, ngModel) {

      if (!ngModel) {
        return;
      } else {
        init();
      }


      function init() {
        replaceElement();
        registerWatch();

        $scope.times = buildTimeArray();
        $scope.placeholder = attrs.placeholder;
        $scope.change = internalValueChanged;
      }

      function buildTimeArray() {
        var times = [];
        var hour, minute;
        for(hour = 0; hour < 24; hour++) {
          for(minute = 0; minute < 60; minute = minute + 15) {
            var hourPrefixed = prefix(hour);
            var minutePrefixed = prefix(minute);
            var val = hourPrefixed+':'+minutePrefixed;
            times.push({value:  val, show: val});
          }
        }
        return times;
      }

      function prefix(value) {
        value = ''+value;
        if(value.length === 1) {
          return '0'+value;
        }
        return value;
      }

      function replaceElement() {
        var addMe = angular.element('<div><md-input-container><md-select ng-change="change()"placeholder={{placeholder}} ng-model="time"> <md-option ng-repeat="singleTime in times" ng-value="singleTime.value"> {{singleTime.show}} </md-option> </md-select> </md-input-container></div>');
        $element.replaceWith($compile(addMe)($scope));
      }

      function registerWatch() {
        $scope.$watch(function() {
          return ngModel.$modelValue;
        }, externalValueChanged);
      }

      function externalValueChanged(newValue) {
        if(!newValue) {
          return;
        }

        var newDate = moment(newValue, API_DATE_FORMAT);
        var minutes = newDate.minute();
        var hours = newDate.hours();

        minutes = 15 * Math.round(minutes / 15);
        var val = prefix(hours)+':'+prefix(minutes);

        $scope.time = val;
      }

      function internalValueChanged() {
        var mDate, mCurDate;

        mDate = moment($scope.time, 'HH:mm');
        mCurDate = moment(ngModel.$modelValue);

        if(!ngModel.$modelValue) {
          mCurDate = moment(mDate);
        }

        mCurDate.minute(mDate.minute());
        mCurDate.hour(mDate.hour());
        var newDate = mCurDate.format(API_DATE_FORMAT);
        ngModel.$setViewValue(newDate);
      }

    }
  };

})
;

