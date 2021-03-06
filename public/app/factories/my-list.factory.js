(function(){
  "use strict";

  var myListFactory = function($q, $http, FBCreds){

  function makeSongID(){
    return $q((resolve, reject)=>{
      let makeID = JSON.stringify("using firebase to generate ids");
      $http.post(`${FBCreds.databaseURL}/songID.json`, makeID)
      .then((obj)=>{
        resolve(obj.data.name);
      });
    });
  }

  function patchMyList(id, patchObj){
    return $q((resolve, reject)=>{
      $http.patch(`${FBCreds.databaseURL}/users/${id}.json`, patchObj)
      .then((data)=>{
        resolve();
      });
    });
  }

  function deleteSongID(id){
    return $q((resolve, reject)=>{
      $http.delete(`${FBCreds.databaseURL}/songID/${id}.json`)
      .then(()=>{
        resolve();
      });
    });
  }

    return {patchMyList, makeSongID, deleteSongID};
  };

  myListFactory.$inject = ['$q', '$http', 'FBCreds'];
  angular.module("SongSearchApp").factory("myListFactory", myListFactory);
  
})();