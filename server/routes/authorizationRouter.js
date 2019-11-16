// This is a modified version of spotify/web-api-auth-examples/authorization_code/app.js

const express = require('express');
const router = express.Router();

const axios = require('axios');
const config = require('config');
const querystring = require('querystring');

const User = require('../models/User');

const stateKey = 'spotify_state';

router.post('/callback', function(req, res) {
  const code = req.body.code;

  // Request refresh and access tokens
  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
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
              res.send(id);
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
});

module.exports = router;
