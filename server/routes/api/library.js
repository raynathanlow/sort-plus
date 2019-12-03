const express = require('express');
const router = express.Router();

const request = require('request');
const config = require('config');

const Album = require('../../models/Album');
const User = require('../../models/User');

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

  // Attempt to get current user's saved albums
  // getSavedAlbums('https://api.spotify.com/v1/me/albums?limit=50', tokens, [], req.session.user, res);

  getLibrary('stradition', res);
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
  let getRestOfTracksPromises = [];
  let addToDbPromises = [];
  let savedAlbumsDb = []; // Saved album objects to add to user's document in database

  for (let savedAlbum of savedAlbums) {
    let album = {
      id: savedAlbum.album.id,
      added_at: savedAlbum.added_at
    };

    savedAlbumsDb.push(album);

    if (savedAlbum.album.tracks.next !== null) {
      // If albums have more than one page of tracks, get the rest of its tracks
      getRestOfTracksPromises.push(getRestOfTracks(savedAlbum.album.tracks.next, tokens, savedAlbum.album.tracks.items, savedAlbum));
    } else {
      addToDbPromises.push(addToDb(savedAlbum.album));
    }
  }

  // Doc used to update User
  let doc = {
    'refreshToken': tokens.refresh,
    'savedAlbums': savedAlbumsDb
  }

  User.updateOne(
    { spotifyId: spotifyId },
    doc,
    { upsert: true, runValidators: true },
    function (error, writeOpResult) {
      if (error) console.log(error);
    }
  );

  Promise.all(getRestOfTracksPromises).then(results => {
    // After getting the rest of the tracks for certain albums
    for (let result of results) {
      addToDbPromises.push(addToDb(result.album));
    }

    // After adding each album to app's database, get the user's library
    Promise.all(addToDbPromises).then(values => {
      getLibrary(spotifyId, res)
    });
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

          resolve(savedAlbum);
        }
      }
    });
  });
}

function addToDb(savedAlbum) {
  return new Promise((resolve, reject) => {
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
      function (error, writeOpResult) {
        if (error) console.log(error);
        resolve();
      }
    );
  });
}

function getLibrary(spotifyId, res) {
  User.findOne({ spotifyId: spotifyId }, 'savedAlbums', function (err, doc) {
    if (doc.savedAlbums) {
      let savedAlbums = doc.savedAlbums;

      let albumIds = [];

      // Create array of album IDs
      for (let savedAlbum of savedAlbums) {
        albumIds.push(savedAlbum.id);
      }

      // Use lean option so documents returned are plain JavaScript objects, not Mongoose Documents
      // https://stackoverflow.com/a/18070111
      Album.find({ id: { $in: albumIds} }).lean().exec(function (err, docs) {
        for (let i = 0; i < savedAlbums.length; i++) {
          let index = docs.findIndex((album) => album.id == savedAlbums[i].id);
          docs[index]['added_at'] = savedAlbums[i].added_at;

          if (i == savedAlbums.length - 1) {
            res.send(docs);
          }
        }
      });
    }
  });
}

module.exports = router;
