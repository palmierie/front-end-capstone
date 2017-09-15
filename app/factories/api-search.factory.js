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
      var p1 = searchiTunesSongs(searchInput);
      var p2 = searchiTunesArtists(searchInput);

      Promise.all([p1,p2])
        .then((arraySongObj)=>{
          let flattenedArray = [].concat.apply([],arraySongObj);
          this.songArrayFunct(flattenedArray);
          resolve();
        });
    });
  };

  this.songArrayFunct = function(arraySongObj){
    this.arraySongObjFinal = arraySongObj;
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
  }

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
  }

  // this.searchBeatport = function(searchInput){
  //   return $q((resolve, reject)=>{
  //     var p1 = searchBeatportSongs(searchInput);
  //     var p2 = searchBeatportArtists(searchInput);

  //     Promise.all([p1,p2])
  //       .then((arraySongObj)=>{
  //         let flattenedArray = [].concat.apply([],arraySongObj);
  //         this.songArrayFunct(flattenedArray);
  //         resolve();
  //       });
  //   });
  // };

  // this.songArrayFunct = function(arraySongObj){
  //   this.arraySongObjFinal = arraySongObj;
  //   return this.arraySongObjFinal;
  // };



  this.searchBeatport = function(search){
    return $q((resolve, reject)=>{
      // var headers = {
			// 	'Access-Control-Allow-Origin' : '*'
      //  // 'Access-Control-Allow-Methods' : 'GET',
      //  // "cache-control": "no-cache",
      //  // "postman-token": "00a2f541-2236-a387-e9a6-c2329912a03f"
      // };
      var songBeatportArray = [];
      let bpTrackUrl = 'https://www.beatport.com/track/';
      
      $http.get(`https://www.beatport.com/search/tracks?q=${search}&per-page=50`)
      .then((result)=>{
      //console.log('back from search bp', result.data);
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
      function artistNameGrab(){

      }

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
        
       this.arraySongObjFinal = this.arraySongObjFinal.concat(songBeatportArray);
      resolve(this.arraySongObjFinal);
      });


    });
  };
});