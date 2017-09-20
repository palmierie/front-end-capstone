"use strict";

const app = angular.module("SongSearchApp", ["ngRoute", "ngMaterial", "ui.bootstrap"]);

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



app.config(($routeProvider) => {
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


app.run(($location, FBCreds) => {
	let creds = FBCreds;
	let authConfig = {
		apiKey: creds.apiKey,
		authDomain: creds.authDomain,
		databaseURL: creds.databaseURL
	};

	firebase.initializeApp(authConfig);
});


  

// // example of $rootScope
// app.run(function($rootScope){
// 	$rootScope.showSearch = false;
// });

