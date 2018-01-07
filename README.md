# Front End Capstone Project

### SongSearch

Built with AngularJS, Browserify, Firebase, Bootstrap, and Materialize, this app allows users to search multiple music databases at once. The app grabs song data from iTunes using the iTunes API, Beatport (online music store) using a custom-built javascript web scraper, and Headliners Music Club (online record pool subscription service) using a custom-built JQuery web scraper. Results are displayed in a list with sort options, buy links, and save options (for signed in users). Signed in users can view a list of saved songs and toggle which music databases to search. With the current version, users must use a CORS Origin blocker, such as Moesif.
[SongSearch](https://songsearch-9506f.firebaseapp.com/)

### Directions for running SongSearch
1. Download or Fork from github.
2. From the command line, npm install inside of the lib directory
``` npm install ```
3. <a href="https://chrome.google.com/webstore/detail/moesif-origin-cors-change/digfbfaphojjndkpccljibejjbppifbc">Install Moesif Origin & CORS Changer</a>
4. Make Sure CORS Changer Plugin Option for Access-Control-Allow-Credentials: is set to ```false```
 

#### special thanks to Matt, Ted, Casey, Jisie, and Brenda
