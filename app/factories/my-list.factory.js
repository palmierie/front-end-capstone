"use strict";

app.factory("myListFactory", function($q, $http){

function getMyList(user){
  return $q((resolve, reject)=>{
   $http.get('');
  })
  .then(()=>{
    //add id to each song
  });
}

function addToMyList(user, songObj){
  return $q((resolve, reject)=>{
    $http.get('');
 
   });
}

function deleteFromMyList(user, songObjId){

}

  return {getMyList, addToMyList, deleteFromMyList};
});