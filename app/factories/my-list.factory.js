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

function getMyList(user){
  return $q((resolve, reject)=>{
   $http.get('');
  })
  .then(()=>{
    //add id to each song
  });
}

function addToMyList(user, patchObj){
  return $q((resolve, reject)=>{
    console.log('shit that is passed ato addToMyList', "user", user, "patchobj", patchObj);
    
    //$http.patch('');
 
   });
}

function deleteFromMyList(user, songObjId){

}

  return {getMyList, addToMyList, makeSongID, deleteFromMyList};
});