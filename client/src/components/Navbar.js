import React, {useState, useEffect} from 'react'
// state: tells us what the variables are set to for a specific component
  // state is similar to session except state is local to each component whereas
  // session is user-specific and maintained acrosss the entire application
  // lastly, useState must be used inside of a component (function Navbar() creates a component)
import { Link } from 'react-router-dom'
// Link replaces <a> tags in HTML and helps with navigating single page apps or navigating within a single page
import { Button } from './button.js'
//importing css file automatically styles the elements specified in the css file
import './Navbar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';




function Navbar(props) {
  // sets state for click variable so we track when buttons along the navbar have been clicked
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);

  // if the menu button is clicked then we toggle between true and false
  const handleClick = () => setClick(!click);
  // if an actual link on the menu is clicked then we always set to false
  const closeMobileMenu = () => setClick(false);
  // when click is false, the menu should be closed

  //to change state of setButton when the window width is too small (less than 960px)
  const showButton = () => {
    if(window.innerWidth <= 960) {
      setButton(false)
    } else {
      setButton(true)
    }
  }

  console.log(props);
  //useEffect allows us to run side effects (additional logic) 
    //when certain dependencies (conditions) are met
    //Ex: an empty array means only when a component is rendered (page is opened or refreshed or component is reloaded, etc)
      //[click] would mean to run the logic when the value/state of click changes
      //[ ,click] would mean any time we render or any time click changes 
      // and you can refer to the new state of click in the logic
  //this means to run showButton() any time the page is opened up or refreshed
  useEffect(() => {
    showButton()
  }, [])

  //any time the window is resized, the showButton function is called
  window.addEventListener('resize', showButton);

  return (
    <div>
      {/* fontawesome key to access different icons and fonts */}
      <script src="https://kit.fontawesome.com/e0fe0a8b26.js" crossorigin="anonymous"></script>
      {/* creatign navbar at top */}
      <nav className="navbar"> 
        <div className="navbar-container">
          <Link to='/' className='navbar-logo' onClick={closeMobileMenu}>
            <FontAwesomeIcon icon={faEnvelope} />
          </Link>
          {/* if the bars are clicked, then click is toggled,
            we can only have the bars display at <= 960px due to smth we put in css (media query)  */}
          <div className="menu-icon" onClick={handleClick}>
            <FontAwesomeIcon icon={click ? faTimes : faBars} />
          </div>
          {/* ul is unordered list where it has li (list elements) in side of it
            and these are displayed in the order they're listed in. each ul here contains a link to a 
            specific part of the page*/}
          {/* if a button on the menu was clicked, then the menu should be on screen, else it should be closed */}
          <ul className={click ? 'nav-menu active' : 'nav-menu'}>
            <li className='nav-item'>
              <Link to='/home' className='nav-links' onClick={closeMobileMenu}>
                Home
              </Link>
            </li>
            <li className='nav-item'>
              <Link to='/playlists' className='nav-links' onClick={closeMobileMenu}>
                Create Playlists
              </Link>
            </li>
            {/* <li className='nav-item'>
              <Link to='/' className='nav-links-mobile' onClick={closeMobileMenu}>
                Sign Up
              </Link>
            </li> */}
            
          </ul>
          <div>
            {props.isSpotify ? ( //spotify_logged_in
              button && <Button buttonStyle='btn--outline'>Logged Into Spotify</Button>
            ) : (
              button && <Button route='http://localhost:8888/spotifylogin' buttonStyle='btn--outline'>Spotify Log In</Button>
            )}
          </div>
          <div>
            break
          </div>
          <div>
            {props.isFitbit ? (
              button && <Button buttonStyle='btn--outline'>Logged Into Fitbit</Button>
            ) : (
              button && <Button route='http://localhost:8888/fitbitlogin' buttonStyle='btn--outline'>Fitbit Log In</Button>
            )}
          </div>
          
          
          {/* if button var is true, then we show the button on screen, else don't show */}
        </div>
      </nav>
    </div>
  )
}

export default Navbar
