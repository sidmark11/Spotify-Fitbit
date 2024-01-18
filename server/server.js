/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/documentation/web-api/tutorials/code-flow
 */
var axios = require('axios');
var express = require('express');
var request = require('request');
var crypto = require('crypto');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var spotify_client_id = '1f23b2a56ec84e1f8d92a61f68c696c7'; // your clientId
var spotify_client_secret = '85a4cca80fd54e438c0ce32d31bc8373'; // Your secret
var spotify_redirect_uri = 'http://localhost:8888/spotifycallback'; // Your redirect uri
var spotify_access_token = '';
var spotify_refersh_token = '';

// formatting dates to have as API query parameter when needed
const today = new Date();
const today_year = today.getFullYear();
const today_month = (today.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 because months are zero-based
const today_day = today.getDate().toString().padStart(2, '0');
const todayaFormatted = `${today_year}-${today_month}-${today_day}`;

const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
const tomorrow_year = tomorrow.getFullYear();
const tomorrow_month = (tomorrow.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 because months are zero-based
const tomorrow_day = tomorrow.getDate().toString().padStart(2, '0');
const tomorrowFormatted = `${tomorrow_year}-${tomorrow_month}-${tomorrow_day}`;


const generateRandomString = (length) => {
  return crypto
  .randomBytes(60)
  .toString('hex')
  .slice(0, length);
}

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());


app.get('/spotifylogin', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-read-playback-state user-top-read playlist-modify-public playlist-modify-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: spotify_client_id,
      scope: scope,
      redirect_uri: spotify_redirect_uri,
      state: state
    }));
});

app.get('/spotifycallback', function(req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: spotify_redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + (new Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        
        spotify_access_token = access_token;
        spotify_refresh_token = refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        request.get(options, function(error, response, body) {
          //console.log(body);
        });

        res.redirect('http://localhost:3000/home#spotify')
      } else {
        res.redirect('http://localhost:3000/spotifylogin/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/spotifyrefresh_token', function(req, res) {

  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (new Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')) 
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token,
          refresh_token = body.refresh_token;
      res.send({
        'access_token': access_token,
        'refresh_token': refresh_token
      });
    }
  });
});

const fitbit_client_id = '23RM29';
const fitbit_secret_client = 'c5809c24b7051f017f979ce0b3aa9eec';
const fitbit_redirect_uri = 'http://localhost:3000/home';
const fitbit_auth_endpoint = 'https://www.fitbit.com/oauth2/authorize';
const fitbit_response_type = 'token';
let fitbit_access_token = '';

app.get('/fitbitlogin', function(req, res) {
  res.redirect(`${fitbit_auth_endpoint}?response_type=${fitbit_response_type}&client_id=${fitbit_client_id}&redirect_uri=${fitbit_redirect_uri}&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=86400`);
})

app.get('/spotifygenre', async function(req, res) {
   const received_data = req.body; // data put in the get request from react
  try {
    // making the function aysnc so that it won't continue until we get a response from fitbit
    const spotify_genres = await axios.get('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
      headers: {
        'Authorization': 'Bearer ' + spotify_access_token
      }
    })
    console.log(spotify_genres.data);
    // can't send back JSON with circular reference (prop is prop of itself) so send back .data
    res.send(spotify_genres.data);
  }
  catch (error) {
    console.log(error)
    res.status(500).send('Failed to fetch available genres');
  }
})

app.get('/spotifyartist', async function(req, res) {
  try {
    const spotify_artists = await axios.get('https://api.spotify.com/v1/me/top/artists?limit=100', {
      headers: {
        'Authorization': 'Bearer ' + spotify_access_token
      }
    })
    console.log(spotify_artists.data);
    const artist_data = spotify_artists.data.items;
    const genres_arr = req.headers.genres.split(',');
    let valid_artists = [];

    console.log(typeof genres_arr);
    console.log(genres_arr);
    const max_artists = 5 - genres_arr.length;

   let searchable_genres_arr = genres_arr.map(str => str.replace(/-/g, ' '));
  
    for(let i = 0; i < artist_data.length; i++) {
      if (searchable_genres_arr.some(element => artist_data[i].genres.includes(element)))
      {
        valid_artists.push(artist_data[i].id);
      }
      if (valid_artists.length === max_artists) {
        break;
      }
    }
    console.log(valid_artists);
    const seed_genres = genres_arr.join('%2C');
    const seed_artists = valid_artists.join('%2C');
    const seed_bpm = Math.trunc((req.headers.bpm - 5));
    let seed_energy = (seed_bpm / 180) + 0.075;
    if (seed_energy > 1){
      seed_energy = 1;
    }
    console.log(seed_genres);
    console.log(seed_artists);

    const recommendations = await axios.get(`https://api.spotify.com/v1/recommendations?seed_artists=${seed_artists}&seed_genres=${seed_genres}&target_tempo=${seed_bpm}&target_energy=${seed_energy}&limit=30`, {
      headers: {
        'Authorization': 'Bearer ' + spotify_access_token
      }
    })
    console.log(recommendations.data.tracks);
    console.log("TESTING");
    let user_id = await axios.get(`https://api.spotify.com/v1/me`, {
      headers: {
        'Authorization': 'Bearer ' + spotify_access_token
      }
    })
    console.log(user_id.data);
    user_id = user_id.data.id;
    console.log("USER-ID: ")
    console.log(user_id);

    const playlist_creation_input = {
      name: req.headers.playlist_name,
      description: `New ${req.headers.workout} playlist`,
      public: false
    };
    const playlist = await axios(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + spotify_access_token,
        'Content-Type' : 'application/json'
      }, 
      data: JSON.stringify(playlist_creation_input)
    })

    const playlist_id = playlist.data.id; // playlist id to use when adding songs to playlist

    const song_recommendations = recommendations.data.tracks;
    let uri_seed = [];
    for(let i = 0; i < song_recommendations.length; i++){
      uri_seed.push(song_recommendations[i].uri);
    }

    const playlist_addition_input = {
      uris: uri_seed,
      position: 0
    }

    const add_to_playlist = await  axios(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + spotify_access_token,
        'Content-Type' : 'application/json'
      }, 
      data: JSON.stringify(playlist_addition_input)
    })

    res.send('worked');
  }
  catch (error) {
    console.log(error);
    res.send(error);
  }
})

// 

//  now providing heart rate for some (if you start it from your watch) 
//  have it such that if you can't directly get heart rate then calculate it
app.get('/fitbittest', async function(req, res) {
   const received_data = req.body; 
  try {
    // this segment gets user profile and from there we get the age (we'll use this to calculate the different zones later)
      // we can do all the fitbit stuff here and then redirect to another endpoint in node with headers to pass on the appropriate data
    const user_profile = await axios.get('https://api.fitbit.com/1/user/-/profile.json', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + req.headers.token
      }
    })

    const user_age = user_profile.data.user.age;

    // gets an array of JSON objects with information about users' favorite workouts
    let favorite_activities = await axios.get('https://api.fitbit.com/1/user/-/activities/favorite.json', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + req.headers.token
      }
    })
    favorite_activities = favorite_activities.data;
    let length = favorite_activities.length;
    if (length === 0){
      throw new Error('User has no favorite activities');
    }
    else if (length > 3){
      length = 3;
    }

    const fav_names = new Map();
    for (let i = 0; i < length; i++){
      fav_names.set(favorite_activities[i].name, []); // gets array with top two workout names
    }

    // get the activities data and filter by favorites using the fav_names array
    let fitbit_activities = await axios.get(`https://api.fitbit.com/1/user/-/activities/list.json?beforeDate=${tomorrowFormatted}&sort=asc&offset=0&limit=100`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + req.headers.token
      }
    })
    fitbit_activities = fitbit_activities.data.activities;
    // returns array of JSON activities that have name that's in the fav_names array (filter)
      // uses a function to only include if JSON name in fav_names
    const filtered_arr = fitbit_activities.filter(obj => fav_names.has(obj.activityName));

    // fitbit says max heart rate is 220 - age and uses that to calculate heart rate zones
      // below zone: < 50% max HR
      // fat burn zone: between 50 and 69% of max HR
      // cardio zone: between 70 and 84% of max HR
      //  peak 85% max HR <= 
      const max_heart_rate = 220 - user_age; 
      const below_zone = max_heart_rate * 0.33;
      const fat_burn = ((max_heart_rate * 0.5) + (max_heart_rate * 0.69)) / 2;
      const cardio = ((max_heart_rate * 0.7) + (max_heart_rate * 0.84)) / 2;
      const peak = max_heart_rate * 0.9;
      
      // creating mapping between zone type and heart rate to calculate average
      const zone_map = new Map();
      zone_map.set('OUT_OF_ZONE', below_zone);
      zone_map.set('FAT_BURN', fat_burn);
      zone_map.set('CARDIO', cardio);
      zone_map.set('PEAK', peak);

    // next step is to get the AVG heart rate for each activity type (one value for each fav_name)
    console.log(filtered_arr);
    for (let i = 0; i < filtered_arr.length; i++){
      const activity_name = filtered_arr[i].activityName;
      if(filtered_arr[i].averageHeartRate)
      {
        let array_to_update = fav_names.get(activity_name);
        array_to_update.push(filtered_arr[i].averageHeartRate);
        fav_names.set(activity_name, array_to_update);
        console.log('has heartrate');
      }
      else if(filtered_arr[i].activeZoneMinutes.totalMinutes > 0){
        // const current_val = fav_names.get(activity_name);
        let current_val = 0;
        let minutes = 0;
        const minutes_in_zone_arr = filtered_arr[i].activeZoneMinutes.minutesInHeartRateZones;
        // console.log('minutes arr:')
        // console.log(minutes_in_zone_arr);
        for (let j = 0; j < minutes_in_zone_arr.length; j++){
          const zone_type_name = minutes_in_zone_arr[j].type;
          minutes += minutes_in_zone_arr[j].minutes;
          current_val += minutes_in_zone_arr[j].minutes * zone_map.get(zone_type_name);
        }
        current_val = current_val / minutes;
        let array_to_update = fav_names.get(activity_name);
        array_to_update.push(current_val);
        fav_names.set(activity_name, array_to_update);
      }
      
    }

    fav_names.forEach((value, key) => {
      if (Array.isArray(value)) {
        if (value.length != 0) {
          let average = 0;
          for(let i = 0; i < value.length; i++){
            average += value[i];
          }
          average = average / value.length;
          fav_names.set(key, average);
        }
        else {
          fav_names.set(key, 0);
        }
      }
    });

    console.log(fav_names);

    // cant send a map back so we turn it into a JSON and send it back
    const ret_val = Object.fromEntries(fav_names);
    res.send(ret_val);
  }
  catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
})




console.log('Listening on 8888');
app.listen(8888);