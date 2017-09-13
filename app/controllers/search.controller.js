"use strict";

app.controller("searchCtrl", function($scope, apiSearchService){
  console.log('searchCtrl called');
  
  $scope.apiSearchService = apiSearchService;
  console.log('CHECK THIS ONE TOO arraySongObj', $scope.apiSearchService);
  

});