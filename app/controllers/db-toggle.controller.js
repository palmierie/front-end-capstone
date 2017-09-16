"use strict";

app.controller("dbTglCtrl", function($scope, userFactory, dbTglFactory){
  let user = userFactory.getCurrentUser();
  let changedUserObj = {};

  console.log('WHAT IS TE USERRRR', user);
  
  function getUserDBSettings(){
    dbTglFactory.getDBTgl(user)
    .then((userObj)=>{
      console.log('userObj', userObj);
      $scope.data = {
        dbiTunes: userObj.toggleSettings.iTunes,
        dbBeatport: userObj.toggleSettings.Beatport,
        dbBPMSupreme: userObj.toggleSettings.BPMSupreme
      };
      
      changedUserObj = userObj;
    });
  }




  $scope.updateFB = function(){
    //console.log('switch happened');
    changedUserObj = {
                displayName: changedUserObj.displayName,
                id: changedUserObj.id,
                uid: changedUserObj.uid,
                      toggleSettings: {
                        iTunes: $scope.data.dbiTunes,
                        Beatport: $scope.data.dbBeatport,
                        BPMSupreme: $scope.data.dbBPMSupreme
                      }
    };
   // console.log('changeUserObj switch', changedUserObj);
    //console.log('changeUserObj ID', changedUserObj.id);
    
    dbTglFactory.changeDBTgl(changedUserObj.id, changedUserObj);
  };

  getUserDBSettings();

});