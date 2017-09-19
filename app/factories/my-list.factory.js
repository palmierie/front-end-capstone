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

function deleteFromMyList(id, patchObj){
  return $q((resolve, reject)=>{
    let parseObj = angular.toJson(patchObj);
    $http.patch(`${FBCreds.databaseURL}/users/${id}.json`, parseObj)
    .then((data)=>{
      resolve();
    })
    .catch((error)=>{
      reject(error);
    });
  });
}

  return {addToMyList, makeSongID, deleteFromMyList};
});