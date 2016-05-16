var calorieCounterApp = angular.module('CalorieCounter',['angular-meteor']);

calorieCounterApp.controller('formCtrl',['$scope',function($scope) {
	$scope.works = function() {
    	alert("Its in the works function");
    }
}]);
