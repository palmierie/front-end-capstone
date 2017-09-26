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
        //get song ID
        let songID = event.currentTarget.parentElement.parentElement.getAttribute("user-song-id");
        //remove songObj with matching ID
        let updatedSongArr = userObj.myList.filter(song=> songID !== song.id);
        //create array with new song IDs
        let updatedSongIDObj = updatedSongArr.reduce((obj, id)=>{
          obj[id] = "using firebase to generate ids";
          return obj;
        });
        
        // submit new UserObj with new song list
        patchObj.myList = updatedSongArr;
        console.log('patchObj', patchObj);
        myListFactory.patchMyList(userObj.id, patchObj)
        .then(()=>{
          console.log('updatedSongIDObj', updatedSongIDObj);
          
          // submit new songID list
          // myListFactory.deleteSongID(updatedSongIDArr)
          // .then(()=>{
        //    $window.location.reload();
          // });
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