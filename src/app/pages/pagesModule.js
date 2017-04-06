'use strict';

angular.module('owm.pages', [
  'owm.pages.list-your-car',
  'owm.pages.member',
  'owm.pages.emailPreference',
  'owm.pages.rentavan',
])

.config(function ($stateProvider) {

  $stateProvider

    .state('home', {
    url: '/',
    parent: 'owm',
    views: {
      'main-full@shell': {
        templateUrl: 'home/home.tpl.html',
        controller: 'HomeController'
      }
    },
    data: {
      access: {
        deny: {
          authenticated: true
        }
      }
    }
  })

  .state('owm.pages', {
    resolve: {
      user: ['authService', function (authService) {
        return authService.userPromise();
      }]
    }
  })

  .state('list-your-car', {
    parent: 'owm.pages',
    url: '/auto-verhuren',
    views: {
      'main-full@shell': {
        templateUrl: 'pages/list-your-car/list-your-car.tpl.html',
        controller: 'listYourCarController'
      }
    },
    data: {
      title: 'META_LISTYOURCAR_TITLE',
      description: 'META_LISTYOURCAR_DESCRIPTION',
      access: {
        feature: 'verhuurTussenscherm'
      }
    }
  })

  .state('member', {
    parent: 'owm.pages',
    url: '/lid/:personId',
    views: {
      'main-full@shell': {
        templateUrl: 'pages/member/member.tpl.html',
        controller: 'MemberController'
      }
    },
    resolve: {
      member: ['$stateParams', 'personService', function ($stateParams, personService) {
        return personService.get({
          version: 2,
          person: $stateParams.personId
        });
      }]
    }
  })

  .state('rentavan', {
    parent: 'owm.pages',
    url: '/bus-huren',
    views: {
      'main-full@shell': {
        templateUrl: 'pages/landing/rentavan.tpl.html',
        controller: 'LandingController'
      }
    },
    data: {
      title: 'META_RENTAVAN_TITLE',
      description: 'META_RENTAVAN_DESCRIPTION',
    }
  })

  .state('emailPreference', {
    parent: 'owm.pages',
    url: '/email-uitschrijven?person&hash',
    views: {
      'main@shell': {
        templateUrl: 'pages/email-preference/email-preference.tpl.html',
        controller: 'EmailPreferenceController'
      }
    }
  });
});
