(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

// change app. to angular.

angular.module("SongSearchApp", ["ngRoute", "ngMaterial", "ui.bootstrap"]);

let isAuth = (userFactory) => new Promise ( (resolve, reject) => {
  console.log("userFactory is", userFactory);
  userFactory.isAuthenticated()
  .then( (userExists) => {
    if(userExists){
      console.log("Authentication Success");
      resolve();
    }else {
			console.log("Authentication reject");
			//  Set Up Alert Message ************
      reject();
    }
  });
});



angular.module("SongSearchApp").config(($routeProvider) => {
	$routeProvider
	.when('/', {
		templateUrl:'partials/home.html',
		controller: 'homeCtrl'
	})
	.when('/search', {
		templateUrl:'partials/search-results.html',
		controller: 'searchCtrl',
		resolve: {isAuth}
	})
	.when('/login', {
		templateUrl: 'partials/user.html',
		controller: 'userCtrl'
	})
	.when('/settings', {
		templateUrl: 'partials/db-toggle.html',
		controller: 'dbTglCtrl',
		resolve: {isAuth}
	})
	.when('/my-list', {
		templateUrl: 'partials/my-list.html',
		controller: 'myListCtrl',
		resolve: {isAuth}
	})
	.otherwise('/');
});


angular.module("SongSearchApp").run(($location, FBCreds) => {
	let creds = FBCreds;
	let authConfig = {
		apiKey: creds.apiKey,
		authDomain: creds.authDomain,
		databaseURL: creds.databaseURL
	};

	firebase.initializeApp(authConfig);
});
},{}],2:[function(require,module,exports){
(function() {
  "use strict";

  var dbTglCtrl = function($scope, userFactory, dbTglFactory){
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
          dbHeadlinerMusicClub: userObj.toggleSettings.HeadlinerMusicClub
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
                          HeadlinerMusicClub: $scope.data.dbHeadlinerMusicClub
                        }
      };
      // console.log('changeUserObj switch', changedUserObj);
      //console.log('changeUserObj ID', changedUserObj.id);
      
      dbTglFactory.changeDBTgl(changedUserObj.id, changedUserObj);
    };

    getUserDBSettings();

  };

  dbTglCtrl.$inject = ['$scope', 'userFactory', 'dbTglFactory'];
  angular.module("SongSearchApp").controller("dbTglCtrl", dbTglCtrl);

})();
},{}],3:[function(require,module,exports){
(function(){
  "use strict";


  var homeCtrl = function($scope, userFactory, filterFactory){

    $scope.isLoggedIn = false;

    let user = '';
    //authenticate user or else getCurrentUser is null
    userFactory.isAuthenticated()
    .then((x)=>{
      user = userFactory.getCurrentUser();
    });
    
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.isLoggedIn = true;
        $scope.$apply();
      } else {
        $scope.isLoggedIn = false;
      }
    });


  };
  homeCtrl.$inject = ['$scope', 'userFactory', 'filterFactory'];
  angular.module("SongSearchApp").controller("homeCtrl", homeCtrl);
})();
},{}],4:[function(require,module,exports){
// "use strict";
// require('./db-toggle.controller.js');
// require('./home.controller.js');
// require('./login-alert.controller.js');
// require('./my-list.controller.js');
// require('./nav.controller.js');
// require('./search.controller.js');
// require('./user.controller.js');
},{}],5:[function(require,module,exports){
(function() {
  "use strict";

  
  var loginAlrtCtrl = function($scope, $modal, $modalInstance){

    function DialogDemoCtrl($scope, $modal){
    
        $scope.data = {
          boldTextTitle: "You must Sign In to use this feature",
          mode : 'warning'
        };
    
      $scope.open = function (mode) {
    
        $scope.data.mode = mode;
    
        var modalInstance = $modal.open({
          templateUrl: 'login-alert.html',
          controller: ModalInstanceCtrl,
          backdrop: true,
          keyboard: true,
          backdropClick: true,
          size: 'lg',
          resolve: {
            data: function () {
              return $scope.data;
            }
          }
        });
    
        // modalInstance.result.then(function (selectedItem) {
        //   $scope.selected = selectedItem;
        //     //alert( $scope.selected);
        // }, function () {
        //   $log.info('Modal dismissed at: ' + new Date());
        // });
    
      };
    
    }
    
    var ModalInstanceCtrl = function ($scope, $modalInstance, data) {
      $scope.data = data;
      $scope.close = function(/*result*/){
        $modalInstance.close($scope.data);
      };
    };

  };

  loginAlrtCtrl.$inject = ['$scope', '$modal', '$modalInstance'];
  angular.module("SongSearchApp").controller("loginAlrtCtrl", loginAlrtCtrl);
})();
},{}],6:[function(require,module,exports){
(function(){
  "use strict";

  var myListCtrl = function($scope, $route, myListFactory, userFactory){
    let user = '';
    //authenticate user or else getCurrentUser is null
    userFactory.isAuthenticated()
    .then((x)=>{
      user = userFactory.getCurrentUser();
      displayList(user);
    });

    //display list
    function displayList(id){
      userFactory.getCurrentUserFullObj(id)
      .then((userObj)=>{
        let patchObj = {};
        patchObj = userObj;
        $scope.arraySongObj = userObj.myList;
        
        $scope.deleteFunction = function(event){
          //get song ID
          let songID = event.currentTarget.parentElement.parentElement.getAttribute("user-song-id");
          //remove songObj with matching ID
          let updatedSongObjArr = userObj.myList.filter(song=> songID !== song.id);
          patchObj.myList = updatedSongObjArr;
          // submit new UserObj with new song list
          myListFactory.patchMyList(userObj.id, patchObj)
          .then(()=>{
            // submit songID to be deleted
            myListFactory.deleteSongID(songID)
            .then(()=>{
              $route.reload();
            });
          });
        };  //End delete function
      });
    }
    
    // sort list
    $scope.sort = function(keyname){
      $scope.sortKey = keyname;  //set the sortKey to parameter passed in
      $scope.reverse = !$scope.reverse;  //toggle true or false
    };

  };

  myListCtrl.$inject = ['$scope', '$route', 'myListFactory', 'userFactory'];
  angular.module("SongSearchApp").controller("myListCtrl", myListCtrl);
  
})();
},{}],7:[function(require,module,exports){
(function(){
  "use strict";
  // having $window injected forces reload of page
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

  };

  navCtrl.$inject = ['$scope', '$route', '$uibModal', '$window', '$location', 'userFactory', 'apiSearchService', 'dbTglFactory'];
  angular.module("SongSearchApp").controller("navCtrl",  navCtrl);
  
})();
},{}],8:[function(require,module,exports){
(function(){  
  "use strict";

  var searchCtrl = function($scope, apiSearchService, myListFactory, userFactory){
    
    let user = '';
    //authenticate user or else getCurrentUser is null
    userFactory.isAuthenticated()
    .then((x)=>{
      user = userFactory.getCurrentUser();
    });

    $scope.apiSearchService = apiSearchService;
    
    $scope.resultsDone = apiSearchService.resultsDone;
    console.log('apiSearchService.resultsLoaded()', apiSearchService.resultsDone);
    
    apiSearchService.initResultsDone();

    function buildPatchObject(savedObj){
      // let patchObj = {};
      userFactory.getCurrentUserFullObj(user)
      .then((userObj)=>{
        let patchObj = userObj;
        // add song to myList array of objects
        let newMyListArray = []; 
        newMyListArray.push(savedObj);
        // check if myList has any songs in it, if so, add to list array
        if (patchObj.myList !== undefined){
          newMyListArray.push(patchObj.myList);
        }
        let flattenedArray = [].concat.apply([], newMyListArray);
        patchObj.myList = flattenedArray;
        console.log('patch obj', patchObj);
        
        myListFactory.patchMyList(userObj.id, patchObj);
      });
    }
    //sort List
    $scope.sort = function(keyname){
      $scope.sortKey = keyname;  //set the sortKey to parameter passed in
      $scope.reverse = !$scope.reverse;  //toggle true or false
    };
    
    $scope.saveFunction = function(event){

      console.log('Save function clicked!');
      let songDiv = event.currentTarget.parentElement.parentElement;
      let saveObj = {};
      let newTrackName = '';
      let newArtistName = '';
      newArtistName = songDiv.getElementsByClassName('artist-name')[0].innerHTML.replace(/&amp;/g, "&");
      newTrackName = songDiv.getElementsByClassName('track-name')[0].innerHTML.replace(/&amp;/g, "&");
      
      myListFactory.makeSongID()
      .then((songId)=>{
        saveObj.artistName = newArtistName;
        saveObj.trackName = newTrackName;
        saveObj.trackLength = songDiv.getElementsByClassName('track-length')[0].innerHTML;
        saveObj.releaseDate = songDiv.getElementsByClassName('release-date')[0].innerHTML;
        saveObj.trackViewUrl = songDiv.getElementsByClassName('buy-url')[0].getElementsByTagName('a')[0].getAttribute("ng-href");
        saveObj.database = songDiv.getElementsByClassName('song-database')[0].innerHTML;
        saveObj.id = songId;
        console.log('saveObj', saveObj);
        buildPatchObject(saveObj);
      });
    };

  };

  searchCtrl.$inject = ['$scope', 'apiSearchService', 'myListFactory', 'userFactory'];
  angular.module("SongSearchApp").controller("searchCtrl", searchCtrl);

})();
},{}],9:[function(require,module,exports){
(function(){
	"use strict";

	var userCtrl = function ($scope, $window, userFactory, $location, dbTglFactory) {

		console.log("userCtrl loaded");

		// Account login creds received for current users:
		$scope.account = {
			email: "",
			password: ""
		};

		// New account creds received for new user registering:
		$scope.newAccount = {
			email: "",
			password: ""
		};

		// displayName is stored because cannot add to profile upon registering user (per firebase)
		$scope.displayName = "";

		// When Register button is clicked, run register function to create new user in Firebase using existing user credentials provided
		$scope.register = () => {
			console.log("clicked on register");
			userFactory.register({
				email: $scope.newAccount.email,
				password: $scope.newAccount.password
			})
			.then((userData) => {
				//Immediately log them in
				userFactory.logIn($scope.newAccount)
				.then((newaccount) => {
					let name = $scope.displayName;
					//Update profile using the name they provided
					userFactory.updateDisplayName(name);
				})
				.then((whatever) => {
					addUser();
				})
				.catch((error) => {
					console.log("error updating display name", error);
				});
			});
		};

		// When enter pressed in Register password, run register function to create new user in Firebase using existing user credentials provided
		$scope.registerEnter = (keyEvent)=>{
			console.log("enter on register password");
			userFactory.register({
				email: $scope.newAccount.email,
				password: $scope.newAccount.password
			})
			.then((userData) => {
				//Immediately log them in
				userFactory.logIn($scope.newAccount)
				.then((newaccount) => {
					let name = $scope.displayName;
					//Update profile using the name they provided
					userFactory.updateDisplayName(name);
				})
				.then((whatever) => {
					addUser();
				})
				.catch((error) => {
					console.log("error updating display name", error);
				});
			});
		};
		
		// When login button is clicked, run loginInUser function to log in using existing user credentials provided
		$scope.login = () => {
			console.log('login called');
			
			logInUser($scope.account);
		};
		// When enter pressed in password, run loginInUser function to log in using existing user credentials provided
		$scope.loginEnter = (keyEvent)=>{
			if(keyEvent.which === 13){
				logInUser($scope.account);
			}
		};

		// Utility login function that can log in existing user, or newly registered user after registering
		function logInUser(userCreds) {
			userFactory.logIn(userCreds)
			.then( () => {
				console.log('loginUser called');
				
				$window.location.href = "#!/";
			});
		}

		// $scope.logout = () => {
		//       userFactory.logOut()
		//       .then(function(){
		//       	console.log("logged out done");

		//       }, function(error){
		//       	console.log("error occured on logout");
		//       });
		//     };

		firebase.auth().onAuthStateChanged(function(user) {
			if (user) {
				$scope.isLoggedIn = true;
				console.log("firebase.auth()", firebase.auth());
				console.log("currentUser logged in?", user);
				console.log("logged in t-f", $scope.isLoggedIn );
				$scope.$apply();
			} else {
				$scope.isLoggedIn = false;
				console.log("user logged in?", $scope.isLoggedIn);
				$window.location.href = "#!/login";
			}
		});

		$scope.loginGoogle = () => {
			console.log("you clicked on google login");
			userFactory.authWithProvider()
			.then((result) => {
				let user = result.user.uid;
				$location.path("/home");
				addUser();
				$scope.$apply();
				console.log("loginGoogle .then ran");
			})
			.catch((error) => {
				console.log("error with google login");
				let errorCode = error.code;
				let errorMessage = error.message;
				console.log("error", error); 
			});
		};

		// Checks if user exists in firebase, and if not, adds them.
		function addUser(){
			userFactory.getFBCurrentUser()
			.then( (user) => {
				console.log("****user in addUser****", user);
				// console.log("userFactory.userIsInFirebase(user.uid) in addUser", userFactory.userIsInFirebase(user.uid));
				userFactory.userIsInFirebase(user.uid)
				.then((isInFirebase) => {
					console.log("isInFirebase inside nested .then in addUser", isInFirebase);
					console.log("user in nested .then in addUser", user);
					console.log("user.email in nested .then in addUser", user.email);
					console.log("user.displayName", user.displayName);
					if(isInFirebase === false) {
						if($scope.displayName === ""){
							let userObj = {
														displayName: user.displayName,
														uid: user.uid,
														photoURL: user.photoURL,
														toggleSettings: {
																	iTunes: true,
																	Beatport: true,
																	HeadlinerMusicClub: true
														}
							};
											
							console.log("userObj in addUser", userObj);
							userFactory.addUserToFirebase(userObj);
						}else {
							let userObj = {
														displayName: $scope.displayName,
														uid: user.uid,
														photoURL: user.photoURL,
														toggleSettings: {
																	iTunes: true,
																	Beatport: true,
																	HeadlinerMusicClub: true
														}																	
							};
					
							console.log("userObj in addUser", userObj);
							userFactory.addUserToFirebase(userObj);
						}
					}else {
						console.log("user already in firebase");
					}
					//show home view
					$window.location.href = "#!/";
				});
				
					// userFactory.addUserToFirebase(user);

			});

		}

	//when first loaded, make sure no one is logged in
		// // console.log("what is this?", userFactory.isAuthenticated());
		// if (userFactory.isAuthenticated()) 
		//   logout();
		
	// console.log("app isAuth", isAuth());
	//   if (isAuth()){
	//     console.log("app isAuth", isAuth());
	//   }

	};

	userCtrl.$inject = ['$scope', '$window', 'userFactory', '$location', 'dbTglFactory'];
	angular.module("SongSearchApp").controller("userCtrl", userCtrl);

})();
},{}],10:[function(require,module,exports){
(function(){
  'use strict';

  var apiSearchService = function($q, $http, $location){

    this.arraySongObjFinal = [];
    //collects all arrays from all functions
    let tempArray = [];

    //Toggle to true when to display results
    this.resultsDone = false;
    
    //resolves that happened
    let numberOfResolves = 0;
    
    //number of calls
    let numberOfCalls = null;
    
    //number of Calls to be made
    this.numberOfCalls = function(number){
      numberOfCalls = number;
    };
    
    this.initResultsDone = function(){
      this.resultsDone = false;
    };
  
    //combines iTunes Search for Artist and Track Title
    this.searchiTunes = function(searchInput){
      return $q((resolve, reject)=>{
        var p1 = searchiTunesSongs(searchInput);
        var p2 = searchiTunesArtists(searchInput);
        
        Promise.all([p1,p2])
        .then((arraySongObj)=>{
          let flattenedArray = [].concat.apply([],arraySongObj);
          ++numberOfResolves;
          console.log('numberOfResolves iTUnes', numberOfResolves);
          this.songArrayFunct(flattenedArray);
          resolve();
        });
      });
    };
    
    //combines Beatport Search for Artist and Track Title
    this.searchBeatport = function(searchInput){
      return $q((resolve, reject)=>{
        var p1 = searchBeatportSongs(searchInput);
        var p2 = searchBeatportArtists(searchInput);

        Promise.all([p1,p2])
          .then((arraySongObj)=>{
            let flattenedArray = [].concat.apply([],arraySongObj);
            ++numberOfResolves;
            console.log('numberOfResolves BP', numberOfResolves);
            this.songArrayFunct(flattenedArray);
            resolve();
          });
        });
      };
    //combines results from all arrays
    this.songArrayFunct = function(arraySongObj){
      tempArray.push(arraySongObj);
      this.arraySongObjFinal = [].concat.apply([],tempArray);
      console.log('tempArray', tempArray);
      console.log('this.arraySongObjFinal', this.arraySongObjFinal);
      this.resultsDone = numberOfCalls===numberOfResolves ? true : false;
      if (this.resultsDone === true){
        numberOfResolves = 0;
      }
      console.log('results done in api Service', this.resultsDone);
      return this.arraySongObjFinal;
    };
    
    this.clearTempArray = function(){
      tempArray = [];
    };

    // convert times for iTunes return data
    function convertTrackTimeMilliseconds(trackInMilliseconds) {
      let trackTime = '';
      let convertSec = '';
      let ms = trackInMilliseconds,
              min = (ms/1000/60) << 0,
              sec = (ms/1000) % 60;
      if (sec < 10){
        convertSec = `0${sec.toFixed(0)}`;
      } else{
        convertSec = sec.toFixed(0);
      }
      trackTime = `${min}:${convertSec}`;
      return trackTime;
    }

    function searchiTunesSongs(search){
      var songSearchiTunesArray = [];
      return $q((resolve, reject) => {
        $http.get(`https://itunes.apple.com/search?media=music&entity=song&attribute=songTerm&term=${search}&limit=25`)
          .then((result) => {
            console.log('result from promise', result);
            let arrResult = result.data.results;
          
            for (var i = 0; i < arrResult.length; i++) {
              let selectedObj = {};
              selectedObj.artistName = arrResult[i].artistName;
              selectedObj.trackCensoredName = arrResult[i].trackCensoredName;
              selectedObj.trackLength = convertTrackTimeMilliseconds(arrResult[i].trackTimeMillis);
              selectedObj.releaseDate = arrResult[i].releaseDate.slice(0,10);
              selectedObj.trackViewUrl = arrResult[i].trackViewUrl;
              selectedObj.database = "iTunes";

              songSearchiTunesArray.push(selectedObj);
            }
            console.log('arraySongObj', songSearchiTunesArray);  
            resolve(songSearchiTunesArray);
        }).catch((error) => {
          reject(error);
        });
      });
    } // End function searchiTunesSongs

    function searchiTunesArtists(search){
      var songArtistSearchiTunesArray = [];
      return $q((resolve, reject) => {
        $http.get(`https://itunes.apple.com/search?media=music&entity=song&attribute=artistTerm&term=${search}&limit=50`)
          .then((result) => {
            console.log('result from promise', result);
            let arrResult = result.data.results;

            for (var i = 0; i < arrResult.length; i++) {
              let selectedObj = {};
              selectedObj.artistName = arrResult[i].artistName;
              selectedObj.trackCensoredName = arrResult[i].trackCensoredName;
              selectedObj.trackLength = convertTrackTimeMilliseconds(arrResult[i].trackTimeMillis);
              selectedObj.releaseDate = arrResult[i].releaseDate.slice(0,10);
              selectedObj.trackViewUrl = arrResult[i].trackViewUrl;
              selectedObj.database = "iTunes";

              songArtistSearchiTunesArray.push(selectedObj);
            }
            console.log('arraySongObj Artist', songArtistSearchiTunesArray);
            resolve(songArtistSearchiTunesArray);
        }).catch((error) => {
          reject(error);
        });
      });
    } // End function searchiTunesArtists

    // Search for songs within Beatport
    // search (String): The search query
    // returns: Promise
    function searchBeatportSongs(search){
      return $q((resolve, reject)=>{
    
        var songBeatportArray = [];
        let bpTrackUrl = 'https://www.beatport.com/track/';
        
        $http.get(`https://www.beatport.com/search/tracks?q=${search}&per-page=50`)
        .then((result)=>{
          //slice to <script id="data-objects">
          let start1 = result.data.indexOf("data-objects");
          let string1 = result.data.slice(start1);      
          //slice to "tracks"
          let start2 = string1.indexOf('"tracks"');
          let string2 = string1.slice(start2);
          
          //end slice to window.Sliders
          let end1 = string2.indexOf("window.Sliders");
          let end2 = end1 - 12;
          let string3 = string2.slice(0,end2);
          //console.log('cut string3', string3);
          let string4 = `{${string3}}`;
          let jsonObj = JSON.parse(string4);
          let tracksObjArr = jsonObj.tracks;
          console.log('jsonobj', tracksObjArr);
      
          for (var i = 0; i < tracksObjArr.length; i++) {
              let selectedObj = {};
              let artistNames = [];
              for (var k = 0; k < tracksObjArr[i].artists.length; k++) {
                artistNames.push(tracksObjArr[i].artists[k].name);
              }
              selectedObj.artistName = artistNames.join(', ');
              selectedObj.trackCensoredName = tracksObjArr[i].title;
              selectedObj.trackLength = tracksObjArr[i].duration.minutes;
              selectedObj.releaseDate = tracksObjArr[i].date.released;
              selectedObj.trackViewUrl = `${bpTrackUrl}${tracksObjArr[i].slug}/${tracksObjArr[i].id}`;
              selectedObj.database = "Beatport";

              songBeatportArray.push(selectedObj);
          }
          console.log('songBeatportArray', songBeatportArray);
          resolve(songBeatportArray);
        });


      });
    } // End function searchBeatportSongs

    function searchBpArtistLink(search){
      return $q((resolve, reject)=>{
        // var headers = {
        // 	'Access-Control-Allow-Origin' : '*'
        //  // 'Access-Control-Allow-Methods' : 'GET',
        //  // "cache-control": "no-cache",
        //  // "postman-token": "00a2f541-2236-a387-e9a6-c2329912a03f"
        // };
        var songBeatportArray = [];
        let bpTrackUrl = 'https://www.beatport.com/track/';
        
        $http.get(`https://www.beatport.com/search/?q=${search}`)
        .then((result)=>{
          //slice to artist-gradient-overlay
          let start0 = result.data.indexOf('a href="/artist');
          let start1 = start0 + 8;
          let end0 = result.data.indexOf("artist-gradient-overlay");
          let end1 = end0 - 27;
          let string1 = result.data.slice(start1, end1);
          console.log('cut string1', string1);
          resolve(string1);
        });
      });
    } // End function searchBpArtistLink

    function searchBeatportArtists(search){
      return $q((resolve, reject)=>{
        searchBpArtistLink(search)
          .then((artistLink)=>{
            console.log('artistLink', artistLink);
            var artistBeatportArray = [];
            let bpTrackUrl = 'https://www.beatport.com/track/';
            
            $http.get(`https://www.beatport.com${artistLink}/tracks?per-page=50`)
              .then((artistResult)=>{
              // console.log('artist result', artistResult.data);
                // slice to <script id="data-objects">
                let start1 = artistResult.data.indexOf("data-objects");
                let string1 = artistResult.data.slice(start1);      
                //slice to "tracks"
                let start2 = string1.indexOf('"tracks"');
                let string2 = string1.slice(start2);
                
                //end slice to window.Sliders
                let end1 = string2.indexOf("window.Sliders");
                let end2 = end1 - 12;
                let string3 = string2.slice(0,end2);
                //console.log('cut string3', string3);
                let string4 = `{${string3}}`;
                let jsonObj = JSON.parse(string4);
                let tracksObjArr = jsonObj.tracks;
                console.log('jsonobj', tracksObjArr);
                for (var i = 0; i < tracksObjArr.length; i++) {
                  let selectedObj = {};
                  let artistNames = [];
                  for (var k = 0; k < tracksObjArr[i].artists.length; k++) {
                    artistNames.push(tracksObjArr[i].artists[k].name);
                  }
                  selectedObj.artistName = artistNames.join(', ');
                  selectedObj.trackCensoredName = tracksObjArr[i].title;
                  selectedObj.trackLength = tracksObjArr[i].duration.minutes;
                  selectedObj.releaseDate = tracksObjArr[i].date.released;
                  selectedObj.trackViewUrl = `${bpTrackUrl}${tracksObjArr[i].slug}/${tracksObjArr[i].id}`;
                  selectedObj.database = "Beatport";

                  artistBeatportArray.push(selectedObj);
                }
                console.log('songBeatportArray', artistBeatportArray);
                resolve(artistBeatportArray);
              });
          });
      });
    } // End function searchBeatportArtists

    this.searchHeadlinerMusicClub = function(search){
      return $q((resolve, reject)=>{
        $http.get(`https://headlinermusicclub.com/?s=${search}&post_type=audio`)
        .then((result)=>{
          let headlinerMCArray = [];
          // console.log('data', result.data);
          let start1 = result.data.indexOf('class="audio_list');
          let end1 = result.data.indexOf('class="search-res');
          let string1 = result.data.slice(start1,end1); 
          //count number of songs to be iterated through
          let array1 = string1.match(/class="artist-name"/g);
          console.log('array1 length', array1.length);
          let stringChopped = string1;

          // BUILD LOOP TO HOLD DATA FROM EACH SONG
          let k = 2;
          for (var i = 0; i < array1.length; i++) {
            let selectedObj = {};
            //get Artist Name
            let startArtist = stringChopped.indexOf('class="artist-name') + 20;
            let endArtist = stringChopped.indexOf('class="song-name') - 11;
            let preArtist = stringChopped.slice(startArtist,endArtist);
              //regex to get and switch & sign
            let artist = preArtist.replace(/&amp;/g, "&").replace(/&#038;/g, "&").replace(/&#8217;/g, "'").replace(/&#8216;/g, "‘");

            //get Song Title
            let startSong = stringChopped.indexOf('class="song-name') + 26;
            let endSong = stringChopped.indexOf('class="rating-audio') - 26;
            let preSong = stringChopped.slice(startSong,endSong); 
              //filter out exclusive div content to fix end slice point
            if(preSong.includes('class="audio-hmc') === true){
              let preSongEnd = preSong.indexOf('class="audio-hmc') - 26;
              preSong = preSong.slice(0,preSongEnd);
            }
              //regex to get and switch & sign
            let song = preSong.replace(/&amp;/g, "&").replace(/&#038;/g, "&").replace(/&#8217;/g, "'").replace(/&#8216;/g, "‘");

            //get Release Date
            let startRDate = stringChopped.indexOf('class="add-date') + 49;
            let endRDate = stringChopped.indexOf('class="download-version') - 29;
            let releaseDateUnordered = stringChopped.slice(startRDate,endRDate);
            //format date to match other databases
            let month = releaseDateUnordered.slice(0,2);
            let day = releaseDateUnordered.slice(3,5);
            let year = releaseDateUnordered.slice(6);
            let releaseDate = `${year}-${month}-${day}`;
            //get Buy Link
            let startBuyLink = stringChopped.indexOf('data-audio_file=') + 17;
            let endBuyLink = stringChopped.indexOf('</div></li>') - 2;
            let buyLink = stringChopped.slice(startBuyLink,endBuyLink);

            // CHOP stringChopped AFTER SONG
            let chopStrStart = stringChopped.indexOf(`src="https://headlinermusicclub.com/blank.mp3?_=${k}"`);
            stringChopped = stringChopped.slice(chopStrStart);
            
            //build song obj
            selectedObj.artistName = artist;
            selectedObj.trackCensoredName = song;
            selectedObj.trackLength = "not listed";
            selectedObj.releaseDate = releaseDate;
            selectedObj.trackViewUrl = buyLink;
            selectedObj.database = "H. M. C.";

            headlinerMCArray.push(selectedObj);
            k++;
          }
          console.log('headlinerMCArray',headlinerMCArray);
          ++numberOfResolves;
          this.songArrayFunct(headlinerMCArray);
          resolve();
        });
      });
    };  //End Function searchHeadlinerMusicClub
    
  };
  
  apiSearchService.$inject = ['$q', '$http', '$location'];
  angular.module("SongSearchApp").service("apiSearchService", apiSearchService);
  
})();
},{}],11:[function(require,module,exports){
(function(){
  "use strict";

  var dbTglFactory = function($q, $http, FBCreds){

    //firebase call to get user db toggle info
    const getDBTgl = function(uid){
      return $q((resolve, reject) => {
        $http.get(`${FBCreds.databaseURL}/users/.json?orderBy="uid"&equalTo="${uid}"`)
        .then((data) => {
          console.log('data',data);
          let toggleObjects = data.data;
          let TglArray = [];
          Object.keys(toggleObjects).forEach(function (key) {
              toggleObjects[key].id = key;
              TglArray.push(toggleObjects[key]);
          });
          console.log('UIDArray', TglArray[0].toggleSettings);
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
},{}],12:[function(require,module,exports){
(function(){
	"use strict";

	var filterFactory = function(){
			return {
			search: ""
		};
	};
	
	// $inject

	angular.module("SongSearchApp").factory("filterFactory", filterFactory);
	
})();
},{}],13:[function(require,module,exports){
// "use strict";
// require('./api-search.factory.js');
// require('./db-toggle.factory.js');
// require('./filter.factory.js');
// require('./my-list.factory.js');
// require('./user.factory.js');
},{}],14:[function(require,module,exports){
(function(){
  "use strict";

  var myListFactory = function($q, $http, FBCreds){

  function makeSongID(){
    return $q((resolve, reject)=>{
      let makeID = JSON.stringify("using firebase to generate ids");
      $http.post(`${FBCreds.databaseURL}/songID.json`, makeID)
      .then((obj)=>{
        resolve(obj.data.name);
      });
    });
  }

  function patchMyList(id, patchObj){
    return $q((resolve, reject)=>{
      $http.patch(`${FBCreds.databaseURL}/users/${id}.json`, patchObj)
      .then((data)=>{
        resolve();
      });
    });
  }

  function deleteSongID(id){
    return $q((resolve, reject)=>{
      $http.delete(`${FBCreds.databaseURL}/songID/${id}.json`)
      .then(()=>{
        resolve();
      });
    });
  }

  // function deleteSongID(patchSongIDobj){
  //   return $q((resolve, reject)=>{
  //     $http.patch(`${FBCreds.databaseURL}/songID.json`, patchSongIDobj)
  //     .then(()=>{
  //       resolve();
  //     });
  //   });
  // }

    return {patchMyList, makeSongID, deleteSongID};
  };

  myListFactory.$inject = ['$q', '$http', 'FBCreds'];
  angular.module("SongSearchApp").factory("myListFactory", myListFactory);
  
})();
},{}],15:[function(require,module,exports){
(function(){
  "use strict";

  /* provide the basic auth functionality for firebase */

  var userFactory = function($q, $window, $location, $http, FBCreds){

    // This is just the user's UID from Firebase
    let currentUser = null;
    // This is the complete user object that comes back from Firebase
    let FBCurrentUser = null;
    let currentUserFullObj = null;

    const getCurrentUser = function(){
        return currentUser;
    };

    //use the current user uid to get full user object from fb database
    const getCurrentUserFullObj = function(uid){
      return $q((resolve, reject) => {
        console.log("inside getCurrentUserFullObj");
        $http.get(`${FBCreds.databaseURL}/users/.json?orderBy="uid"&equalTo="${uid}"`)
        .then((data) => {
          // console.log("data in getCurrentUserFullObj", data);
          currentUserFullObj = data.data;
          let objectArr = [];
            Object.keys(currentUserFullObj).forEach(function (key) {
                objectArr.push(currentUserFullObj[key]);
            });
          currentUserFullObj = objectArr[0];
          console.log("currentUserFullObj", currentUserFullObj);
          resolve(currentUserFullObj);
        });
      });
    };
    
    const logIn = function(userObj){
      return firebase.auth().signInWithEmailAndPassword(userObj.email, userObj.password)
      .catch(function(error){
        let errorCode = error.code;
        let errorMessage = error.message;
        console.log("error", errorCode, errorMessage);
      });

    };

    const logOut = function(){
      console.log("logoutUser");
      return firebase.auth().signOut()
      .then(()=>{
        $window.location.reload();
        $location.url("#!/");
      });

    };

    const register = function(userObj){
      return firebase.auth().createUserWithEmailAndPassword(userObj.email, userObj.password)
      .catch(function(error){
        let errorCode = error.code;
        let errorMessage = error.message;
        console.log("error", errorCode, errorMessage);
      });

    };

    const updateDisplayName = function (name){
      return new Promise ((resolve, reject) => { 
        firebase.auth().currentUser.updateProfile({
            displayName: name
        });
        resolve();
      });
    };

  /* The three functions below are used in sequence to:
  1. Get the current logged in user from the auth side of FB,
  2. Check and see if that user already exists in our Users collection, and if not,
  3. Add them to our Users collection */

  // Gets the current user from the **Authentication/Users** section of Firebase (not our db section)
    const getFBCurrentUser = function () {
      // console.log("userFactory: isAuthenticated");
      return new Promise ((resolve, reject) => {
        firebase.auth().onAuthStateChanged( (user) => {
          // console.log("user in getFBCurrentUser", user);
          // let userTest = user;
          // console.log("userTest", userTest);
          // console.log("user.displayName", user.displayName);
          FBCurrentUser = user;
          // {
          //     displayName: user.displayName,
          //     uid: user.uid,
          //     photoURL: user.photoURL
          // };
          // console.log("FBCurrentUser in getFBCurrentUser return 1**", FBCurrentUser);
          resolve(FBCurrentUser);
        });
      });
    };

    //Checks to see if user is already in Firebase "Users" collection
    const userIsInFirebase = function (uid) {
      //get all known users to check against
      // console.log("URL in userIsInFirebase: ", `${FBCreds.databaseURL}/users.json`);
      return new Promise ((resolve, reject) => {
        let isInFirebase = null;
        $http.get(`${FBCreds.databaseURL}/users.json`)
        .then((data) => {
          // console.log("data from userIsInFirebase", data.data);
          //If there are any users in the db (data.data!== null), then check to see if the passed user is in FB
          if (data.data !== null) {
            let userObjects = data.data;
            console.log("userObjects", userObjects);
            let UIDArray = [];
            Object.keys(userObjects).forEach(function (key) {
              UIDArray.push(userObjects[key].uid);
            });
            // console.log("UIDArray", UIDArray);
            for (let i = 0; i < UIDArray.length; i++) {
              // console.log("UIDArray[i]: ", UIDArray[i], "uid: ", uid);
              if (UIDArray[i] === uid) {
                console.log("userIsInFirebase was true with value: ", uid);
                isInFirebase = true;
                break;
              } else {
                console.log("userIsInFirebase was false with value: ", uid);
                isInFirebase = false;
              }
            }
          } else {
            isInFirebase = false;
          }
          resolve(isInFirebase);
        });
      });
    };

    // Adds a user to Firebase Users collection.  Expects a preformed user object that gets made in getFBCurrentUser.
    const addUserToFirebase = function(userObj){
        let newObj = JSON.stringify(userObj);
        // console.log("URL is: ", `${FBCreds.databaseURL}/users.json`);
        return $http.post(`${FBCreds.databaseURL}/users.json`, newObj)
        .then((data) => {
            // console.log("added user data returned: ", data);
            console.log("user was added to firebase db!");
            return data;

        }, (error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log("error", errorCode, errorMessage);
        });
    };

    const isAuthenticated = function (){
      // console.log("userFactory: isAuthenticated");
      return new Promise ( (resolve, reject) => {
        firebase.auth().onAuthStateChanged( (user) => {
          if (user){
            currentUser = user.uid;
            // console.log("user", user.uid);
            resolve(true);
          }else {
            resolve(false);
          }
        });
      });
    };

    //Set up google auth
    let provider = new firebase.auth.GoogleAuthProvider();

    let authWithProvider= function(){
      return firebase.auth().signInWithPopup(provider);
    };

    return {getCurrentUser, logIn, logOut, register, isAuthenticated, authWithProvider, updateDisplayName, userIsInFirebase, addUserToFirebase, getFBCurrentUser, getCurrentUserFullObj};

  };

  userFactory.$inject = ['$q', '$window', '$location', '$http', 'FBCreds'];
  angular.module("SongSearchApp").factory("userFactory", userFactory);
  
})();
},{}],16:[function(require,module,exports){
(function(){
  "use strict";

  var FBCreds = {
                  apiKey: "AIzaSyAdH1dtT3C5LAtzAj_G2kcCPKq8KxcJ5zo",
                  authDomain: "songsearch-9506f.firebaseapp.com",
                  databaseURL: "https://songsearch-9506f.firebaseio.com"
  };

  angular.module("SongSearchApp").constant("FBCreds", FBCreds);
})();
},{}],17:[function(require,module,exports){
// "use strict";
// require('./fb-creds.js');
},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]);
