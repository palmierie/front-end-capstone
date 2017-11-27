(function(){  
  "use strict";

  var searchCtrl = function($scope, apiSearchService, myListFactory, userFactory){
    
    let user = '';
    //authenticate user or else getCurrentUser is null
    userFactory.isAuthenticated()
    .then((x)=>{
      user = userFactory.getCurrentUser();
    });

    $scope.apiSearchService = apiSearchService;
    
    $scope.resultsDone = apiSearchService.resultsDone;
    console.log('apiSearchService.resultsLoaded()', apiSearchService.resultsDone);
    
    apiSearchService.initResultsDone();

    function buildPatchObject(savedObj){
      // let patchObj = {};
      userFactory.getCurrentUserFullObj(user)
      .then((userObj)=>{
        let patchObj = userObj;
        // add song to myList array of objects
        let newMyListArray = []; 
        newMyListArray.push(savedObj);
        // check if myList has any songs in it, if so, add to list array
        if (patchObj.myList !== undefined){
          newMyListArray.push(patchObj.myList);
        }
        let flattenedArray = [].concat.apply([], newMyListArray);
        patchObj.myList = flattenedArray;
        console.log('patch obj', patchObj);
        
        myListFactory.patchMyList(userObj.id, patchObj);
      });
    }
    //sort List
    $scope.sort = function(keyname){
      $scope.sortKey = keyname;  //set the sortKey to parameter passed in
      $scope.reverse = !$scope.reverse;  //toggle true or false
    };
    
    $scope.saveFunction = function(event){

      console.log('Save function clicked!');
      let songDiv = event.currentTarget.parentElement.parentElement;
      let saveObj = {};
      let newTrackName = '';
      let newArtistName = '';
      newArtistName = songDiv.getElementsByClassName('artist-name')[0].innerHTML.replace(/&amp;/g, "&");
      newTrackName = songDiv.getElementsByClassName('track-name')[0].innerHTML.replace(/&amp;/g, "&");
      
      myListFactory.makeSongID()
      .then((songId)=>{
        saveObj.artistName = newArtistName;
        saveObj.trackName = newTrackName;
        saveObj.trackLength = songDiv.getElementsByClassName('track-length')[0].innerHTML;
        saveObj.releaseDate = songDiv.getElementsByClassName('release-date')[0].innerHTML;
        saveObj.trackViewUrl = songDiv.getElementsByClassName('buy-url')[0].getElementsByTagName('a')[0].getAttribute("ng-href");
        saveObj.database = songDiv.getElementsByClassName('song-database')[0].innerHTML;
        saveObj.id = songId;
        console.log('saveObj', saveObj);
        buildPatchObject(saveObj);
      });
    };

  };

  searchCtrl.$inject = ['$scope', 'apiSearchService', 'myListFactory', 'userFactory'];
  angular.module("SongSearchApp").controller("searchCtrl", searchCtrl);

})();