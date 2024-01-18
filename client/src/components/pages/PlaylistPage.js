import React, { useState } from 'react'
import axios from 'axios';

function PlaylistPage() {
    const [workout_heart_rates, set_workout_heart_rates] = useState();
    const [genres_arr, set_genres_arr] = useState();
    const [preferred_genres, set_preferred_genres] = useState([]);
    const [favorite_workouts, set_favorite_workouts] = useState();
    const [selected_workout, set_selected_workout] = useState();    
    const [playlist_name, set_playlist_name] = useState();

    function update_preferred() {
        var inputText = document.getElementById("inputGenre").value;
        let temp;
        if (genres_arr.includes(inputText)) {
            if (preferred_genres.length > 1) {
                if(!preferred_genres.includes(inputText)) {
                    temp = [preferred_genres[1], inputText];
                }
                else {
                    temp = [...preferred_genres];
                }
                
            }
            else {
                temp = [...preferred_genres];
                if(!preferred_genres.includes(inputText)) {
                    temp.push(inputText);
                }
            }
            set_preferred_genres(temp);
            console.log(preferred_genres);
        }
    }

    function update_selected_workout() {
        var inputText = document.getElementById("Workout").value;
        if (favorite_workouts.includes(inputText)) {
            set_selected_workout(inputText);
        }
    }

    function update_playlist_name() {
        var inputText = document.getElementById("playlistName").value;
        set_playlist_name(inputText);
    }

    async function workout_hr() {
         if (localStorage.getItem('fitbit_access_token')) {
            let access_token = localStorage.getItem('fitbit_access_token');
            console.log('fitbit token:');
            console.log(access_token);
            try {
                const response = await axios.get('http://localhost:8888/fitbittest', {
                    headers: {
                        token: access_token
                    }
                });
                console.log('results:');
                console.log(response.data);
                set_favorite_workouts(Object.keys(response.data));
                set_workout_heart_rates(response.data);
            }
            catch (error) {
                console.log(error);
            }
        }
    }
    

    // gets an array of available genres from spotify and stores them in an array
    async function genres() {
        try {
            let access_token = localStorage.getItem('spotify_access_token');
            console.log('spotify token:')
            console.log(access_token);
            const response = await axios.get('http://localhost:8888/spotifygenre', {
                headers: {
                    token: access_token
                }
            });
            set_genres_arr(response.data.genres); 
        }
        catch (error) {
            console.log(error);
            return;
        }
    }

    async function artists () {
        try {
            if(preferred_genres && selected_workout && playlist_name) {
                console.log(typeof preferred_genres);
                console.log(preferred_genres);
                const response = await axios.get('http://localhost:8888/spotifyartist', {
                    headers: {
                        genres: preferred_genres,
                        playlist_name: playlist_name,
                        bpm: workout_heart_rates[selected_workout]
                    }
                });
                set_genres_arr(response.data.genres); 
                console.log('done');
            }
            else {
                throw new Error("Select at least one genre and specify the workout");
            }
        }
        catch (error) {
            console.log(error);
            return;
        }
    }

    function trigger() {
        workout_hr();
        genres();
    }

    return (
        <div>
            <p>{JSON.stringify(workout_heart_rates, null, 2)}</p>
            {genres_arr && favorite_workouts ? (
                <div>
                    <div>
                        <label htmlFor="inputField">Select a genre:</label>
                        <input type="text" id="inputGenre" list="genreslist" name="chosenOption" placeholder='Ex: acoustic'/>
                        <datalist id="genreslist">
                            {genres_arr.map((genre, index) => (
                            <option key={index} value={genre} />
                            ))}
                        </datalist>
                        <button onClick={update_preferred}>Submit Genre</button>

                        <input type="text" name="chosenOption" id="Workout" placeholder='Ex: running' list="favoriteWorkouts"/>
                        <datalist id="favoriteWorkouts">
                            {favorite_workouts.map((workout, index) => (
                                <option key={index} value={workout} /> 
                            ))}
                        </datalist>
                        <button onClick={update_selected_workout}>Submit Workout</button>

                        <input type="text" id="playlistName" name="inputtedPlaylist" placeholder='Playlist Name'/>
                        <button onClick={update_playlist_name}>Submit Playlist</button>
                    </div>
                    <div>
                        <button onClick={artists}>Get Playlist</button> 
                    </div>
                </div>                
            ) : (
                <div>
                    <button onClick={trigger}>Start</button>
                </div>
            )}
            <p>{preferred_genres}</p>
            <p>{selected_workout}</p>
            <p>{playlist_name}</p>
        </div>
     )
}

export default PlaylistPage;
