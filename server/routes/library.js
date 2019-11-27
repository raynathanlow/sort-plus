const express = require('express');
const router = express.Router();

const request = require('request');
const config = require('config');

const Album = require('../models/Album');
const User = require('../models/User');

// router.get('/', function(req, res) {
//   // If first time, go to update endpoint
//   // If not first time, Get data from database
//   // Then display the library
//   res.send('Library');
// });

// Should endpoint be /update?
router.get('/', function (req, res) {
  const tokens = {
    // Expired
    // access: 'BQBGYpfXGGIu72VVPdTNyRqmz3ViLznkfvSmyA-VuH4FgIrLkuNByzh73GoRRh6yMK0xo8Q1UqNDwGffq21G6oK6Ih-uYxSZHJ5P2nN1Zl30jJ_PJigByoocoVcM3Do3BtYctRiC9MwQJsnMhXMq7vrEmV_3KLLWQdiFcKtkjivvPzCOzT7Dwe7Ba8ts',
    access: req.session.accessToken,
    refresh: req.session.refreshToken
  };

  console.log(req.session.user);

  // Attempt to get current user's saved albums
  getSavedAlbums('https://api.spotify.com/v1/me/albums?limit=50', tokens, [], req.session.user, res);
});

function getSavedAlbums(endpoint, tokens, savedAlbums, spotifyId, res) {
  // console.log(endpoint);

  const options = {
    url: endpoint,
    headers: {
      'Authorization': 'Bearer ' + tokens.access
    },
    json: true
  };

  request.get(options, function (error, response, body) {
    // Refresh access token if it has expired
    if (body.error && body.error.message === 'The access token expired') {
      const options = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
          'Authorization': 'Basic ' +
            Buffer.from((config.get('clientId') + ':' +
              config.get('clientSecret'))).toString('base64')
        },
        form: {
          grant_type: 'refresh_token',
          refresh_token: tokens.refresh
        },
        json: true
      }

      request.post(options, function (error, response, body) {
        if (!error & response.statusCode === 200) {
          // Is updating the accessToken key of session object necessary here?
          tokens.access = body.access_token;

          getSavedAlbums(endpoint, tokens, savedAlbums, spotifyId, res);
        }
      });
    }

    if (!error & response.statusCode === 200) {
      // Concatenate saved albums
      savedAlbums = savedAlbums.concat(body.items);

      // If there is another page, call itself again
      if (body.next) {
        getSavedAlbums(body.next, tokens, savedAlbums, spotifyId, res);
      } else {
        // If there are no more pages, process the albums
        processAlbums(savedAlbums, tokens, spotifyId, res);
      }
    }
  });
}

function processAlbums(savedAlbums, tokens, spotifyId, res) {
  let promises = [];
  let albumIds = []; // For updating current user's library

  for (let savedAlbum of savedAlbums) {
    albumIds.push(savedAlbum.album.id);

    if (savedAlbum.album.tracks.next !== null) {
      // If albums have more than one page of tracks
      promises.push(getRestOfTracks(savedAlbum.album.tracks.next, tokens, savedAlbum.album.tracks.items, savedAlbum));
    } else {
      addToDb(savedAlbum.album);
    }
  }

  // Doc used to update User
  let doc = {
    refreshToken: tokens.refresh,
    albumIds: albumIds
  }

  User.updateOne(
  	{ spotifyId: spotifyId },
  	doc,
  	{ upsert: true, runValidators: true },
  	function(error, writeOpResult) {
      if (error) console.log(error);
  	}
  );

  // After processing all of these albums, send a response
  Promise.all(promises).then(values => {
    res.send('Done!');
  });
}

// Similar to getSavedAlbums, but for tracks
function getRestOfTracks(endpoint, tokens, tracks, savedAlbum) {
  return new Promise((resolve, reject) => {
    const options = {
      url: endpoint,
      headers: {
        'Authorization': 'Bearer ' + tokens.access
      },
      json: true
    };

    request.get(options, function (error, response, body) {
      // Refresh access token if it has expired
      if (body.error && body.error.message === 'The access token expired') {
        const options = {
          url: 'https://accounts.spotify.com/api/token',
          headers: {
            'Authorization': 'Basic ' +
              Buffer.from((config.get('clientId') + ':' +
                config.get('clientSecret'))).toString('base64')
          },
          form: {
            grant_type: 'refresh_token',
            refresh_token: tokens.refresh
          },
          json: true
        }

        request.post(options, function (error, response, body) {
          if (!error & response.statusCode === 200) {
            // Is updating the accessToken key of session object necessary here?
            tokens.access = body.access_token;

            getRestOfTracks(endpoint, tokens, tracks, savedAlbum);
          }
        });
      }

      if (!error & response.statusCode === 200) {
        // Concatenate tracks
        tracks = tracks.concat(body.items);

        // If there is another page, call itself again
        if (body.next) {
          getRestOfTracks(body.next, tokens, tracks, savedAlbum);
        } else {
          // If there are no more pages,
          // Replace original array with new array of tracks
          savedAlbum.album.tracks.items = tracks;

          addToDb(savedAlbum.album);

          resolve();
        }
      }
    });
  });
}

function addToDb(savedAlbum) {
  // Doc used to update Album
  let doc = {};

  doc.id = savedAlbum.id;
  doc.name = savedAlbum.name;

  doc.artistNames = [];
  for (let artist of savedAlbum.artists) {
    doc.artistNames.push(artist.name);
  }

  doc.duration_ms = 0;
  doc.explicit = false;
  for (let track of savedAlbum.tracks.items) {
    doc.duration_ms += track.duration_ms;

    if (track.explicit) doc.explicit = true;
  }

  doc.releaseYear = +savedAlbum.release_date.substring(0, 4);
  doc.publicUrl = savedAlbum.external_urls.spotify;
  doc.images = savedAlbum.images;
  doc.totalTracks = savedAlbum.tracks.total;

  Album.updateOne(
  	{ id: savedAlbum.id },
  	doc,
  	{ upsert: true, runValidators: true },
  	function(error, writeOpResult) {
      if (error) console.log(error);
  	}
  );
}

module.exports = router;
