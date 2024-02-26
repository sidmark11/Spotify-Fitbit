import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <div>
      <nav className="navbar"> 
        <div className="navbar-container">
          <ul className='nav-menu'>
            <li className='nav-item'>
              <Link to='/' className='nav-links'>
                Home
              </Link>
            </li>
            <li className='nav-item'>
              <Link to='/playlists' className='nav-links'>
                Create Playlists
              </Link>
            </li>
            <li className='nav-item'>
              <Link to='https://fitmixer-stg-6208d896f43c.herokuapp.com/spotifylogin' className='nav-links'>
                Spotify Login
              </Link>
            </li>
            <li className='nav-item'>
              <Link to='https://fitmixer-stg-6208d896f43c.herokuapp.com/fitbitlogin' className='nav-links'>
                Fitbit Login
              </Link>
            </li>
          </ul>
          <div>
          </div>        
        </div>
      </nav>
    </div>
  )
}

export default Navbar