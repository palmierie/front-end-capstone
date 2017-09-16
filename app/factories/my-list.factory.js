"use strict";

app.factory("myListFactory", function($q, $http){

function getMyList(user){
  return $q((resolve, reject)=>{
   $http.get('');

  });
}

function addToMyList(user){

}

function deleteFromMyList(user){

}

  return {getMyList, addToMyList, deleteFromMyList};
});