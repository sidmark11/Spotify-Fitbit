require('dotenv').config({ path: '../.env' })
const path = require('path');
var axios = require('axios');
var express = require('express');
var request = require('request');
var crypto = require('crypto');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');


var spotify_client_id = process.env.SPOTIFY_CLIENT_ID; 
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;
var spotify_redirect_uri = 'https://fitmixer-stg-6208d896f43c.herokuapp.com/spotifycallback'; 
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

if (process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/src')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + 'client/src/App.js'))
  })
}


app.get('/spotifylogin', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-read-playback-state user-top-read playlist-modify-public playlist-modify-private';
  var redirectToSpotify = res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: spotify_client_id,
      scope: scope,
      redirect_uri: spotify_redirect_uri,
      state: state
    }));

    res.status(200).send("Success");
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

        res.redirect('https://fitmixer-stg-6208d896f43c.herokuapp.com/#spotify')
      } else {
        res.redirect('https://fitmixer-stg-6208d896f43c.herokuapp.com/spotifylogin/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });

    if (!state || !code) {
    // Handle missing state or code
    res.status(400).send('Missing state or code');
    return;
    }

    // Handle state validation if needed
    var storedState = req.cookies ? req.cookies[stateKey] : null;
    if (state !== storedState) {
      // Handle invalid state
      res.status(400).send('Invalid state');
      return;
    }
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

const fitbit_client_id = process.env.FITBIT_CLIENT_ID;
const fitbit_secret_client = process.env.FITBIT_SECRET_CLIENT;
const fitbit_redirect_uri = 'https://fitmixer-stg-6208d896f43c.herokuapp.com/';
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
    // getting users' top artists and selecting the top 3 that include users' specified genres for workout playlist
    const spotify_artists = await axios.get('https://api.spotify.com/v1/me/top/artists?limit=50', {
      headers: {
        'Authorization': 'Bearer ' + spotify_access_token
      }
    })
    const artist_data = spotify_artists.data.items;
    const genres_arr = req.headers.genres.split(',');
    let valid_artists = [];

    const max_artists = 5 - genres_arr.length;

    // get rid of hyphens to search for genres in artists
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
    const seed_genres = genres_arr.join('%2C');
    const seed_artists = valid_artists.join('%2C');
    const seed_bpm = Math.trunc((req.headers.bpm - 5));
    let seed_energy = (seed_bpm / 180) + 0.075;
    if (seed_energy > 1){
      seed_energy = 1;
    }

    const recommendations = await axios.get(`https://api.spotify.com/v1/recommendations?seed_artists=${seed_artists}&seed_genres=${seed_genres}&target_tempo=${seed_bpm}&target_energy=${seed_energy}&limit=30`, {
      headers: {
        'Authorization': 'Bearer ' + spotify_access_token
      }
    })
    let user_id = await axios.get(`https://api.spotify.com/v1/me`, {
      headers: {
        'Authorization': 'Bearer ' + spotify_access_token
      }
    })
    user_id = user_id.data.id;

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
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
    res.send(error);
  }
})

app.get('/fitbittest', async function(req, res) {
   const received_data = req.body; 
  try {
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
      fav_names.set(favorite_activities[i].name, []); 
    }

    let fitbit_activities = await axios.get(`https://api.fitbit.com/1/user/-/activities/list.json?beforeDate=${tomorrowFormatted}&sort=asc&offset=0&limit=100`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + req.headers.token
      }
    })
    fitbit_activities = fitbit_activities.data.activities;

    const filtered_arr = fitbit_activities.filter(obj => fav_names.has(obj.activityName));

      const max_heart_rate = 220 - user_age; 
      const below_zone = max_heart_rate * 0.33;
      const fat_burn = ((max_heart_rate * 0.5) + (max_heart_rate * 0.69)) / 2;
      const cardio = ((max_heart_rate * 0.7) + (max_heart_rate * 0.84)) / 2;
      const peak = max_heart_rate * 0.9;
      
      const zone_map = new Map();
      zone_map.set('OUT_OF_ZONE', below_zone);
      zone_map.set('FAT_BURN', fat_burn);
      zone_map.set('CARDIO', cardio);
      zone_map.set('PEAK', peak);

    for (let i = 0; i < filtered_arr.length; i++){
      const activity_name = filtered_arr[i].activityName;
      if(filtered_arr[i].averageHeartRate)
      {
        let array_to_update = fav_names.get(activity_name);
        array_to_update.push(filtered_arr[i].averageHeartRate);
        fav_names.set(activity_name, array_to_update);
      }
      else if(filtered_arr[i].activeZoneMinutes.totalMinutes > 0){
        let current_val = 0;
        let minutes = 0;
        const minutes_in_zone_arr = filtered_arr[i].activeZoneMinutes.minutesInHeartRateZones;
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

    const ret_val = Object.fromEntries(fav_names);
    res.send(ret_val);
  }
  catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
})

console.log(`Listening on ${process.env.PORT}`);
app.listen(process.env.PORT);