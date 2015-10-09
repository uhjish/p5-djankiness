"use strict";
//just define every inline to make it easier to evaluate
//typically this would be broken out into separate js files
// -- my structure usually puts the controllers, services, and directives
// for a given concern within the app into one folder
// as opposed to separating by type (module, service, directive, etc).

var actionApp = angular.module('actionApp', ['restangular', 'ngRoute', 'ui.bootstrap']);

actionApp.config(function($routeProvider, RestangularProvider) {
  RestangularProvider.setBaseUrl('/api/');
  RestangularProvider.setRequestSuffix('/');
  RestangularProvider.setRequestInterceptor(function(elem, operation, what) {
    //it's a put, don't send an id, since it's defined by the REST endpoint
    if (operation === 'put') {
      elem.id = undefined;
      return elem;
    }
    
    return elem;
  });

  RestangularProvider.setResponseExtractor(function(response, operation, what, url) {
    // unwrap the list from the results field returned by the default
    // django viewset
    var newResponse;
    if (operation === "getList") {
      newResponse = response.results;
    } else {
      newResponse = response;
    }
    return newResponse;
  });

  $routeProvider.
    when('/', {
    controller:'ListCtrl', 
    templateUrl:'list.html'
  }).
    when('/edit/:actionId', {
    controller:'EditCtrl', 
    templateUrl:'detail.html',
    resolve: {
      axn: function(Restangular, $route){
        let actionId =$route.current.params.actionId;
        return Restangular.one('actions', actionId).get();
      },
    }
  }).
    when('/new', {controller:'CreateCtrl', templateUrl:'detail.html'}).
    otherwise({redirectTo:'/'});

});

actionApp.controller('ListCtrl', 
function($scope, Restangular) {
  $scope.actions = Restangular.all("actions").getList().$object;
  Restangular.all("users").getList().then(
    // this shared logic would typically go into a service
    function(ulist){
      $scope.usernames = {};
      for (var u in Restangular.stripRestangular(ulist)){
        $scope.usernames[u] = ulist[u].username;
      }
    });
});

actionApp.controller('CreateCtrl', 
function($scope, $location, Restangular) {
  Restangular.all("users").getList().then(
    function(ulist){
      $scope.usernames = {};
      for (var u in Restangular.stripRestangular(ulist)){
        $scope.usernames[ulist[u].id] = ulist[u].username;
      }
    });
  $scope.save = function() {
    Restangular.all('actions').post($scope.action).then(function(action) {
      $location.path('/list');
    });
  }
});

actionApp.controller('EditCtrl', 
function EditCtrl($scope, $location, Restangular, axn) {
  var original = axn;
  $scope.action = Restangular.copy(original);

  Restangular.all("users").getList().then(
    function(ulist){
      $scope.usernames = {};
      for (var u in Restangular.stripRestangular(ulist)){
        $scope.usernames[ulist[u].id] = ulist[u].username;
      }
    });
  $scope.isClean = function() {
    return angular.equals(original, $scope.action);
  }

  $scope.destroy = function() {
    original.remove().then(function() {
      $location.path('/list');
    });
  };

  $scope.save = function() {
    $scope.action.put().then(function() {
      $location.path('/');
    });
  };
});

actionApp.directive('ngActionTimeline', function() {
  return {
    restrict: 'AE',
    scope: {
      data: '=',     // Bind the ngModel
      onSelect: '=',    // Pass a reference to the method 
    },

    link: function(scope, iElement, iAttrs) {
      scope.data = new vis.DataSet([
        {id: 1, content: 'item 1', start: '2013-04-20'},
        {id: 2, content: 'item 2', start: '2013-04-14'},
        {id: 3, content: 'item 3', start: '2013-04-18'},
        {id: 4, content: 'item 4', start: '2013-04-16', end: '2013-04-19'},
        {id: 5, content: 'item 5', start: '2013-04-25'},
        {id: 6, content: 'item 6', start: '2013-04-27'}
      ]);

      var options = {
        editable: false
      };
      var timeline = null;
      scope.$watch('data', function () {
        if (scope.data == null) {
          return;
        }

        if (timeline != null) {
          timeline.destroy();
        }
        timeline = new vis.Timeline(iElement[0], scope.data, options);
        timeline.on('select', function (properties) {
          console.log('select', properties);
        });
      });

    },
  }
});
