import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Navbar from "./components/Navbar.js";
import PlaylistPage from './components/pages/PlaylistPage.js';
import HomePage from './components/pages/HomePage.js';
import { useState, useEffect } from 'react';
import './App.css'


function App() {
  const [spotifyLoggedIn, setSpotifyLoggedIn] = useState(false);
  const [fitbitLoggedIn, setFitbitLoggedIn] = useState(false);  

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
        <Navbar isFitbit={fitbitLoggedIn} isSpotify={spotifyLoggedIn}/>
      <Routes>
        <Route path='/' element={<HomePage />}/>
        <Route path='/playlists' element={<PlaylistPage spotify_token={localStorage.getItem('spotify_access_token')} fitbit_token={localStorage.getItem('fitbit_access_token')} />} />
      </Routes>
    </Router>
  )
}

export default App
