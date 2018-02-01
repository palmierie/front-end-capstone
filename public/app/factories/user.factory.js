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
        $http.get(`${FBCreds.databaseURL}/users/.json?orderBy="uid"&equalTo="${uid}"`)
        .then((data) => {
          currentUserFullObj = data.data;
          let objectArr = [];
            Object.keys(currentUserFullObj).forEach(function (key) {
                objectArr.push(currentUserFullObj[key]);
            });
          currentUserFullObj = objectArr[0];
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
      return firebase.auth().signOut()
      .then(()=>{
        $window.location.reload();
        $location.url("#!/");
      });

    };

    const register = function(userObj){
      return firebase.auth().createUserWithEmailAndPassword(userObj.email, userObj.password)
      .catch((error)=>{
        let errorCode = error.code;
        let errorMessage = error.message;
        console.log("error registering ", errorCode, errorMessage);
        alert(`Error Registering: ${errorCode} : ${errorMessage}`);
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
      return new Promise ((resolve, reject) => {
        firebase.auth().onAuthStateChanged( (user) => {
          FBCurrentUser = user;
          resolve(FBCurrentUser);
        });
      });
    };

    //Checks to see if user is already in Firebase "Users" collection
    const userIsInFirebase = function (uid) {
      //get all known users to check against
      return new Promise ((resolve, reject) => {
        let isInFirebase = null;
        $http.get(`${FBCreds.databaseURL}/users.json`)
        .then((data) => {
          //If there are any users in the db (data.data!== null), then check to see if the passed user is in FB
          if (data.data !== null) {
            let userObjects = data.data;
            let UIDArray = [];
            Object.keys(userObjects).forEach(function (key) {
              UIDArray.push(userObjects[key].uid);
            });
            for (let i = 0; i < UIDArray.length; i++) {
              if (UIDArray[i] === uid) {
                isInFirebase = true;
                break;
              } else {
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

    // Adds a user to Firebase Users collection.  Expects a preformed user object.
    const addUserToFirebase = function(userObj){
        let newObj = JSON.stringify(userObj);
        return $http.post(`${FBCreds.databaseURL}/users.json`, newObj)
        .then((data) => {
            return data;
        }, (error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log("error adding user to firebase database ", errorCode, errorMessage);
        });
    };

    const isAuthenticated = function (){
      return new Promise ( (resolve, reject) => {
        firebase.auth().onAuthStateChanged( (user) => {
          if (user){
            currentUser = user.uid;
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