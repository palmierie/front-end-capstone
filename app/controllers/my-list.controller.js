"use strict";

app.controller("myListCtrl", function($scope, $window, myListFactory, userFactory){
  let user = '';
  //authenticate user or else getCurrentUser is null
  userFactory.isAuthenticated()
  .then((x)=>{
    user = userFactory.getCurrentUser();
    displayList(user);
  });

  //display list
  function displayList(id){
    userFactory.getCurrentUserFullObj(id)
    .then((userObj)=>{
      let patchObj = {};
      patchObj = userObj;
      $scope.arraySongObj = userObj.myList;
      
      $scope.deleteFunction = function(event){
        let songID = event.currentTarget.parentElement.parentElement.getAttribute("user-song-id");
        let updatedSongArr = userObj.myList.filter(song=> songID !== song.id);
        patchObj.myList = updatedSongArr;
        myListFactory.patchMyList(userObj.id, patchObj)
        .then(()=>{
          $window.location.reload();
        });
      };
    });
  }
  
  // sort list
  $scope.sort = function(keyname){
    $scope.sortKey = keyname;  //set the sortKey to parameter passed in
    $scope.reverse = !$scope.reverse;  //toggle true or false
  };

});