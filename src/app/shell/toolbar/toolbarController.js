'use strict';

angular.module('owm.shell')

.controller('ToolbarController', function ($scope, $state, $rootScope) {

	//if visitor is on the signup page, don't show the buttons in the toolbar because of distraction reasons
	$scope.onSignUpPage = $rootScope.$state.current.name === 'owm.auth.signup' ? true : false;
	$rootScope.$on('$stateChangeSuccess', function (event, toState) {
		$scope.onSignUpPage = toState.name === 'owm.auth.signup' ? true : false;
	});

});
