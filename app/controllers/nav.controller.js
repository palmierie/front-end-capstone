"use strict";
// having $window injected forces reload of page
app.controller("navCtrl", function ($scope, $route, $uibModal, $window, $location, userFactory, apiSearchService, dbTglFactory) {

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
      console.log('numberOfCalls', numberOfCalls, 'i', i);
      
    });
    function locationRefresh(){
      if (numberOfCalls === i ){
        console.log('IF STATEMENT TRUE');
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
            console.log('BACK from PRomise data.toggleSettings', data.toggleSettings);
            let dbTglinfo = Object.keys(data.toggleSettings).filter(key => data.toggleSettings[key] === true);
            console.log('dbTglinfo', dbTglinfo);
            let numberOfCalls = dbTglinfo.length;
            // get search input
            searchInput = $scope.searchInput;

            $route.reload();
            // perform Search passing Search input and db toggle info
            searchDBs(dbTglinfo, searchInput, numberOfCalls);
          });
        } else{          
          $window.alert("You need to Log in to use this feature");
          // loginAlrtCtrl
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

  // $scope.myList = ()=>{
  //   $location.url("/my-list");
  // };

  // function Dialog  DemoCtrl($scope, $modal){
    
    //   $scope.data = {
    //     boldTextTitle: "You must Sign In to use this feature",
    //     mode : 'warning'
    //   };
    
    //   $scope.open = function () {
    //     console.log('OPEN CLICKED!');
        
    //     // $scope.data.mode = mode;
    
    //     var modalInstance = $uibModal.open({
    //       templateUrl: '../partials/login-alert.html',
    //       // controller: navCtrl,
    //       backdrop: true,
    //       keyboard: true,
    //       backdropClick: true,
    //       size: 'lg',
    //       resolve: {
    //         data: function () {
    //           return $scope.data;
    //         }
    //       }
    //     });
    
    
    //     // modalInstance.result.then(function (selectedItem) {
    //     //   $scope.selected = selectedItem;
    //     //     //alert( $scope.selected);
    //     // }, function () {
    //     //   $log.info('Modal dismissed at: ' + new Date());
    //     // });
    
    //   };
    
    // // }
    
    
    // var ModalInstanceCtrl = function ($scope, $modalInstance, data) {
    //   $scope.data = data;
    //   $scope.close = function(/*result*/){
    //     $modalInstance.close($scope.data);
    //   };
    // };

});