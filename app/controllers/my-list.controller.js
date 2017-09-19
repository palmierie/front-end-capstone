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
      //avoid null in myList Array
      let songObjArray = [];
      for (var k = 0; k < userObj.myList.length; k++) {
         if(null !== userObj.myList[k]){
           songObjArray.push(userObj.myList[k]);
         }
      }
      $scope.arraySongObj = songObjArray;
      
      $scope.deleteFunction = function(event){
        //build new array without
        let songID = event.currentTarget.parentElement.parentElement.getAttribute("user-song-id");
        let updatedSongArr = [];
        for (var i = 0; i < songObjArray.length; i++) {
          if(songID !== songObjArray[i].id){
            updatedSongArr.push(songObjArray[i]);
          }
        } 
        patchObj.myList = updatedSongArr;
        console.log('patchObj', patchObj);
        
        myListFactory.deleteFromMyList(userObj.id, patchObj)
        .then(()=>{
          $window.location.reload();
        });
      };
      /******** */
    });
  }
  


});