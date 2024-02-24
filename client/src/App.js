import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Navbar from "./components/Navbar.js";
import LoginPage from './components/pages/LoginPage.js';
import PlaylistPage from './components/pages/PlaylistPage.js';
import HomePage from './components/pages/HomePage.js';
import { useState, useEffect } from 'react';
import './App.css'


function App() {
  // NEED TO GET FITBIT IN BACKEND AS WELL SO WE CAN TRIGGER LOG IN USING AN AXIOS REQ FROM HERE AND IF SUCCESSFUL THEN CHANGE LOG IN STATE
    // NO NEED TO KEEP CHECKING URL AND CAUSE RE-RENDERS
  // UNTIL THEN, USE LOCAL STORAGE AND PLAY AROUND WITH REQS

  // any time the state changes, we re-render the entire root
  // because we hard code an initial value and have no conditions, they get reset every time
  // going from node back to hear might be causing the re-render ????
  const [log_in, set_log_in] = useState({
    spotify: false,
    fitbit: false
  });

  const [spotifyLoggedIn, setSpotifyLoggedIn] = useState(false);
  const [fitbitLoggedIn, setFitbitLoggedIn] = useState(false);  

  // will need to add a dependency such that this is only triggered when spotify auth is initiated
    // or else we'll mix up the fitbit and spotify authentication processes
      // now we have a conditional that only triggers if we're at the spotify login
  // useEffect(() => {
  //   // window.location.hash gives everything in the URL after the # (which is the access token in our case)
  //   // pathname doesn't include the hash
  //   console.log('fitbit:' + fitbitLoggedIn);
  //   console.log('spotify:' + spotifyLoggedIn);
  //   if(window.location.hash.includes("#access")) { 
  //       let hash = window.location.hash;
  //       let token = hash.split('=')[1].split('&')[0];
  //       localStorage.setItem('fitbit_access_token', token);
  //       // set_log_in({
  //       //   ...log_in, // Spread the current state to keep other properties
  //       //   fitbit: true, // Update the specific property
  //       // });
  //       setFitbitLoggedIn(true);
  //       // set_fitbit_access_token(token);  
  //       // set_fitbit_loggedin(true);   
  //     //window.location.hash = ""; triggers a re-render so useEffect is called again and we lose the access token
  //       // putting the if checks if there even is a hash to read in the first place
  //       //window.location.hash = "";
  //       // window.location = '/'; // this window.location line is why the state isn't saving and is why the navbar buttons don't update
  //       //  need to figure out a different way to do it
  //   }
  //   if(window.location.hash.includes('#spotify')) {
  //     localStorage.setItem('spotify_logged_in', true);
  //       // set_log_in({
  //       //   ...log_in, // Spread the current state to keep other properties
  //       //   spotify: true, // Update the specific property
  //       // });
  //       setSpotifyLoggedIn(true);
  //     // set_spotify_loggedin(true);
  //   }    
  // },[window.location.hash])

//   useEffect(() => {
//   setState(state => ({ ...state, a: props.a }));
// }, [props.a]);

// useEffect(() => {
//   setState(state => ({ ...state, b: props.b }));
// }, [props.b]);

  // setting state inside useEffect is messy, figure this out or even a different way to do it
  useEffect(() => {
    if (window.location.hash.includes("#access")) {
      let hash = window.location.hash;
      let token = hash.split('=')[1].split('&')[0];
      localStorage.setItem('fitbit_access_token', token);
      setFitbitLoggedIn(true);
      console.log('fitbit logged in');
    }
  }, [window.location.hash]);

  useEffect(() => {
    if (window.location.hash.includes('#spotify')) {
      localStorage.setItem('spotify_logged_in', true);
      setSpotifyLoggedIn(true);
      console.log('spotify logged in');
    }
  }, [window.location.hash]);

  return (
    <Router>
      {/* <h1>Hi</h1> */}
        <Navbar isFitbit={fitbitLoggedIn} isSpotify={spotifyLoggedIn}/>
      {/* <Home /> */}
      <Routes>
        {/* can add paths to links if they're clicked and because routing is handled at the root, we do
        don't need to do it anywhere else. we can route to elements w certain ids using to="#id"
        or we can go to a specific element using element={<element_name />} --> try using IDs for now, elements
        seem pointless if we're gonna load them on the same page at a lower point. bring me to next idea:
        how to load completely new page? --> can work on that after this tutorial*/}
        <Route path='/home' element={<HomePage />}/>
        <Route path='/spotifylogin' element={<LoginPage />} />
        <Route path='/fitbitlogin' element={<LoginPage />} />
        <Route path='/playlists' element={<PlaylistPage spotify_token={localStorage.getItem('spotify_access_token')} fitbit_token={localStorage.getItem('fitbit_access_token')} />} />
      </Routes>
    </Router>
  )
}

export default App
