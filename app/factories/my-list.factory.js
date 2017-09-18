"use strict";

app.factory("myListFactory", function($q, $http, FBCreds){

function makeSongID(){
  return $q((resolve, reject)=>{
    let makeID = JSON.stringify("using firebase to generate ids");
    $http.post(`${FBCreds.databaseURL}/songID.json`, makeID)
    .then((obj)=>{
      resolve(obj.data.name);
    });
  });
}

function addToMyList(id, patchObj){
  return $q((resolve, reject)=>{
    $http.patch(`${FBCreds.databaseURL}/users/${id}.json`, patchObj)
    .then((data)=>{
      resolve();
    });
   });
}

function deleteFromMyList(id, songObjIdPosition){
  return $q((resolve, reject)=>{
    $http.delete(`${FBCreds.databaseURL}/users/${id}/myList/${songObjIdPosition}.json`)
    .then(()=>{
      resolve();
    });
  });
}

  return {addToMyList, makeSongID, deleteFromMyList};
});