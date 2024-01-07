import React from 'react'
// import axios from 'axios'
// import { useState } from 'react'

function LoginPage() {

  return (
    <div>
      {/* should make this an actual api req soon using axios */}
      <a href="http://localhost:8888/spotifylogin">
        <button>Spotify Log In</button>
      </a>
      <a href="http://localhost:8888/fitbitlogin">
        <button>Fitbit Log In</button>
      </a>
    </div>
  )
}

export default LoginPage
