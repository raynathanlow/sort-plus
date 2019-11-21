const express = require('express');
const router = express.Router();

const request = require('request');
const config = require('config');

router.get('/', function(req, res) {
  // Get current user's access token through session object
  const accessToken = req.session.accessToken;

  // Expired access token
  // const accessToken = 'BQBGYpfXGGIu72VVPdTNyRqmz3ViLznkfvSmyA-VuH4FgIrLkuNByzh73GoRRh6yMK0xo8Q1UqNDwGffq21G6oK6Ih-uYxSZHJ5P2nN1Zl30jJ_PJigByoocoVcM3Do3BtYctRiC9MwQJsnMhXMq7vrEmV_3KLLWQdiFcKtkjivvPzCOzT7Dwe7Ba8ts';

  const refreshToken = req.session.refreshToken;

  // const refreshToken = 'AQBWOn_Iluf1Sy0_HngZb0_ilUwXUgbmx_rAHyZ5pkZVfWys2-OlVJQBYdUgumrnrgs_Zx7psIWV2fAmBRI6k1bfX_txz0AF2YH5TCDb8F2TCy8pvukOb0aHiszGAJIkik4';
  
  let albums = [];

  // Attempt to get current user's saved albums
  getAlbums('https://api.spotify.com/v1/me/albums?limit=50', accessToken, refreshToken, albums, res);
});

function getAlbums(url, accessToken, refreshToken, albums, res) {
  const options = {
    url: url,
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
    json: true
  };

  request.get(options, function(error, response, body) {
    if (body.error && body.error.message === 'The access token expired') {
      refreshAndGetAlbums(url, refreshToken, albums, res);
    }
    
    if (!error & response.statusCode === 200) {
      albums = albums.concat(body.items);

      // TODO: Update MongoDB with received data
      
      url = body.next;
      
      if (url) {
      	console.log('Getting albums... ' + albums.length + ' got!');
      	getAlbums(url, accessToken, refreshToken, albums, res);
      } else {
	res.send(albums.length.toString());
      }
    }
  });
}

function refreshAndGetAlbums(url, refreshToken, albums, res) {
  console.log('Refreshing access token...');
  
  const options = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + 
	Buffer.from((config.get('clientId') + ':' +
		     config.get('clientSecret'))).toString('base64')
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    },
    json: true
  }

  request.post(options, function(error, response, body) {
    if (!error & response.statusCode === 200) {
      getAlbums(url, body.access_token, refreshToken, albums, res);
    }
  });
}

module.exports = router;
