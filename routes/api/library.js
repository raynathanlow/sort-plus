const express = require("express");

const request = require("request");
const config = require("config");

const Album = require("../../models/Album");
const User = require("../../models/User");

const router = express.Router();

// router.get('/', function(req, res) {
//   // If first time, go to update endpoint
//   // If not first time, Get data from database
//   // Then display the library
//   res.send('Library');
// });

// Similar to getSavedAlbums, but for tracks
function getRestOfTracks(endpoint, tokens, tracks, savedAlbum) {
  const authorization = Buffer.from(
    `${config.get("clientId")}:${config.get("clientSecret")}`
  ).toString("base64");

  return new Promise(resolve => {
    const options = {
      url: endpoint,
      headers: {
        Authorization: `Bearer ${tokens.access}`
      },
      json: true
    };

    request.get(options, (error, response, body) => {
      // Refresh access token if it has expired
      if (body.error && body.error.message === "The access token expired") {
        const postOptions = {
          url: "https://accounts.spotify.com/api/token",
          headers: {
            Authorization: `Basic ${authorization}`
          },
          form: {
            grant_type: "refresh_token",
            refresh_token: tokens.refresh
          },
          json: true
        };

        request.post(postOptions, (postError, postResponse, postBody) => {
          if (!postError && response.statusCode === 200) {
            // Is updating the accessToken key of session object necessary here?
            const newTokens = {
              access: postBody.access_token,
              refresh: tokens.refresh
            };

            // tokens.access = postBody.access_token;

            getRestOfTracks(endpoint, newTokens, tracks, savedAlbum);
          }
        });
      }

      if (!error && response.statusCode === 200) {
        // Concatenate tracks
        const combinedTracks = tracks.concat(body.items);

        // If there is another page, call itself again
        if (body.next) {
          getRestOfTracks(body.next, tokens, combinedTracks, savedAlbum);
        } else {
          // If there are no more pages,
          // Replace original array with new array of tracks
          const albumToReturn = savedAlbum;

          albumToReturn.album.tracks.items = tracks;

          resolve(albumToReturn);
        }
      }
    });
  });
}

function addToDb(savedAlbum) {
  return new Promise(resolve => {
    // Doc used to update Album
    const doc = {};

    doc.id = savedAlbum.id;
    doc.name = savedAlbum.name;

    doc.artistNames = [];

    savedAlbum.artists.forEach(element => {
      doc.artistNames.push(element.name);
    });

    doc.duration_ms = 0;
    doc.explicit = false;

    savedAlbum.tracks.items.forEach(element => {
      doc.duration_ms += element.duration_ms;

      if (element.explicit) doc.explicit = true;
    });

    doc.releaseYear = +savedAlbum.release_date.substring(0, 4);
    doc.publicUrl = savedAlbum.external_urls.spotify;
    doc.images = savedAlbum.images;
    doc.totalTracks = savedAlbum.tracks.total;

    Album.updateOne(
      { id: savedAlbum.id },
      doc,
      { upsert: true, runValidators: true },
      error => {
        if (error) console.log(error);
        resolve();
      }
    );
  });
}

function getLibrary(spotifyId, res) {
  User.findOne({ spotifyId }, "savedAlbums", (userErr, userDoc) => {
    if (userDoc.savedAlbums) {
      const { savedAlbums } = userDoc;

      const albumIds = [];

      // Create array of album IDs
      // for (let savedAlbum of savedAlbums) {
      //   albumIds.push(savedAlbum.id);
      // }

      savedAlbums.forEach(element => {
        albumIds.push(element.id);
      });

      // Use lean option so documents returned are plain JavaScript objects, not Mongoose Documents
      // https://stackoverflow.com/a/18070111
      Album.find({ id: { $in: albumIds } })
        .lean()
        .exec((err, docs) => {
          const newDocs = docs;
          for (let i = 0; i < savedAlbums.length; i += 1) {
            const index = docs.findIndex(
              album => album.id === savedAlbums[i].id
            );
            newDocs[index].added_at = savedAlbums[i].added_at;

            if (i === savedAlbums.length - 1) {
              res.send(newDocs);
            }
          }
        });
    }
  });
}

function processAlbums(savedAlbums, tokens, spotifyId, res) {
  const getRestOfTracksPromises = [];
  const addToDbPromises = [];
  const savedAlbumsDb = []; // Saved album objects to add to user's document in database

  // for (let savedAlbum of savedAlbums) {
  //   let album = {
  //     id: savedAlbum.album.id,
  //     added_at: savedAlbum.added_at
  //   };

  //   savedAlbumsDb.push(album);

  //   if (savedAlbum.album.tracks.next !== null) {
  //     // If albums have more than one page of tracks, get the rest of its tracks
  //     getRestOfTracksPromises.push(
  //       getRestOfTracks(
  //         savedAlbum.album.tracks.next,
  //         tokens,
  //         savedAlbum.album.tracks.items,
  //         savedAlbum
  //       )
  //     );
  //   } else {
  //     addToDbPromises.push(addToDb(savedAlbum.album));
  //   }
  // }

  savedAlbums.forEach(element => {
    const album = {
      id: element.album.id,
      added_at: element.added_at
    };

    savedAlbumsDb.push(album);

    if (element.album.tracks.next !== null) {
      // If albums have more than one page of tracks, get the rest of its tracks
      getRestOfTracksPromises.push(
        getRestOfTracks(
          element.album.tracks.next,
          tokens,
          element.album.tracks.items,
          element
        )
      );
    } else {
      addToDbPromises.push(addToDb(element.album));
    }
  });

  // Doc used to update User
  const doc = {
    refreshToken: tokens.refresh,
    savedAlbums: savedAlbumsDb
  };

  User.updateOne(
    { spotifyId },
    doc,
    { upsert: true, runValidators: true },
    error => {
      if (error) console.log(error);
    }
  );

  Promise.all(getRestOfTracksPromises).then(results => {
    // After getting the rest of the tracks for certain albums
    // for (let result of results) {
    //   addToDbPromises.push(addToDb(result.album));
    // }

    results.forEach(element => {
      addToDbPromises.push(addToDb(element.album));
    });

    // After adding each album to app's database, get the user's library
    Promise.all(addToDbPromises).then(() => {
      getLibrary(spotifyId, res);
    });
  });
}

function getSavedAlbums(endpoint, tokens, savedAlbums, spotifyId, res) {
  const authorization = Buffer.from(
    `${config.get("clientId")}:${config.get("clientSecret")}`
  ).toString("base64");

  const options = {
    url: endpoint,
    headers: {
      Authorization: `Bearer ${tokens.access}`
    },
    json: true
  };

  request.get(options, (error, response, body) => {
    // Refresh access token if it has expired
    if (body.error && body.error.message === "The access token expired") {
      const postOption = {
        url: "https://accounts.spotify.com/api/token",
        headers: {
          Authorization: `Basic ${authorization}`
        },
        form: {
          grant_type: "refresh_token",
          refresh_token: tokens.refresh
        },
        json: true
      };

      request.post(postOption, (postError, postResponse, postBody) => {
        if (!postError && postResponse.statusCode === 200) {
          // Is updating the accessToken key of session object necessary here?
          const newTokens = tokens;
          newTokens.access = postBody.access_token;

          getSavedAlbums(endpoint, newTokens, savedAlbums, spotifyId, res);
        }
      });
    }

    if (!error && response.statusCode === 200) {
      // Concatenate saved albums
      const newSavedAlbums = savedAlbums.concat(body.items);

      // If there is another page, call itself again
      if (body.next) {
        getSavedAlbums(body.next, tokens, newSavedAlbums, spotifyId, res);
      } else {
        // If there are no more pages, process the albums
        processAlbums(newSavedAlbums, tokens, spotifyId, res);
      }
    }
  });
}

// Should endpoint be /update?
router.get("/", (req, res) => {
  const tokens = {
    // Expiredf
    // access: `BQBGYpfXGGIu72VVPdTNyRqmz3ViLznkfvSmyA-VuH4FgIrLkuNByzh73GoRRh6yMK0xo8Q1UqNDwGffq21G6oK6Ih-uYxSZHJ5P2nN1Zl30jJ_PJigByoocoVcM3Do3BtYctRiC9MwQJsnMhXMq7vrEmV_3KLLWQdiFcKtkjivvPzCOzT7Dwe7Ba8ts`,
    access: req.session.accessToken,
    refresh: req.session.refreshToken
  };

  // Attempt to get current user's saved albums
  getSavedAlbums(
    "https://api.spotify.com/v1/me/albums?limit=50",
    tokens,
    [],
    req.session.user,
    res
  );

  // getLibrary("stradition", res);
});

module.exports = router;
