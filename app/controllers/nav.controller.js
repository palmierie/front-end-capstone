"use strict";
// having $window injected forces reload of page
app.controller("navCtrl", function ($scope, $window, $location, userFactory, apiSearchService, dbTglFactory) {

  $scope.isLoggedIn = false;
  let searchInput = $scope.searchInput;
  let user = '';
  //authenticate user or else getCurrentUser is null
  userFactory.isAuthenticated()
  .then((x)=>{
    user = userFactory.getCurrentUser();
  });
  
  const searchDBs = function(dbToggleInfoArray, searchInput){
      //take dbToggleInfoArray and select appropriate db functions
      dbToggleInfoArray.forEach(db=>{
        switch (db){
          case "iTunes":
            //search iTunes
            apiSearchService.searchiTunes(searchInput)
            .then(()=>{
              $location.url("/search");
            });
            break;
          case "BPMSupreme":
            //search BPMSupreme
            console.log('search BPM Supreme', searchInput);
            
            break;
          case "Beatport":
            //search Beatport
            console.log('search Beatport', searchInput);
            apiSearchService.searchBeatport(searchInput)
            .then(()=>{
              $location.url("/search");
            });
            break;
        }
        // initialize tempArray on service factory for new input
        apiSearchService.clearTempArray(); 
      });

  };

  $scope.searchFunct = function(keyEvent){
    if(keyEvent.which === 13){
      //get db Toggle Info
      dbTglFactory.getDBTgl(user)
      .then((data)=>{
        console.log('BACK from PRomise data.toggleSettings', data.toggleSettings);
        let dbTglinfo = Object.keys(data.toggleSettings).filter(key => data.toggleSettings[key] === true);
        console.log('dbTglinfo', dbTglinfo);
        // get search input
        searchInput = $scope.searchInput;
        // perform Search passing Search input and db toggle info
        searchDBs(dbTglinfo, searchInput);
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
      // console.log("currentUser logged in?", user);
      // console.log("logged in t-f", $scope.isLoggedIn );
      $scope.$apply();
    } else {
      $scope.isLoggedIn = false;
      // console.log("user logged in?", $scope.isLoggedIn);
    }
  });	

});