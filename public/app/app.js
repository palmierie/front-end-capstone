"use strict";

angular.module("SongSearchApp", ["ngRoute", "ngMaterial", "ui.bootstrap"]);

let isAuth = (userFactory) => new Promise ( (resolve, reject) => {
  userFactory.isAuthenticated()
  .then( (userExists) => {
    if(userExists){
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