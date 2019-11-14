// This is a modified version of spotify/web-api-auth-examples/authorization_code/app.js

const express = require('express');
const router = express.Router();

const axios = require('axios');
const config = require('config');
const querystring = require('querystring');

const User = require('../models/User');

const stateKey = 'spotify_state';

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

router.get('/', function(req, res) {
  // Generate state
  const state = generateRandomString(16);
  // Set state as cookie
  res.cookie(stateKey, state);

  // Request authorization
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      client_id: config.get('clientId'),
      response_type: 'code',
      redirect_uri: config.get('redirectUri'),
      scope: 'user-library-read',
      state: state
    }));
});

router.get('/callback', function(req, res) {
  const code = req.query.code || null;
  const state = req.query.state || null;
  // If there are cookies, assign with stateKey value, else, null
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState ) {
    // States do not match
  } else {
    // Delete cookie
    res.clearCookie(stateKey);

    // Request refresh and access tokens
    axios({
      method: 'post',
      url:' https://accounts.spotify.com/api/token',
      // querystring.stringify encodes in application/x-www-form-urlencoded
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: config.get('redirectUri')
      }),
      headers: {
        'Authorization': 'Basic ' + 
          Buffer.from((config.get('clientId') + ':' +
          config.get('clientSecret'))).toString('base64')
      }
    })
      .then(response => {
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;

        // Request current user's profile 
        axios({
          method: 'get',
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + accessToken
          }
        })
          .then(response => {
            const id = response.data.id;

            // Create or Update User in database
            // upsert option is true so that when there are no documents found,
            // a new document is inserted
            User.updateOne(
              { spotifyId: id },
              { spotifyId: id, accessToken: accessToken, refreshToken: refreshToken },
              { upsert: true },
              function() {
                // Redirect to home page
                res.redirect('../../');
              }
            );

          })
          .catch(error => {
            // Invalid token?
            console.log(error)
          });
      })
      .catch(error => {
        // Invalid token?
        console.log(error);
      });
  }
});

module.exports = router;
