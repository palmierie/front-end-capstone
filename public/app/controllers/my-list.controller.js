(function(){
  "use strict";

  var myListCtrl = function($scope, $route, myListFactory, userFactory){
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
        //display alt html if no songs are in myList
        $scope.myListPlaylistEmpty = true;
        if (userObj.myList.length > 0){
          $scope.myListPlaylistEmpty = false;
        }
        
        $scope.deleteFunction = function(event){
          //get song ID
          let songID = event.currentTarget.parentElement.parentElement.getAttribute("user-song-id");
          //remove songObj with matching ID
          let updatedSongObjArr = userObj.myList.filter(song=> songID !== song.id);
          patchObj.myList = updatedSongObjArr;
          // submit new UserObj with new song list
          myListFactory.patchMyList(userObj.id, patchObj)
          .then(()=>{
            // submit songID to be deleted
            myListFactory.deleteSongID(songID)
            .then(()=>{
              $route.reload();
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

  };

  myListCtrl.$inject = ['$scope', '$route', 'myListFactory', 'userFactory'];
  angular.module("SongSearchApp").controller("myListCtrl", myListCtrl);
  
})();