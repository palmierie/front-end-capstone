"use strict";

app.service("apiSearchService",function($q, $http, $location){

  this.arraySongObjFinal = [];
  //collects all arrays from all functions
  let tempArray = [];

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
  
  //combines Beatport Search for Artist and Track Title
  this.searchBeatport = function(searchInput){
    return $q((resolve, reject)=>{
      var p1 = searchBeatportSongs(searchInput);
      var p2 = searchBeatportArtists(searchInput);

      Promise.all([p1,p2])
        .then((arraySongObj)=>{
          let flattenedArray = [].concat.apply([],arraySongObj);
          this.songArrayFunct(flattenedArray);
          resolve();
        });
    });
  };
  //combines results from all arrays
  this.songArrayFunct = function(arraySongObj){
    tempArray.push(arraySongObj);
    this.arraySongObjFinal = [].concat.apply([],tempArray);
    console.log('tempArray', tempArray);
    console.log('this.arraySongObjFinal', this.arraySongObjFinal);
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
        let headlinerMCArray = [];
        // console.log('data', result.data);
        let start1 = result.data.indexOf('class="audio_list');
        let end1 = result.data.indexOf('class="search-res');
        let string1 = result.data.slice(start1,end1); 
        //count number of songs to be iterated through
        let array1 = string1.match(/class="artist-name"/g);
        console.log('array1 length', array1.length);
        let stringChopped = string1;

        // BUILD LOOP TO HOLD DATA FROM EACH SONG
        let k = 2;
        for (var i = 0; i < array1.length; i++) {
          let selectedObj = {};
          //get Artist Name
          let startArtist = stringChopped.indexOf('class="artist-name') + 20;
          let endArtist = stringChopped.indexOf('class="song-name') - 11;
          let preArtist = stringChopped.slice(startArtist,endArtist);
            //regex to get and switch & sign
          let artist = preArtist.replace(/&amp;/g, "&").replace(/&#038;/g, "&").replace(/&#8217;/g, "'").replace(/&#8216;/g, "‘");

          //get Song Title
          let startSong = stringChopped.indexOf('class="song-name') + 26;
          let endSong = stringChopped.indexOf('class="rating-audio') - 26;
          let preSong = stringChopped.slice(startSong,endSong); 
            //filter out exclusive div content to fix end slice point
          if(preSong.includes('class="audio-hmc') === true){
            let preSongEnd = preSong.indexOf('class="audio-hmc') - 26;
            preSong = preSong.slice(0,preSongEnd);
          }
            //regex to get and switch & sign
          let song = preSong.replace(/&amp;/g, "&").replace(/&#038;/g, "&").replace(/&#8217;/g, "'").replace(/&#8216;/g, "‘");

          //get Release Date
          let startRDate = stringChopped.indexOf('class="add-date') + 49;
          let endRDate = stringChopped.indexOf('class="download-version') - 29;
          let releaseDateUnordered = stringChopped.slice(startRDate,endRDate);
          //format date to match other databases
          let month = releaseDateUnordered.slice(0,2);
          let day = releaseDateUnordered.slice(3,5);
          let year = releaseDateUnordered.slice(6);
          let releaseDate = `${year}-${month}-${day}`;
          //get Buy Link
          let startBuyLink = stringChopped.indexOf('data-audio_file=') + 17;
          let endBuyLink = stringChopped.indexOf('</div></li>') - 2;
          let buyLink = stringChopped.slice(startBuyLink,endBuyLink);

          // CHOP stringChopped AFTER SONG
          let chopStrStart = stringChopped.indexOf(`src="https://headlinermusicclub.com/blank.mp3?_=${k}"`);
          stringChopped = stringChopped.slice(chopStrStart);
          
          //build song obj
          selectedObj.artistName = artist;
          selectedObj.trackCensoredName = song;
          selectedObj.trackLength = "not listed";
          selectedObj.releaseDate = releaseDate;
          selectedObj.trackViewUrl = buyLink;
          selectedObj.database = "H. M. C.";

          headlinerMCArray.push(selectedObj);
          k++;  
        }
        console.log('headlinerMCArray',headlinerMCArray);
        this.songArrayFunct(headlinerMCArray);
        resolve();
      });
    });
  };  //End Function searchHeadlinerMusicClub
  
});