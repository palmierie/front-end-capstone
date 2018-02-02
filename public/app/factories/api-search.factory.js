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

    //Toggle to false when page is loaded from navigation search
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
        var p1 = searchBeatportSongs(searchInput);
        var p2 = searchBeatportArtists(searchInput);

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
    }

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

    // BEATPORT - create JSON object and return tracks array for beatport search functions
    // returns array of objects
    function beatportJSON(responseData) {
      let resultDiv = $("<div>").html(responseData)[0];
      let resultJsonDiv = $(resultDiv).find("#data-objects")[0];
      let x =  $(resultJsonDiv).text();  // changes jQuery Html Script Element Object to string
      // chops string to allow results to be parsed as valid JSON
      let resultsForJsonObj = x.slice(x.indexOf('"tracks":'),(x.indexOf('window.Sliders') - 12));
      let jsonObj = JSON.parse(`{${resultsForJsonObj}}`);
      return jsonObj.tracks;
    }

    // BEATPORT - create array of objects for beatport search functions
    // returns array of formatted objects
    function beatportSongArrayBuilder(tracksArray) {
      let returnArray = [];
      let bpTrackUrl = 'https://www.beatport.com/track/';
      for (var i = 0; i < tracksArray.length; i++) {
        let selectedObj = {};
        let artistNames = [];
        for (var k = 0; k < tracksArray[i].artists.length; k++) {
          artistNames.push(tracksArray[i].artists[k].name);
        }
        selectedObj.artistName = artistNames.join(', ');
        selectedObj.trackCensoredName = tracksArray[i].title;
        selectedObj.trackLength = tracksArray[i].duration.minutes;
        selectedObj.releaseDate = tracksArray[i].date.released;
        selectedObj.trackViewUrl = `${bpTrackUrl}${tracksArray[i].slug}/${tracksArray[i].id}`;
        selectedObj.database = "Beatport";

        returnArray.push(selectedObj);
      }
      return returnArray;
    }

    // BEATPORT - gets rid of image and SVG requests by page
    // returns string with replaced img & svg links
    function cancelImageRequests(rawData) {
       return rawData.data.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function (match, capture) {return "<img no_load_src=\"" +capture+ "\" />";}).replace(/<use [^>]*>/gi, function (match, capture) {return "<use no_load_src=\"" +capture+ "\" />";});
    }

    // Search for songs within Beatport
    // search (String): The search query
    // returns: Promise
    function searchBeatportSongs(search){
      return $q((resolve, reject)=>{
    
        var songBeatportArray = [];
      
        $http.get(`https://www.beatport.com/search/tracks?q=${search}&per-page=50`)
        .then((data)=>{
          // Get rid of requests for images
          let result = cancelImageRequests(data);
          //  chop & format data into JSON Object
          let tracksObjArr = beatportJSON(result);
          // if no results are found, array length will be 0 - return nothing
          if (tracksObjArr.length !== 0){
            songBeatportArray = beatportSongArrayBuilder(tracksObjArr);
          }
          resolve(songBeatportArray);
        });

      });
    }

    // Gets Artist Link URL from Beatport Search
    // returns: Promise
    function searchBpArtistLink(search){
      return $q((resolve, reject)=>{
        // var headers = {
        // 	'Access-Control-Allow-Origin' : '*'
        //  // 'Access-Control-Allow-Methods' : 'GET',
        //  // "cache-control": "no-cache",
        //  // "postman-token": "00a2f541-2236-a387-e9a6-c2329912a03f"
        // };
        $http.get(`https://www.beatport.com/search/?q=${search}`)
        .then((data)=>{
          // Get rid of requests for images
          let result = cancelImageRequests(data);

          let artistLink = false;
          //get artist link
          let artistDiv = $("<div>").html(result)[0].getElementsByClassName('bucket artists')[0];
          // if artist div exists then get artist link or else search for releases div
          if(artistDiv!== undefined){
            let artistListItem = $(artistDiv).find('li')[0];
            artistLink = $(artistListItem).find('a').attr('href');
          } else {
            let releasesDiv = $("<div>").html(result)[0].getElementsByClassName('bucket releases')[0];
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
    }

    // Searches Beatport by artist
    // returns: resolved array of Objects
    function searchBeatportArtists(search){
      return $q((resolve, reject)=>{
        searchBpArtistLink(search)
        .then((artistLink)=>{
          var songBeatportArray = [];
          // if there artist is artist is found, then search for tracks
          if(artistLink){
            $http.get(`https://www.beatport.com${artistLink}/tracks?per-page=50`)
            .then((data)=>{
              // Get rid of requests for images
              let result = cancelImageRequests(data);
              //  chop & format data into JSON Object
              let tracksObjArr = beatportJSON(result);
              if (tracksObjArr.length !== 0){
                songBeatportArray = beatportSongArrayBuilder(tracksObjArr);
              }
              resolve(songBeatportArray);
            });
          } else {
            // empty array
            resolve(songBeatportArray);
          }
        });
      });
    }

    this.searchHeadlinerMusicClub = function(search){
      return $q((resolve, reject)=>{
        $http.get(`https://headlinermusicclub.com/?s=${search}&post_type=audio`)
        .then((data)=>{
          // Get rid of requests for images
          let result = cancelImageRequests(data);

          let dataObj = $('<div>').html(result)[0].getElementsByClassName('audio_list')[0];
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