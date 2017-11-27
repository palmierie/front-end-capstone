(function(){
  "use strict";


  var homeCtrl = function($scope, userFactory, filterFactory){

    $scope.isLoggedIn = false;

    let user = '';
    //authenticate user or else getCurrentUser is null
    userFactory.isAuthenticated()
    .then((x)=>{
      user = userFactory.getCurrentUser();
    });
    
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.isLoggedIn = true;
        $scope.$apply();
      } else {
        $scope.isLoggedIn = false;
      }
    });


  };
  homeCtrl.$inject = ['$scope', 'userFactory', 'filterFactory'];
  angular.module("SongSearchApp").controller("homeCtrl", homeCtrl);
})();