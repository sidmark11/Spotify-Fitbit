import React from 'react'
import CardItems from './carditems'
import './cards.css'

function Cards() {
  return (
    <div className='cards'>
      <div className="cards__blog__container">
        <div className="cards__wrapper">
            <ul className="cards__items">
                <CardItems 
                className = 'card1__text'
                text="Imagine a world where your sweat sessions are perfectly synced with the beats that move you. My webapp harmonizes your Fitbit fitness journey with your Spotify soundscapes. Dive into a unique experience where your favorite workouts meet custom-tailored playlists, designed not just to match your activity, but to elevate it. I believe your workouts should be as dynamic and personalized as your music taste. Whether you're sprinting, lifting, hiking, or practicing yoga, my webapp crafts the ultimate playlist for your session. Drawing from your top artists and listening history on Spotify, the algorithm analyzes your specified Fitbit activity data to match the intensity of your workout, ensuring every beat drops right when you need that extra push."
                label='Try now'
                path='/playlists'
                badge_text='Try now'
                />
                <CardItems 
                className = 'card2__text'
                text="**Here's how it works:
**1. Log In Seamlessly: Securely connect your Fitbit and Spotify accounts.
**2. Hit 'Create Playlists' at the top of the screen.
**3. Choose Your Activity: Select one of your favorite workouts recorded on Fitbit. 
**4. Customize Your Playlist: Pick your preferred genres (up to 2).
**5. Name Your Playlist: Give your new workout playlist a name.
**6. Check Your Spotify Account: Hit 'create' and a new playlist will be waiting in your Spotify account." 
                label='Currently Developing'
                path='/playlists'
                badge_text='Currently Developing'
                />
            </ul>
        </div>
      </div>
    </div>
  );
}

export default Cards
