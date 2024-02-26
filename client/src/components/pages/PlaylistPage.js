import React, { useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import axios from 'axios';
import './PlaylistPage.css'
import Dropdown from '../Dropdown';
import InputField from '../InputField';

function PlaylistPage() {
    const navigate = useNavigate();
    const [workout_heart_rates, set_workout_heart_rates] = useState();
    const [genres_arr, set_genres_arr] = useState();
    const [preferred_genres, set_preferred_genres] = useState([]);
    const [favorite_workouts, set_favorite_workouts] = useState();
    const [selected_workout, set_selected_workout] = useState("'Workout Type'");    
    const [playlist_name, set_playlist_name] = useState("'Playlist Name'");
    const [error_message, set_error_message] = useState("Please log into both Fitbit and Spotify to create a playlist")

    const handleNameChange = (value) => {
        set_playlist_name(value); 
    };

    const handleGenre = (selectedItem) => {
        let temp = []
        if (!preferred_genres.includes(selectedItem)) {
            if (preferred_genres.length > 1) {
                if(!preferred_genres.includes(selectedItem)) {
                    temp = [preferred_genres[1], selectedItem];
                }
                else {
                    temp = [...preferred_genres];
                }
                
            }
            else {
                temp = [...preferred_genres];
                if(!preferred_genres.includes(selectedItem)) {
                    temp.push(selectedItem);
                }
            }
            set_preferred_genres(temp);
        }
    };

    const handleWorkout = (selectedItem) => {
        if (selected_workout !== selectedItem) {
            set_selected_workout(selectedItem);
        }
    };

    async function workout_hr() {
         if (localStorage.getItem('fitbit_access_token')) {
            let access_token = localStorage.getItem('fitbit_access_token');
            try {
                const response = await axios.get('http://localhost:8888/fitbittest', {
                    headers: {
                        token: access_token
                    }
                });
                set_favorite_workouts(Object.keys(response.data));
                set_workout_heart_rates(response.data);
            }
            catch (error) {
                return;
            }
        }
    }
    
    async function genres() {
        try {
            let access_token = localStorage.getItem('spotify_access_token');
            const response = await axios.get('http://localhost:8888/spotifygenre', {
                headers: {
                    token: access_token
                }
            });
            set_genres_arr(response.data.genres); 
        }
        catch (error) {
            return;
        }
    }

    async function artists () {
        try {
            if(preferred_genres.length > 0 && playlist_name !== "'Playlist Name'" && selected_workout !== "'Workout Type'") {
                const response = await axios.get('http://localhost:8888/spotifyartist', {
                    headers: {
                        genres: preferred_genres,
                        playlist_name: playlist_name,
                        bpm: workout_heart_rates[selected_workout]
                    }
                });
                set_genres_arr(response.data.genres); 
                navigate('/');
            }
            else {
                alert("Select at least one genre and specify the playlist name and workout type");
                throw new Error("Select at least one genre and specify the playlist name and workout type");
            }
        }
        catch (error) {
            return;
        }
    }

    function handlePromise(promise) {
        return promise
            .then(data => ({ success: true, data }))
            .catch(error => ({ success: false, error }));
    }

    async function startPlaylist()  {
        const [result1, result2] = await Promise.all([
            handlePromise(workout_hr()),
            handlePromise(genres()),
        ]);

        if (!result1.success || !result2.success) {
            alert('Log into both Spotify and Fitbit to create a playlist');
        } 
    }

    useEffect(() => {
        startPlaylist();
    }, []);

    return (
        <div>
            {genres_arr && favorite_workouts ? (
                <div className='dropdown__container'>
                    <div className='menus'>
                        <Dropdown options={genres_arr} onSelect={handleGenre}/>
                        <InputField placeholder='Playlist Name' onChange={handleNameChange}/>
                        <Dropdown options={favorite_workouts} onSelect={handleWorkout}/>
                        

                    </div>
                    
                    <div className='button__container'>
                        {preferred_genres.length === 1 ? (
                            <button className="submit__button" onClick={artists}>Create new {selected_workout} playlist '{playlist_name}' powered by {preferred_genres} music</button>
                        ) : preferred_genres.length === 2 ? (
                            <button className="submit__button" onClick={artists}>Create new {selected_workout} playlist '{playlist_name}' powered by {preferred_genres.join(' and ')} music</button>
                        ) : (
                            <button className="submit__button" onClick={artists}>Create new {selected_workout} playlist '{playlist_name}'</button> 
                        )}
                        
                    </div>
                </div>                
            ) : (
                <div className='error__text'>{error_message}</div>
            )}
        </div>
     )
}

export default PlaylistPage;
