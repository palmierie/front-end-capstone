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
        /************TEST*****************/
        let ids = [1,2,3,4,5,6];
        
        let idObj = ids.reduce((obj, id) => {
            obj[id] = "bwahahaha";
            return obj;
        }, {});
        
        console.log("idObj", idObj);
        /*********************************/
        //get song ID
        let songID = event.currentTarget.parentElement.parentElement.getAttribute("user-song-id");
        //remove songObj with matching ID
        let updatedSongObjArr = userObj.myList.filter(song=> songID !== song.id);
        patchObj.myList = updatedSongObjArr;
        //place updated list of songIDs in an array 
        let songIDArray = [];
        updatedSongObjArr.forEach((song)=>{
          songIDArray.push(song.id);
        });
        //create object with new song IDs as keys
        let updatedSongIDObj = songIDArray.reduce((obj, id)=>{
          obj[id] = "CHANGED using firebase to generate ids";
          return obj;
        }, {});
        
        // submit new UserObj with new song list
        myListFactory.patchMyList(userObj.id, patchObj)
        .then(()=>{
          console.log('updatedSongIDObj', updatedSongIDObj);
          
          // submit new songID list
          myListFactory.deleteSongID(updatedSongIDObj)
          .then(()=>{
          //  $window.location.reload();
          });
        });
      };  //End delete function
    });
  }
  
  // sort list
  $scope.sort = function(keyname){
    $scope.sortKey = keyname;  //set the sortKey to parameter passed in
    $scope.reverse = !$scope.reverse;  //toggle true or false
  };

});