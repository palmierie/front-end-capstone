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
      // console.log('tempArray', tempArray);
      // console.log('this.arraySongObjFinal', this.arraySongObjFinal);
      this.resultsDone = numberOfCalls===numberOfResolves ? true : false;
      if (this.resultsDone === true){
        numberOfResolves = 0;
      }
      // console.log('results done in api Service', this.resultsDone);
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
        
          let dataObj = $('<div>').html(result.data)[0].getElementsByClassName('audio_list')[0];
          let artistDivArr = dataObj.getElementsByClassName('artist-name');
          let songDivArr = dataObj.getElementsByClassName('song-name');
          let releaseDateDivArr = dataObj.getElementsByClassName('add-date');
          let buyLinkDivArr = dataObj.getElementsByClassName('song-player amusic-song-player  song-player--0 audio-player-wrapper');
          
          let masterArrLength = artistDivArr.length;
          // final array
          let headlinerMCArray = [];
          // arrays to be iterated through and pushed into selectedObj
          let artistArr = [];
          let songArr = [];
          let releaseDateArr = [];
          let buyLinkArr = [];
          
          //build array of artist names
          for (let a = 0; a < masterArrLength; a++) {
            let artistNameDiv = $(artistDivArr)[a];
            let artist = $(artistNameDiv).text();
            artistArr.push(artist);
          }
          
          // build array of song names
          for (let s = 0; s < masterArrLength; s++) {
            let songNameDiv = $(songDivArr)[s];
            // get song from child elements and trim whitespace
            let song = $(songNameDiv).find('h3').text().trim();
            songArr.push(song);
          }
          
          // build array of release dates
          for (let r = 0; r < masterArrLength; r++) {
            let releaseDateDiv = $(releaseDateDivArr)[r];
            let relDateAndTextDiv = $(releaseDateDiv).text().trim();
            // remove span tag text - "Added:"
            let releaseDateUnordered = relDateAndTextDiv.slice(6).trim();
            //format date to match other databases
            let month = releaseDateUnordered.slice(0,2);
            let day = releaseDateUnordered.slice(3,5);
            let year = releaseDateUnordered.slice(6);
            let releaseDate = `${year}-${month}-${day}`;
            releaseDateArr.push(releaseDate);
          }
          
          // build array of buylinks
          for (let b = 0; b < masterArrLength; b++) {
            let buyLinkDiv = $(buyLinkDivArr)[b];
            let buyLink = $(buyLinkDiv).attr('data-audio_file');
            buyLinkArr.push(buyLink);
          }
          
          for (let i = 0; i < masterArrLength; i++) {
            //new object to be pushed to headlinerMCArray
            let selectedObj = {};
            //build song obj
            selectedObj.artistName = artistArr[i];
            selectedObj.trackCensoredName = songArr[i];
            selectedObj.trackLength = "not listed";
            selectedObj.releaseDate = releaseDateArr[i];
            selectedObj.trackViewUrl = buyLinkArr[i];
            selectedObj.database = "H. M. C.";
            headlinerMCArray.push(selectedObj);
          }
          
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