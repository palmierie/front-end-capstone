(function() {
  "use strict";

  var dbTglCtrl = function($scope, userFactory, dbTglFactory){
    let user = userFactory.getCurrentUser();
    let changedUserObj = {};

    function getUserDBSettings(){
      dbTglFactory.getDBTgl(user)
      .then((userObj)=>{
        $scope.data = {
          dbiTunes: userObj.toggleSettings.iTunes,
          dbBeatport: userObj.toggleSettings.Beatport,
          dbHeadlinerMusicClub: userObj.toggleSettings.HeadlinerMusicClub
        };
        
        changedUserObj = userObj;
      });
    }

    $scope.updateFB = function(){
      changedUserObj = {
                  displayName: changedUserObj.displayName,
                  id: changedUserObj.id,
                  uid: changedUserObj.uid,
                  toggleSettings: {
                          iTunes: $scope.data.dbiTunes,
                          Beatport: $scope.data.dbBeatport,
                          HeadlinerMusicClub: $scope.data.dbHeadlinerMusicClub
                        }
      };      
      dbTglFactory.changeDBTgl(changedUserObj.id, changedUserObj);
    };

    getUserDBSettings();

  };

  dbTglCtrl.$inject = ['$scope', 'userFactory', 'dbTglFactory'];
  angular.module("SongSearchApp").controller("dbTglCtrl", dbTglCtrl);

})();