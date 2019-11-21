const express = require('express');
const router = express.Router();

const request = require('request');

router.get('/', function(req, res) {
  // Get current user's access token through session object
  const accessToken = req.session.accessToken;

  let albums = [];

  // Attempt to get current user's saved albums
  getAlbums('https://api.spotify.com/v1/me/albums?limit=50', accessToken, albums, res);
});

function getAlbums(url, accessToken, albums, res) {
  // TODO: Refresh access token if expired
  // TODO: Attempt to get current user's saved albums again
  // TODO: Update MongoDB with received data
  
  const options = {
    url: url,
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
    json: true
  };

  request.get(options, function(error, response, body) {
    if (!error & response.statusCode === 200) {
      albums = albums.concat(body.items);
      
      url = body.next;
      
      // url = null;

      // Possibly used to show progress
      // console.log(response.headers);
      
      if (url) {
      	console.log(albums.length);
      	getAlbums(url, accessToken, albums, res);
      } else {
	res.send(albums.length.toString());
      }
    }
  });
}

module.exports = router;
