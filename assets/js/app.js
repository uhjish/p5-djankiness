"use strict";

//just define every inline to make it easier to evaluate
//typically this would be broken out into separate js files
// -- my structure usually puts the controllers, services, and directives
// for a given concern within the app into one folder
// as opposed to separating by type (module, service, directive, etc).

var actionApp = angular.module('action', ['restangular', 'ngRoute', 'ui.bootstrap'])

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
  })

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


