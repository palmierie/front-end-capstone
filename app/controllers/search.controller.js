"use strict";

app.controller("searchCtrl", function($scope, apiSearchService, myListFactory, userFactory){
  
  let user = '';
  //authenticate user or else getCurrentUser is null
  userFactory.isAuthenticated()
  .then((x)=>{
    user = userFactory.getCurrentUser();
  });

  $scope.apiSearchService = apiSearchService;
  
  $scope.saveFunction = function(event){
    console.log('Save function clicked!');
    console.log('event.currenttarget', event.currentTarget.parent);
     
  };


});