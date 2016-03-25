var myApp = angular.module('CalorieCounter',['angular-meteor']);
 
  myApp.controller('formCtrl',['$scope',function($scope) {
    $scope.works = function() {
      alert("Its in the works function");
    }
  }]);