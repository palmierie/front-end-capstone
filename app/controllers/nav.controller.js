"use strict";
// having $window injected forces reload of page
app.controller("navCtrl", function ($scope, $window, $location, userFactory, apiSearchService, dbTglFactory) {

  $scope.isLoggedIn = false;
  let searchInput = $scope.searchInput;
  let user = userFactory.getCurrentUser();

  const searchDBs = function(dbToggleInfoArray, searchInput){

      //take dbToggleInfoArray and select appropriate db functions
      //if iTunes is toggled on
      apiSearchService.searchiTunes(searchInput)
       .then(()=>{
        $location.url("/search");
       });
   
      //return Array of Songs after Functions are called
  };

  $scope.searchFunct = function(keyEvent){
    if(keyEvent.which === 13){
      //get db Toggle Info
      let dbTglinfo = [];
      // dbTglFactory.getDBTgl(user)
      // .then((toggleInfoArray)=>{
      //   dbTglinfo = toggleInfoArray;
      // });

      // get search input
      searchInput = $scope.searchInput;
      // perform Search passing Search input and db toggle info
      searchDBs(dbTglinfo, searchInput);
    } 
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
      $window.location.href = "#!/login";
    }
  });	

});