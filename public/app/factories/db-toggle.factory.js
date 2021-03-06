(function(){
  "use strict";

  var dbTglFactory = function($q, $http, FBCreds){

    //firebase call to get user db toggle info
    const getDBTgl = function(uid){
      return $q((resolve, reject) => {
        $http.get(`${FBCreds.databaseURL}/users/.json?orderBy="uid"&equalTo="${uid}"`)
        .then((data) => {
          let toggleObjects = data.data;
          let TglArray = [];
          Object.keys(toggleObjects).forEach(function (key) {
              toggleObjects[key].id = key;
              TglArray.push(toggleObjects[key]);
          });
          resolve(TglArray[0]);
        });
      });
    };

    //firebase call to save user db toggle info
    const changeDBTgl = function(id, changeObj){
      return $q((resolve, reject) => {
        let newChangeObj = JSON.stringify(changeObj);
        $http.patch(`${FBCreds.databaseURL}/users/${id}.json`, newChangeObj)
        .then((data) => {
        
          resolve();
        });
      });
    };

    return {getDBTgl, changeDBTgl};

  };

  dbTglFactory.$inject = ['$q', '$http', 'FBCreds'];
  angular.module("SongSearchApp").factory("dbTglFactory", dbTglFactory);

})();