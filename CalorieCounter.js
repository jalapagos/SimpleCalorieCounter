Meals = new Mongo.Collection("meals-info");

var getDate = function() {
  var today = new Date();
  var mm = today.getMonth()+1;
  var dd = today.getDate();
  var yyyy = today.getFullYear();

  var months

  if (dd<10) {
    dd = '0'+dd;
  }

  if (mm<10) {
    mm = '0'+mm;
  }

  today = mm+'/'+dd+'/'+yyyy;
  return today;
}

if (Meteor.isClient) {
  var myApp = angular.module('CalorieCounter',['angular-meteor']);

  Meteor.subscribe('meals-info');

  myApp.controller('formCtrl',['$scope','$meteor',function($scope,$meteor) {

    $scope.meal = {
      description:null,
      items:[],
      total:null,
      date:null,
      createdBy:null
    };

    $scope.addItem = function() {
      $scope.meal.items.push({
        name:null,
        cal:null
      });
    }

    $scope.submit = function() {
      var currentUserId = Meteor.userId();

      if(currentUserId!=null) {
        if($scope.checkValidity()==false) {
          alert("Need to fill out valid calories and/or items!");
        }
        else {
          $scope.meal.createdBy = currentUserId;
          var total = $scope.getTotal();
          $scope.meal.total = total;
          var date = $scope.getDate();
          $scope.meal.date = date;
          Meteor.call("submit", angular.copy($scope.meal));
          $scope.clear();
        }
      }
      else {
        alert("You must sign in first!");
      }
    }

    $scope.getTotal = function() {
      var finalCount = 0;
      for (var temp = 0; temp < $scope.meal.items.length;temp++) {
        finalCount=$scope.meal.items[temp].cal+finalCount;
      }
      return finalCount;
    }

    $scope.clear = function() {
      $scope.meal = {
        description:null,
        items:[],
        total:null,
        date:null,
        createdBy:null
      };
    }

    $scope.checkValidity = function() {
      for(var temp = 0; temp < $scope.meal.items.length;temp++) {
        if (($scope.meal.items[temp].name==null && $scope.meal.items[temp].cal!=null) 
          || ($scope.meal.items[temp].name!=null && $scope.meal.items[temp].cal==null)
          || ($scope.meal.items[temp].name==null && $scope.meal.items[temp].cal==null)) {
          return false;
        }
      }
      return true;
    }
  }]);

 myApp.controller('resultCtrl',['$scope','$meteor',function($scope,$meteor) {
    $scope.allMeals = $meteor.collection(Meals);

    $scope.todayDate = getDate();
    
    
    $scope.clearData = function() {
      var temp = Meteor.userId();
      if (temp!=null) {
        Meteor.call("clearData");
      }
      else {
        alert("You must sign in!");
      }
    }

  }]);
}

if (Meteor.isServer) {
  
  Meteor.methods({
    
    submit:function(meal) {
      Meals.insert(meal);
    },

    clearData:function() {
      Meals.remove({});
    } 

  });

  Meteor.publish('meals-info', function() {
    var currentUserId = this.userId;
    var currentDate = Meteor.call("getDate");
    return Meals.find({createdBy: currentUserId, date: currentDate});
  });

}