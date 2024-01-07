import React from 'react'
import axios from 'axios';

function PlaylistPage() {
    // getting data from api should be async or else you'll call empty container rather than waiting for the data to be collected
    async function get_user_data() {
        if (localStorage.getItem('fitbit_access_token')) {
            let access_token = localStorage.getItem('fitbit_access_token');
            try {
                const response = await axios.get('http://localhost:8888/fitbituser', {
                    headers: {
                        token: access_token
                    }
                });
                console.log('results:');
                console.log(response.data);
            }
            catch (error) {
                console.log(error);
            }
        }
    }

    // successfully grabs a given user's fitbit favorites
    async function get_fav_workouts() {
         if (localStorage.getItem('fitbit_access_token')) {
            let access_token = localStorage.getItem('fitbit_access_token');
            try {
                const response = await axios.get('http://localhost:8888/fitbitfavorites', {
                    headers: {
                        token: access_token
                    }
                });
                console.log('results:');
                console.log(response.data);
            }
            catch (error) {
                console.log(error);
            }
        }
    }

    async function get_activities_data() {
         if (localStorage.getItem('fitbit_access_token')) {
            let access_token = localStorage.getItem('fitbit_access_token');
            try {
                const response = await axios.get('http://localhost:8888/fitbitactivities', {
                    headers: {
                        token: access_token
                    }
                });
                console.log('results:');
                // response.data is a JSON and its activities prop is an array of the different workouts in JSON format
                // activities arr pulls the array of JSON activities out, from which we can filter based on the different favorite activities
                const activities_arr = response.data.activities;
                // filtered_arr then becomes an array of JSON activities with the activityName "Walk"
                const filtered_arr = activities_arr.filter(obj => obj.activityName === "Walk");
                console.log(filtered_arr);
                // console.log(response.data);
            }
            catch (error) {
                console.log(error);
            }
        }
    }

    return (
        <div>
            <button onClick={get_user_data}>User</button>
            <button onClick={get_fav_workouts}>Favorites</button>
            <button onClick={get_activities_data}>Activities</button>
        </div>
     )
}

export default PlaylistPage;
