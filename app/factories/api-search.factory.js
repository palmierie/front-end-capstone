"use strict";

app.service("apiSearchService",function($q, $http, $location){

  this.arraySongObjFinal = [];

  //var arraySongObj = [];

  // const returnSearch = function(arraySongObj){
  //   $location.url("/searchResult");
  //   console.log('array Song object', arraySongObj);
    
  //   return arraySongObj;
  // };

  //combines iTunes Search for Artist and Track Title
  this.searchiTunes = function(searchInput){
    return $q((resolve, reject)=>{
      console.log('searchiTunes function called', searchInput);
      var p1 = searchiTunesSongs(searchInput);
      var p2 = searchiTunesArtists(searchInput);

      Promise.all([p1,p2])
        .then((arraySongObj)=>{
          console.log('arraaySongObj from promise', arraySongObj);
          let flattenedArray = [].concat.apply([],arraySongObj);
          this.songArrayFunct(flattenedArray);
          resolve();
        });
    });
  };

  this.songArrayFunct = function(arraySongObj){
    this.arraySongObjFinal = arraySongObj;
    console.log('CHECK THIS ONE this.arraySongObjFinal', this.arraySongObjFinal);
    return this.arraySongObjFinal;
    
  };


  // convert times
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
          
        // takes string result and makes JSON object
        //let resultObj = JSON.parse(result);
        let arrResult = result.data.results;
        //console.log('arrResult', arrResult);
        
        for (var i = 0; i < arrResult.length; i++) {
          let selectedObj = {};
          selectedObj.artistName = arrResult[i].artistName;
          selectedObj.trackCensoredName = arrResult[i].trackCensoredName;
          selectedObj.trackLength = convertTrackTimeMilliseconds(arrResult[i].trackTimeMillis);
          selectedObj.releaseDate = arrResult[i].releaseDate.slice(0,10);
          selectedObj.trackViewUrl = arrResult[i].trackViewUrl;

          songSearchiTunesArray.push(selectedObj);
        }
        console.log('arraySongObj', songSearchiTunesArray);  
        resolve(songSearchiTunesArray);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  function searchiTunesArtists(search){
    var songArtistSearchiTunesArray = [];
    return $q((resolve, reject) => {
      $http.get(`https://itunes.apple.com/search?media=music&entity=song&attribute=artistTerm&term=${search}&limit=50`)
        .then((result) => {
          console.log('result from promise', result);
        // takes string result and makes JSON object
        //let resultObj = JSON.parse(result);
        //let arrResult = resultObj.results;
        //console.log('arrResult', arrResult);
        let arrResult = result.data.results;

        for (var i = 0; i < arrResult.length; i++) {
          let selectedObj = {};
          selectedObj.artistName = arrResult[i].artistName;
          selectedObj.trackCensoredName = arrResult[i].trackCensoredName;
          selectedObj.trackLength = convertTrackTimeMilliseconds(arrResult[i].trackTimeMillis);
          selectedObj.releaseDate = arrResult[i].releaseDate.slice(0,10);
          selectedObj.trackViewUrl = arrResult[i].trackViewUrl;

          songArtistSearchiTunesArray.push(selectedObj);
        }
        console.log('arraySongObj Artist', songArtistSearchiTunesArray);
        resolve(songArtistSearchiTunesArray);
      }).catch((error) => {
        reject(error);
      });
    });
  }
});