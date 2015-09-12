Meals = new Mongo.Collection("meals-info");

var currentDate = function() {
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
          $scope.clear();
          alert("Need to fill out valid information!");
        }
        else if ($scope.mealName($scope.meal.description)==true) {
          $scope.clear();
          alert("Same meal name! Invalid!");
        }
        else {
          $scope.meal.createdBy = currentUserId;
          var total = $scope.getTotal();
          $scope.meal.total = total;
          var date = currentDate();
          $scope.meal.date = date;
          Meteor.call("submit", angular.copy($scope.meal));
          $scope.clear();
        }
      }
      else {
        alert("You must sign in first!");
      }
    }

    $scope.mealName = function(name) {
      var temp = Meals.find().fetch();

      for (var x = 0; x < temp.length;x++) {
        if (temp[x].description==name) {
          return true;
        }
      }
      return false;
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
      if ($scope.meal.description==null) {
        return false;
      }
      if ($scope.meal.items.length==0) {
        return false;
      }
      
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

    $scope.todayDate = currentDate();

    $scope.show = true;
    
    $scope.countMeals = function() {
      if (Meals.find().count() > 0) {
        return true;
      }
      else {
        return false;
      }
    }

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
    var temp = currentDate();
    return Meals.find({createdBy: currentUserId, date: temp});
  });

}