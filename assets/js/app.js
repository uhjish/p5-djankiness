"use strict";
//just define every inline to make it easier to evaluate
//typically this would be broken out into separate js files
// -- my structure usually puts the controllers, services, and directives
// for a given concern within the app into one folder
// as opposed to separating by type (module, service, directive, etc).

var actionApp = angular.module('actionApp', ['restangular', 'ngRoute', 'ui.bootstrap']);

actionApp.config(function($routeProvider, $httpProvider, RestangularProvider) {

  //csrf goodness
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

  //api base path and django-rest helping suffix
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
        var actionId =$route.current.params.actionId;
        return Restangular.one('actions', actionId).get();
      },
    }
  }).
    when('/new', {controller:'CreateCtrl', templateUrl:'detail.html'}).
    otherwise({redirectTo:'/'});

});

actionApp.controller('ListCtrl', 
function($scope, $location, Restangular) {
  $scope.jumpTo = function( aid ){
    $location.path('/edit/' + aid);
  }
  Restangular.all("actions").getList().then(
    function(alist){
      $scope.actions = alist;
    }
  );
  Restangular.all("users").getList().then(
    // this shared logic would typically go into a service
    function(ulist){
      $scope.usernames = {};
      for (var u in Restangular.stripRestangular(ulist)){
        $scope.usernames[ulist[u].id] = ulist[u].username;
      }
    });
});

actionApp.controller('CreateCtrl', 
function($scope, $location, Restangular) {
  var strToDate = function( dstr ){
    return moment(dstr).toDate();
  };
  $scope.toInt = function(val) {
    return parseInt(val,10); 
  };
  var today = moment(new Date()).format("YYYY-MM-DD");
  //setting up defaults leads to better sleep
  $scope.action = {creator: 1, assignee: 1, title: '', description: '', deadline: today, done: false};
  $scope.deadline_date = strToDate( $scope.action.deadline );
  Restangular.all("users").getList().then(
    function(ulist){
      $scope.usernames = {};
      for (var u in Restangular.stripRestangular(ulist)){
        $scope.usernames[ulist[u].id] = ulist[u].username;
      }
    });
  $scope.save = function() {
    //this gets overriden on the server
    //fetch the date from the picker bound model
    $scope.action.deadline = moment($scope.deadline_date).format('YYYY-MM-DD');;
    Restangular.all('actions').post($scope.action).then(function(action) {
      $location.path('/list');
    });
  }
});

actionApp.controller('EditCtrl', 
function($scope, $location, Restangular, axn) {
  var original = axn;
  $scope.toInt = function(val) {
    return parseInt(val,10); 
  };

  $scope.action = Restangular.copy(original);

  var strToDate = function( dstr ){
    return moment(dstr).toDate();
  };

  $scope.deadline_date = strToDate( $scope.action.deadline );
  Restangular.all("users").getList().then(
    function(ulist){
      $scope.usernames = {};
      for (var u in Restangular.stripRestangular(ulist)){
        $scope.usernames[ulist[u].id] = ulist[u].username;
      }
    });
  $scope.isClean = function() {
    return angular.equals(original, $scope.action) && $scope.deadline_date == strToDate(original.deadline);
  }

  $scope.destroy = function() {
    original.remove().then(function() {
      $location.path('/list');
    });
  };
  $scope.save = function() {
    $scope.action.deadline = moment($scope.deadline_date).format('YYYY-MM-DD');;
    $scope.action.put().then(function() {
      $location.path('/');
    });
  };
});

actionApp.directive('ngActionTimeline', function() {
  return {
    restrict: 'AE',
    scope: {
      tactions: '=',
      tusers: '=',
      onSelect: '&',
    },
    link: function(scope, iElement, iAttrs) {
      var groups = new vis.DataSet();
      var today = moment(new Date());
      var startDate = today.startOf('month').format('YYYY-MM-DD');
      var endDate = today.endOf('month').format('YYYY-MM-DD');
      var tdata = new vis.DataSet([{id: 'M', content: 'This Month', 
                        start: startDate, end: endDate, type: 'background'}]);
      var options = {
        editable: false,
        start: today.startOf('month').subtract(1,'month').format('YYYY-MM-DD'),
        end: today.endOf('month').add(2,'month').format('YYYY-MM-DD'),
      };
      var timeline = null;
      var statusToClass = function(status){
        if (status){
          return "done";
        }else{
          return "todo";
        }
      };
      scope.$watchGroup(['tusers','tactions'], function () {
        if (scope.tusers == null || scope.tactions == null) {
          return;
        }
        scope.tactions.forEach( function( d ){
          tdata.add( {  id: d.id, 
                        group: d.assignee,
                        content: d.title +
                          ' <span style="color:#7F00FF;">(' + scope.tusers[d.assignee] + ')</span>',
                        start: d.deadline,
                        className: statusToClass(d.done),
                        type: 'box' } );
        });
        for(var k in scope.tusers){
          //TODO: bring in lodash to avoid this sort of logic
          if (scope.tusers.hasOwnProperty(k)) {
            groups.add( {id: k, content: scope.tusers[k]} );
          }
        }

        if (timeline != null) {
          timeline.destroy();
        }
        timeline = new vis.Timeline(iElement[0]);
        timeline.setOptions(options);
        timeline.setGroups(groups);
        timeline.setItems(tdata);
        timeline.on('select', function (properties) {
          console.log('select', properties);
          //TODO: fix this.
          scope.onSelect( {aid: properties.items[0]} );
        });
      });

    },
  }
});

actionApp.filter('stringToDate', function () {
    return function (input) {
        if (!input)
            return null;

        var date = moment(input);
        return date.isValid() ? date.toDate() : null;
    };
});
