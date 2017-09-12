"use strict";

const app = angular.module("ManterestApp", ["ngRoute"]);

let isAuth = (userFactory) => new Promise ( (resolve, reject) => {
  console.log("userFactory is", userFactory);
  userFactory.isAuthenticated()
  .then( (userExists) => {
    if(userExists){
      console.log("Authentication Success");
      resolve();
    }else {
      console.log("Authentication reject");
      reject();
    }
  });
});



app.config(($routeProvider) => {
	$routeProvider
	.when('/', {
		templateUrl: 'partials/home.html',
		controller: 'homeCtrl',
		resolve: {isAuth}
	})
	.when('/login',{
		templateUrl: 'partials/user.html',
		controller: 'userCtrl'
	})
	.when('/home', {
		templateUrl: 'partials/home.html',
		controller: 'homeCtrl',
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

