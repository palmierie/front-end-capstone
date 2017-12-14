(function(){
	"use strict";

	var userCtrl = function ($scope, $window, userFactory, $location, dbTglFactory) {

		// console.log("userCtrl loaded");

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
				$window.location.href = "#!/";
			});
		}

		firebase.auth().onAuthStateChanged(function(user) {
			if (user) {
				$scope.isLoggedIn = true;
				$scope.$apply();
			} else {
				$scope.isLoggedIn = false;
				$window.location.href = "#!/login";
			}
		});

		$scope.loginGoogle = () => {
			userFactory.authWithProvider()
			.then((result) => {
				let user = result.user.uid;
				$location.path("/home");
				addUser();
				$scope.$apply();
			})
			.catch((error) => {
				let errorCode = error.code;
				let errorMessage = error.message;
				console.log("error with google login", error); 
			});
		};

		// Checks if user exists in firebase, and if not, adds them.
		function addUser(){
			userFactory.getFBCurrentUser()
			.then( (user) => {
				userFactory.userIsInFirebase(user.uid)
				.then((isInFirebase) => {
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
					
							userFactory.addUserToFirebase(userObj);
						}
					}
					//show home view
					$window.location.href = "#!/";
				});
			});
		}

	};

	userCtrl.$inject = ['$scope', '$window', 'userFactory', '$location', 'dbTglFactory'];
	angular.module("SongSearchApp").controller("userCtrl", userCtrl);

})();