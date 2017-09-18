"use strict";

app.controller("myListCtrl", function($scope, $route, $location, myListFactory, userFactory){
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
      console.log('userObj.mylist', userObj.myList);
      $scope.arraySongObj = userObj.myList;
      
      $scope.deleteFunction = function(event){
        let songID = event.currentTarget.parentElement.parentElement.getAttribute("user-song-id");
        let songArr = [];
        //add position to my List Array  -- delete factory needs position in $http url call
        Object.keys(userObj.myList).forEach(function (key) {
          userObj.myList[key].position = key;
          songArr.push(userObj.myList[key]);
        });
        for (var i = 0; i < songArr.length; i++) {
          if(songID === songArr[i].id){
            console.log('this song id', songID, 'position', songArr[i].position);
            myListFactory.deleteFromMyList(userObj.id, songArr[i].position);
            $route.reload();
          } 
        } 
      };
    });
  }
  


});