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
  var scope = 'user-read-private user-read-email user-read-playback-state';
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

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          //console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('http://localhost:3000/spotifylogin/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));  // If we comment this part out then the tokens won't be in the URL or hash anymore
      // maybe we should redirect to another route in the server and keep the spotify access token in the server rather than frontend
        // trying to get hold of it in the backend and make global scope, now we should be able to make requests without passing token 
        // back and forth between front and back end 
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
const fitbit_redirect_uri = 'http://localhost:3000/fitbitlogin';
const fitbit_auth_endpoint = 'https://www.fitbit.com/oauth2/authorize';
const fitbit_response_type = 'token';
let fitbit_access_token = '';

app.get('/fitbitlogin', function(req, res) {
  res.redirect(`${fitbit_auth_endpoint}?response_type=${fitbit_response_type}&client_id=${fitbit_client_id}&redirect_uri=${fitbit_redirect_uri}&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=86400`);
})

// fitbit says max heart rate is 220 - age and uses that to calculate heart rate zones
  // below zone: < 50% max HR
  // fat burn zone: between 50 and 69% of max HR
  // cardio zone: between 70 and 84% of max HR
  //  peak 85% max HR <= 
app.get('/fitbituser', async function(req, res) {
  const received_data = req.body; // data put in the get request from react
  try {
    console.log('access token:');

    console.log(req.headers.token);
    // making the function aysnc so that it won't continue until we get a response from fitbit
    const fitbit_response = await axios.get('https://api.fitbit.com/1/user/-/profile.json', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + req.headers.token
      }
    })

    console.log(fitbit_response.data.user);
    res.send(fitbit_response.data.user);
  }
  catch (error) {
    console.log('err')
    res.status(500).send('Failed to fetch user profile data');
  }
})

// can you send all fitbit queries to same endpoint and do different ones based on the info pased
app.get('/fitbitfavorites', async function(req, res) {
   const received_data = req.body; // data put in the get request from react
  try {
    console.log('access token:');

    console.log(req.headers.token);
    // making the function aysnc so that it won't continue until we get a response from fitbit
    const fitbit_response = await axios.get('https://api.fitbit.com/1/user/-/activities/favorite.json', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + req.headers.token
      }
    })

    const fitbit_data = fitbit_response.data;
    console.log(fitbit_data);
    res.send(fitbit_data);
  }
  catch (error) {
    console.log('err')
    res.status(500).send('Failed to fetch favorite workouts');
  }
})

app.get('/fitbitactivities', async function(req, res) {
   const received_data = req.body; // data put in the get request from react
  try {
    console.log('access token:');

    console.log(req.headers.token);
    // making the function aysnc so that it won't continue until we get a response from fitbit
    const fitbit_response = await axios.get('https://api.fitbit.com/1/user/-/activities/list.json?beforeDate=2024-01-07&sort=asc&offset=0&limit=100', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + req.headers.token
      }
    })

    const fitbit_data = fitbit_response.data; // array of JSON activity data in JSON format
    console.log(fitbit_data);
    res.send(fitbit_data);
  }
  catch (error) {
    console.log('err')
    res.status(500).send('Failed to fetch favorite workouts');
  }
})

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

    // now get an array with the top 3 favorite workouts, if zero then send back an error

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
      const below_zone = max_heart_rate * 0.375;
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
    for (let i = 0; i < filtered_arr.length; i++){
      if(filtered_arr[i].activeZoneMinutes.totalMinutes > 0){
        const activity_name = filtered_arr[i].activityName;
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
    // res.send(fav_names);

    fav_names.forEach((value, key) => {
      // const temp_arr = fav_names.get(key);
      // const length = temp_arr.length;
      
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
    });
    // console.log(fav_names);
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
// correct token prints out --> spotify access token is stored in the variable now
// setTimeout(() => {
//     console.log("access token var after timeout: ")
//     console.log(spotify_access_token);
// }, 10000);