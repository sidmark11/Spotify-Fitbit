import React, { useState, useEffect } from 'react'
import axios from 'axios';
import './PlaylistPage.css'

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
                console.log(response.data.status)
                if (response.data.status === 400) {
                    const refresh = await axios.get('http://localhost:8888/spotifyrefresh_token')
                    console.log(refresh)
                }
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

    function handlePromise(promise) {
        return promise
            .then(data => ({ success: true, data }))
            .catch(error => ({ success: false, error }));
    }

    async function startPlaylist()  {
        console.log("triggered")
        const [result1, result2] = await Promise.all([
            handlePromise(workout_hr()),
            handlePromise(genres()),
        ]);

        // This part waits until both handlePromise calls are settled.
        if (!result1.success || !result2.success) {
            alert('Log into both Spotify and Fitbit to create a playlist');
        } 
    }

    // empty dependency array means only run on initial mount
    // no dependency means run on initial mount and every re-render
        // unmount happens when we re-render and the new page does not include a component that is currently mounted
    useEffect(() => {
        // Code here runs once after the initial render
        // const starter = async () => {
        //     console.log("inside")
        //     const [result1, result2] = await Promise.all([
        //         handlePromise(workout_hr()),
        //         handlePromise(genres()),
        //     ]);

        //     // This part waits until both handlePromise calls are settled.
        //     if (!result1.success || !result2.success) {
        //         alert('Log into both Spotify and Fitbit to create a playlist');
        //     } 
        // }
        startPlaylist();
    }, []);

    return (
        <div>
            {/* <p>{JSON.stringify(workout_heart_rates, null, 2)}</p> */}
            {genres_arr && favorite_workouts ? (
                <div>
                    <div className='select'>
                        {/* <label htmlFor="inputField">Select a genre:</label> */}
                        {/* <input className="inputField" type="text" id="inputGenre" list="genreslist" name="chosenOption" placeholder='Ex: acoustic'/> */}
                        {/* <datalist className="dropdown" id="genreslist">
                            {genres_arr.map((genre, index) => (
                            <option key={index} value={genre} />
                            ))}
                        </datalist> */}
                        <select className="inputField" onChange={update_preferred} id="inputGenre">
                            <option className='dropdown'>Choose your genere(s)</option>
                            {genres_arr.map((option, index) => {
                                return (
                                    <option key={index}>
                                        {option}
                                    </option>
                                );
                            })}
                        </select>
                        {/* <button className="submit__button" onClick={update_preferred}>Submit Genre</button> */}

                        {/* <input className="inputField" type="text" name="chosenOption" id="Workout" placeholder='Ex: running' list="favoriteWorkouts"/>
                        <datalist className="dropdown" id="favoriteWorkouts">
                            {favorite_workouts.map((workout, index) => (
                                <option key={index} value={workout} /> 
                            ))}
                        </datalist>
                        <button className="submit__button" onClick={update_selected_workout}>Submit Workout</button> */}
                        <select className="inputField" onChange={update_selected_workout} id="Workout">
                            <option className='dropdown'>Select a workout</option>
                            {favorite_workouts.map((option, index) => {
                                return (
                                    <option key={index}>
                                        {option}
                                    </option>
                                );
                            })}
                        </select>

                        <input className="inputField" type="text" id="playlistName" name="inputtedPlaylist" placeholder='Playlist Name'/>
                        <button className="submit__button" onClick={update_playlist_name}>Submit Playlist</button>
                    </div>
                    <div>
                        <button className="submit__button" onClick={artists}>Get Playlist</button> 
                    </div>
                </div>                
            ) : (
                <div className='error__text'>Please log into both Fitbit and Spotify to create a playlist</div>
            )}
            <p className='text'>{preferred_genres}</p>
            <p className='text'>{selected_workout}</p>
            <p className='text'>{playlist_name}</p>
        </div>
     )
}

export default PlaylistPage;
