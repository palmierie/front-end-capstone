(function(){
  "use strict";
  var navCtrl = function ($scope, $route, $uibModal, $window, $location, userFactory, apiSearchService, dbTglFactory) {

    $scope.isLoggedIn = false;
    let searchInput = $scope.searchInput;
    let user = '';
    //authenticate user or else getCurrentUser is null
    userFactory.isAuthenticated()
    .then((x)=>{
      user = userFactory.getCurrentUser();
    });
    
    const searchDBs = function(dbToggleInfoArray, searchInput, numberOfCalls){
      apiSearchService.numberOfCalls(numberOfCalls);
      let i = 0;
      //take dbToggleInfoArray and select appropriate db functions
      dbToggleInfoArray.forEach(db=>{
        switch (db){
          case "iTunes":
            //search iTunes
            apiSearchService.searchiTunes(searchInput)
            .then(()=>{
              ++i;
              $location.url("/search");
              locationRefresh();
              });
              break;
          case "HeadlinerMusicClub":
            //search BPMSupreme
            apiSearchService.searchHeadlinerMusicClub(searchInput)
            .then(()=>{
              ++i;
              $location.url("/search");
              locationRefresh();
              });
              break;
          case "Beatport":
            //search Beatport
            apiSearchService.searchBeatport(searchInput)
            .then(()=>{
              ++i;
              $location.url("/search");
              locationRefresh();
              });
              break;
        }
        
      });
      function locationRefresh(){
        if (numberOfCalls === i ){
          $route.reload();
        }
    }
      // initialize tempArray on service factory for new input
      apiSearchService.clearTempArray();
    };
    
    //clear search input when clicked on
    $scope.clear = function(){
      $scope.searchInput = '';
    };

    //force users to sign in if they click My List or Settings
    $scope.alert = function(){
      $window.alert("You need to Log in to use this feature");
    };

    $scope.searchFunct = function(keyEvent){
      if(keyEvent.which === 13){
        //authenticate user or else getCurrentUser is null
        userFactory.isAuthenticated()
        .then((x)=>{
          user = userFactory.getCurrentUser();
          //get db Toggle Info
          if(user !== null){  
            dbTglFactory.getDBTgl(user)
            .then((data)=>{
              let dbTglinfo = Object.keys(data.toggleSettings).filter(key => data.toggleSettings[key] === true);
              let numberOfCalls = dbTglinfo.length;
              // get search input
              searchInput = $scope.searchInput;

              $route.reload();
              // perform Search passing Search input and db toggle info
              searchDBs(dbTglinfo, searchInput, numberOfCalls);
            });
          } else{          
            $window.alert("You need to Log in to use this feature");
          }
        });
      } 
    };

    $scope.login = () =>{
      $location.url('/login');
    };
    $scope.logout = () => {
          userFactory.logOut();
        };
    
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.isLoggedIn = true;
        $scope.$apply();
      } else {
        $scope.isLoggedIn = false;
      }
    });     

  };

  navCtrl.$inject = ['$scope', '$route', '$uibModal', '$window', '$location', 'userFactory', 'apiSearchService', 'dbTglFactory'];
  angular.module("SongSearchApp").controller("navCtrl",  navCtrl);
  
})();