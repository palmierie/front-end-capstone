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

function patchMyList(id, patchObj){
  return $q((resolve, reject)=>{
    let stringifiedObj = JSON.stringify(patchObj);
    console.log('stringifiedObj', stringifiedObj);
    
    $http.patch(`${FBCreds.databaseURL}/users/${id}.json`, stringifiedObj)
    .then((data)=>{
      resolve();
    });
   });
}

function deleteSongID(patchArr){
  return $q((resolve, reject)=>{
    $http.patch(`${FBCreds.databaseURL}/songID.json`, patchArr)
    .then(()=>{
      resolve();
    });
  });
}

  return {patchMyList, makeSongID, deleteSongID};
});