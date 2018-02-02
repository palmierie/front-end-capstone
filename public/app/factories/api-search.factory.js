(function(){
  'use strict';

  var apiSearchService = function($q, $http, $location){

    // master array that is to be displayed
    this.arraySongObjFinal = [];

    //collects all arrays from all functions - to be reset after searches are complete (from nav controller)
    let tempArray = [];
    // reset tempArray
    this.clearTempArray = function(){
      tempArray = [];
    };

    //Toggle to true when to display results - to be reset to false after searches are complete (from search controller)
    this.resultsDone = false;
    // reset resultsDone boolean
    this.initResultsDone = function(){
      this.resultsDone = false;
    };

    //Toggle to false when  -- FINISH
    this.pageRefresh = true;
    this.changePageRefreshBoolean = function(){
      this.pageRefresh = false;
    };
    this.initPageRefreshBoolean = function(){
        this.pageRefresh = true;
    };


    //resolves that happened
    let numberOfResolves = 0;
    //number of calls init
    let numberOfCalls = null;
    //sets number of calls to be made
    this.numberOfCalls = function(number){
      numberOfCalls = number;
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
          this.songArrayFunct(flattenedArray);
          resolve();
        });
      });
    };
    
    //combines Beatport Search for Artist and Track Title
    this.searchBeatport = function(searchInput){
      return $q((resolve, reject)=>{
        // TURN THESE ON AND OFF DURING TESTING
        var p1 = searchBeatportSongs(searchInput);
        // var p1 = [];
        var p2 = searchBeatportArtists(searchInput);
        // var p2 = [];

        Promise.all([p1,p2])
        .then((arraySongObj)=>{
          let flattenedArray = [].concat.apply([],arraySongObj);
          ++numberOfResolves;
          this.songArrayFunct(flattenedArray);
          resolve();
        });
      });
    };
    
    //combines results from all arrays
    this.songArrayFunct = function(arraySongObj){
      tempArray.push(arraySongObj);
      this.arraySongObjFinal = [].concat.apply([],tempArray);
      // sets resultsDone boolean to true if numberOfCalls number matches the numberOfResolves number
      this.resultsDone = numberOfCalls === numberOfResolves ? true : false;
      if (this.resultsDone === true){
        numberOfResolves = 0;
      }
      return this.arraySongObjFinal;
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

          // // WORK STARTS HERE 
          // let thang = $("<div>").html(result.data).text();
          // let newthang = $(thang).find("script");
          // console.log("check ma thang", newthang);
          // // WORK STARTS HERE ^

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
          let string4 = `{${string3}}`;
          let jsonObj = JSON.parse(string4);
          let tracksObjArr = jsonObj.tracks;
          // if no results are found, array length will be 0 - return nothing
          if (tracksObjArr.length !== 0){
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
          }
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
        $http.get(`https://www.beatport.com/search/?q=${search}`)
        .then((result)=>{
          let artistLink = false;
          //get artist link
          let artistDiv = $("<div>").html(result.data)[0].getElementsByClassName('bucket artists')[0];
          // if artist div exists then get artist link or else search for releases div
          if(artistDiv!== undefined){
            let artistListItem = $(artistDiv).find('li')[0];
            artistLink = $(artistListItem).find('a').attr('href');
          } else {
            let releasesDiv = $("<div>").html(result.data)[0].getElementsByClassName('bucket releases')[0];
            // if releases div exists then get artist link
            if (releasesDiv !== undefined) {
              let releaseArtistArr = $(releasesDiv).find('p.release-artists').children();
              // loop through array of <a>'s and check if the <a> contains the search term
              for (let i = 0; i < releaseArtistArr.length; i++) {
                let aTag = $("<div>").html(releaseArtistArr[i])[0];
                let text = $(aTag).find('a').text();
                // if the search term is contained, get the artist link url and break the loop
                if (search.toLowerCase().includes(text.toLowerCase())) {
                  artistLink = $(aTag).find('a').attr('href');
                  break;
                }
              }
            }
          }
          resolve(artistLink);
        });
      });
    } // End function searchBpArtistLink

    function searchBeatportArtists(search){
      return $q((resolve, reject)=>{
        searchBpArtistLink(search)
        .then((artistLink)=>{
          var artistBeatportArray = [];
          // if there artist is artist is found, then search for tracks
          if(artistLink){
            let bpTrackUrl = 'https://www.beatport.com/track/';
            
            $http.get(`https://www.beatport.com${artistLink}/tracks?per-page=50`)
            .then((artistResult)=>{
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
              let string4 = `{${string3}}`;
              let jsonObj = JSON.parse(string4);
              let tracksObjArr = jsonObj.tracks;
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
              resolve(artistBeatportArray);
            });
          } else {
            // empty array
            resolve(artistBeatportArray);
          }
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