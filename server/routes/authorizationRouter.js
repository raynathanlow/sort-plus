// This includes code from spotify/web-api-auth-examples/authorization_code/app.js

const express = require('express');
const router = express.Router();

const request = require('request');
const config = require('config');

const User = require('../models/User');
router.post('/callback', function(req, res) {
  const code = req.body.code;

  const tokenOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: config.get('redirectUri'),
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + 
	Buffer.from((config.get('clientId') + ':' +
		     config.get('clientSecret'))).toString('base64')
    },
    json: true
  }

  // Request tokens
  request.post(tokenOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      const accessToken = body.access_token;
      const refreshToken = body.refresh_token;

      // Request current user's profile
      const profileOptions = {
	url: 'https://api.spotify.com/v1/me',
	headers: {
	  'Authorization': 'Bearer ' + accessToken
	},
	json: true
      }

      request.get(profileOptions, function(error, response, body) {
	if (!error && response.statusCode === 200) {
	  let doc = {}; // MongoDB doc to update

	  const spotifyId = body.id;
	  
	  doc.spotifyId = spotifyId;
	  doc.refreshToken = refreshToken;

	  if (body.display_name !== null) {
	    doc.display_name = body.display_name;
	  }

	  req.session.user = spotifyId;
	  req.session.accessToken = accessToken;
	  req.session.refreshToken = refreshToken;
	  
	  // Create or Update User in database
	  // upsert option is true so that when there are no documents found,
	  // a new document is inserted
	  User.updateOne(
	    { spotifyId: spotifyId },
	    doc,
	    { upsert: true, runValidators: true },
	    function() {
	      res.send(spotifyId);
	    }
	  );
	}
      });
    }
  });
});

module.exports = router;
