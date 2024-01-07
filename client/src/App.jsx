import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Navbar from "./components/Navbar.js";
import LoginPage from './components/pages/LoginPage.js';
import PlaylistPage from './components/pages/PlaylistPage.js';
import { useState, useEffect } from 'react';



function App() {
  // NEED TO GET FITBIT IN BACKEND AS WELL SO WE CAN TRIGGER LOG IN USING AN AXIOS REQ FROM HERE AND IF SUCCESSFUL THEN CHANGE LOG IN STATE
    // NO NEED TO KEEP CHECKING URL AND CAUSE RE-RENDERS
  // UNTIL THEN, USE LOCAL STORAGE AND PLAY AROUND WITH REQS
  const[fitbit_access_token, set_fitbit_access_token] = useState("empty"); // because this is hard-coded, state is being reset with every re-render 
  const[spotify_access_token, set_spotify_access_token] = useState("empty"); // we need to avoid full page re-renders by getting rid of window.location=...how 

  const[fitbit_loggedin, set_fitbit_loggedin] = useState(false);
  const[spotify_loggedin, set_spotify_loggedin] = useState(false);

  // will need to add a dependency such that this is only triggered when spotify auth is initiated
    // or else we'll mix up the fitbit and spotify authentication processes
      // now we have a conditional that only triggers if we're at the spotify login
  useEffect(() => {
    // window.location.hash gives everything in the URL after the # (which is the access token in our case)
    if(window.location.pathname === '/fitbitlogin') { 
      if (window.location.hash) {
        let hash = window.location.hash;
        let token = hash.split('=')[1].split('&')[0];
        localStorage.setItem('fitbit_access_token', token);
        set_fitbit_access_token(token);  
        set_fitbit_loggedin(true);   
        console.log("fitbit token: ");
        console.log(fitbit_access_token);   
      //window.location.hash = ""; triggers a re-render so useEffect is called again and we lose the access token
        // putting the if checks if there even is a hash to read in the first place
        //window.location.hash = "";
        window.location = '/';
      }
    }
    if(window.location.pathname === '/spotifylogin/') {
      //window.location.hash = "";
      let hash = window.location.hash;
      let token = hash.split('=')[1].split('&')[0];
      localStorage.setItem('spotify_access_token', token); // later change this to spotify_logged_in, and set it to true rather than storing the actual token (same for fitbit)
      set_spotify_access_token(token);
      set_spotify_loggedin(true);
      console.log("spotify token: ");
      console.log(spotify_access_token);
      window.location = '/'; // can add a logged in successfully type of page at /spotifylogin/
    }    
  },)

  useEffect(() => {
    if (fitbit_access_token !== "empty") {
      // Perform actions using fitbit_access_token
      console.log("Fitbit access token:", fitbit_access_token);
      // Make API calls or perform other actions with the access token
    }
  }, [fitbit_access_token]);

  useEffect(() => {
    if (spotify_access_token !== "empty") {
      // Perform actions using spotify_access_token
      console.log("Spotify access token:", spotify_access_token);
      // Make API calls or perform other actions with the access token
    }
  }, [spotify_access_token]);



  return (
    <Router>
      {/* <h1>Hi</h1> */}
      <Navbar isFitbit={fitbit_loggedin} isSpotify={spotify_loggedin}/>
      {/* <Home /> */}
      <Routes>
        {/* can add paths to links if they're clicked and because routing is handled at the root, we do
        don't need to do it anywhere else. we can route to elements w certain ids using to="#id"
        or we can go to a specific element using element={<element_name />} --> try using IDs for now, elements
        seem pointless if we're gonna load them on the same page at a lower point. bring me to next idea:
        how to load completely new page? --> can work on that after this tutorial*/}
        <Route path='/' />
        <Route path='/spotifylogin' element={<LoginPage />} />
        <Route path='/fitbitlogin' element={<LoginPage />} />
        <Route path='/playlists' element={<PlaylistPage spotify_token={localStorage.getItem('spotify_access_token')} fitbit_token={localStorage.getItem('fitbit_access_token')} />} />
      </Routes>
    </Router>
  )
}

export default App
