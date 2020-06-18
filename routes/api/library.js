const express = require("express");

const request = require("request");

const Album = require("../../models/Album");
const User = require("../../models/User");

const router = express.Router();

/**
 * Get access token
 * @return {promise} Access token
 */
function getAccessToken(req) {
  return new Promise((resolve, reject) => {
    // Return accessToken from session object if it hasn't expired yet
    if (Date.now() < req.session.accessExpiration) {
      resolve(req.session.accessToken);
    }

    const authorization = Buffer.from(
      `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
    ).toString("base64");

    // Otherwise, get a new access token using refresh token
    request.post(
      {
        url: "https://accounts.spotify.com/api/token",
        headers: {
          Authorization: `Basic ${authorization}`
        },
        form: {
          grant_type: "refresh_token",
          refresh_token: req.session.refreshToken
        },
        json: true
      },
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          // Update session object
          req.session.accessToken = body.access_token;
          // Set expiration as 50 minutes from now to give buffer for any requests sent near expiration
          req.session.accessExpiration = Date.now() + 300000;

          // Return access token
          resolve(body.access_token);
        } else {
          reject();
        }
      }
    );
  });
}

/**
 * Get all Spotify endpoints to asynchronously request
 * Some endpoints must be paged through because a maximum limit of 50 objects can be requested at a time
 * @param  {string} accessToken Spotify access token
 * @param  {string} baseUrl Spotify API endpoint URL
 * @return {promise} Array of all endpoints to request
 */
function getAllEndpoints(accessToken, baseUrl) {
  return new Promise((resolve, reject) => {
    const limit = 50;
    let offset = 0;

    request.get(
      {
        url: `${baseUrl}?=offset=${offset}&limit=${limit}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        json: true
      },
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          const { total } = body;
          const endpointCount = Math.ceil(total / limit);
          const endpoints = [];

          for (let page = 0; page < endpointCount; page += 1) {
            endpoints.push(`${baseUrl}?offset=${offset}&limit=${limit}`);

            offset += limit;
          }

          resolve(endpoints);
        }
        reject();
      }
    );
  });
}

/**
 * Sort albums based on sort mode
 * @param  {array} albums
 * @param  {string} sortMode
 * @return {object} Each key of object is group of related albums
 * Ex: "duration_ms" sort mode, keys would be 1m, 2m, 3m.
 * Ex: "releaseYear" sort mode, keys would be 1999, 2000, 2001.
 */
function sortAlbums(albums, sortMode) {
  // Sort in ascending order based on sortMode
  albums.sort((a, b) => a[sortMode] - b[sortMode]);

  let key = "prettyDuration";

  if (sortMode === "releaseYear") {
    key = "releaseYear";
  }

  // Each group of albums will be a key in the return object: sorted
  const sorted = {};

  let currentGroup = albums[0][key];
  let arr = [];

  albums.forEach(album => {
    // If album doesn't match the currentGroup,
    if (currentGroup !== album[key]) {
      sorted[currentGroup] = arr; // Add the currentGroup to the sorted object
      currentGroup = album[key]; // Update currentGroup
      arr = []; // Reset array

      arr.push(album.id); // Add album of new group to arr
    } else {
      arr.push(album.id); // Add element to arr
    }
  });

  sorted[currentGroup] = arr; // Add last group to the sorted object

  return sorted;
}

/**
 * Sort albums and add them to database
 * @param  {array} albums
 * @param  {string} spotifyId
 * @return {object} Each key of object is group of related albums
 */
function addSortedAlbumsToDb(albums, spotifyId) {
  return new Promise(resolve => {
    const doc = {
      sortedByDuration: sortAlbums(albums, "duration_ms"),
      sortedByReleaseYear: sortAlbums(albums, "releaseYear")
    };

    // Add to database
    User.updateOne(
      { spotifyId },
      doc,
      { upsert: true, runValidators: true },
      error => {
        if (error) console.log(error);
        resolve();
      }
    );
  });
}

/**
 * Convert milliseconds to hours and minutes
 * @param  {number} ms Milliseconds
 * @return {string} Hours and minutes in format: 1h 2m
 */
function toHoursAndMinutes(ms) {
  let minutes = ms / 1000 / 60;
  const hours = Math.trunc(minutes / 60);
  minutes = Math.trunc(minutes - hours * 60);

  // Show hours and minutes, if both are not 0
  if (hours && minutes) {
    return `${hours.toString()} h ${minutes.toString()} m`;
  }

  // Only show hours, if there are 0 minutes
  if (hours && !minutes) {
    return `${hours.toString()} h`;
  }

  // Only show minutes, the rest of the cases
  return `${minutes.toString()} m`;
}

/**
 * Function that adds saved album to database
 * @param  {object} album Spotify album object
 * @return {promise}
 */
function addToDb(album) {
  return new Promise((resolve, reject) => {
    // Doc used to update Album
    const doc = {};

    doc.id = album.id;
    doc.name = album.name;

    doc.artistNames = [];

    // Only keep artist's name(s)
    album.artists.forEach(artist => {
      doc.artistNames.push(artist.name);
    });

    doc.duration_ms = 0;
    doc.explicit = false;

    // If album object doesn't have duration_ms key, calculate the album's duration here
    if (!album.duration_ms) {
      album.tracks.items.forEach(track => {
        doc.duration_ms += track.duration_ms;
        if (track.explicit) doc.explicit = true;
      });
      doc.prettyDuration = toHoursAndMinutes(doc.duration_ms);
    } else {
      // Album does have duration_ms key, so use that value and the other values added while
      // it was processed further
      doc.duration_ms = album.duration_ms;
      doc.prettyDuration = album.prettyDuration;
      doc.explicit = album.explicit;
    }

    doc.releaseYear = +album.release_date.substring(0, 4);
    doc.publicUrl = album.external_urls.spotify;
    doc.images = album.images;
    doc.totalTracks = album.tracks.total;

    // Add doc to database
    Album.updateOne(
      { id: album.id },
      doc,
      { upsert: true, runValidators: true },
      error => {
        if (error) reject();
        resolve(doc);
      }
    );
  });
}

/**
 * Process albums that have more than 50 tracks
 * @param  {object} album Spotify album object
 * @param  {string} accessToken Spotify access token
 * @return {promise}
 */
function processOverLimit(album, accessToken) {
  return new Promise((resolve, reject) => {
    const albumUrl = album.tracks.next;
    const index = albumUrl.indexOf("?");
    const baseUrl = albumUrl.slice(0, index);

    // Get all endpoints for the tracks
    getAllEndpoints(accessToken, baseUrl).then(endpoints => {
      const tracks = [];
      let completed = 0;

      // Get the data from those endpoints
      endpoints.forEach(endpoint => {
        const options = {
          url: endpoint,
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          json: true
        };

        request.get(options, (error, response, body) => {
          if (!error && response.statusCode === 200) {
            tracks.push(body.items);

            // Once all of the data is received, calculate the album's duration and explicit
            if (completed === endpoints.length - 1) {
              let durationMs = 0;
              let explicit = false;
              tracks.flat().forEach(track => {
                durationMs += track.duration_ms;

                if (track.explicit) explicit = true;
              });
              const modifiedAlbum = album;

              modifiedAlbum.duration_ms = durationMs;
              modifiedAlbum.prettyDuration = toHoursAndMinutes(durationMs);
              modifiedAlbum.explicit = explicit;

              addToDb(modifiedAlbum).then(processedAlbum =>
                resolve(processedAlbum)
              );
            }

            completed += 1;
          } else {
            reject();
          }
        });
      });
    });
  });
}

/**
 * Iterate through all albums to see whethey they can be added to database
 * right away or if they require more processing first
 * @param  {array} albums Spotify album object
 * @param  {string} accessToken Spotify access token
 * @param  {string} spotifyId
 * @return {promise}
 */
function processAlbums(albums, accessToken, spotifyId) {
  return new Promise(resolve => {
    // Array of promises so that Promise.all can be used to add sorted albums to database
    // only after all albums have been processed
    const promises = [];
    const updatedSavedAlbums = []; // Array of album IDs
    const updatedSavedAlbumCovers = []; // Array of album cover URLs

    albums.forEach(album => {
      const savedAlbum = {
        added_at: album.added_at,
        id: album.album.id
      };
      updatedSavedAlbums.push(savedAlbum);

      updatedSavedAlbumCovers.push(album.album.images[1].url);

      if (album.album.tracks.next === null) {
        promises.push(addToDb(album.album));
      } else {
        promises.push(processOverLimit(album.album, accessToken));
      }
    });

    // Update savedAlbums and savedAlbumCovers
    User.updateOne(
      { spotifyId },
      {
        savedAlbums: updatedSavedAlbums,
        savedAlbumCovers: updatedSavedAlbumCovers
      },
      {
        upsert: true
      },
      err => {
        if (err) throw err;
      }
    );

    Promise.all(promises).then(processedAlbums =>
      addSortedAlbumsToDb(processedAlbums, spotifyId).then(resolve())
    );
  });
}

/**
 * Get all user's albums asynchronously
 * @param  {string} accessToken Spotify access token
 * @return {promise}
 */
function getAllAlbums(accessToken) {
  return new Promise((resolve, reject) => {
    getAllEndpoints(accessToken, "https://api.spotify.com/v1/me/albums").then(
      endpoints => {
        const albums = [];
        let completed = 0;

        if (endpoints.length > 0) {
          endpoints.forEach(endpoint => {
            const options = {
              url: endpoint,
              headers: {
                Authorization: `Bearer ${accessToken}`
              },
              json: true
            };

            request.get(options, (error, response, body) => {
              if (!error && response.statusCode === 200) {
                albums.push(body.items);

                if (completed === endpoints.length - 1) {
                  resolve(albums.flat());
                }

                completed += 1;
              } else {
                reject();
              }
            });
          });
        } else {
          reject(new Error("No albums"));
        }
      }
    );
  });
}

/**
 * Update library
 * @param  {string} accessToken Spotify album object
 * @param  {string} spotifyId
 * @return {promise}
 */
function updateLibrary(accessToken, spotifyId) {
  return new Promise(resolve => {
    getAllAlbums(accessToken)
      .then(albums => {
        processAlbums(albums, accessToken, spotifyId).then(
          resolve("Library updated!")
        );
      })
      .catch(error => {
        if (error.message === "No albums") {
          // Update library with 0 albums
          User.updateOne(
            { spotifyId },
            {
              savedAlbums: [],
              savedAlbumCovers: [],
              sortedByDuration: {},
              sortedByReleaseYear: {}
            },
            {
              upsert: true
            },
            err => {
              if (err) throw err;
            }
          );

          resolve("Library updated!");
        }
      });
  });
}

// router-level error handling middleware
// check that the session is valid
router.use((req, res, next) => {
  if (req.session.accessToken === undefined) {
    next("Invalid session");
  }

  next();
});

// error handler
router.use((err, req, res, next) => {
  console.error(err);

  if (err === "Invalid session") {
    res.status(401).send("Invalid session");
  }
});

/**
 * GET / method route
 * Send array of album IDs based on sort mode and option query string parameters
 * @response {array}
 */
router.get("/", (req, res) => {
  // Send array of album IDs based on input/default
  let arrayToFind = "sortedByDuration";

  if (req.query.sortMode === "releaseYear") arrayToFind = "sortedByReleaseYear";

  User.findOne({ spotifyId: req.session.user }, arrayToFind)
    .lean()
    .then(user => {
      if (req.query.option in user[arrayToFind]) {
        res.send(user[arrayToFind][req.query.option]);
      } else {
        res.send(user[arrayToFind][0]);
      }
    })
    .catch(error => res.send(error));
});

/**
 * GET /options method route
 * Send object with array of options for each sort mode
 * @response {object}
 */
router.get("/options", (req, res) => {
  User.findOne(
    { spotifyId: req.session.user },
    "sortedByDuration sortedByReleaseYear"
  )
    .lean()
    .then(user => {
      const options = {
        duration: Object.keys(user.sortedByDuration),
        releaseYear: Object.keys(user.sortedByReleaseYear)
      };
      res.send(options);
    })
    .catch(error => res.send(error));
});

/**
 * GET /albums method route
 * Send object with array of saved album IDs and array of saved album cover URLs
 * @response {object}
 */
// Endpoint used to get album IDs and album cover URLs to cache
router.get("/albums", (req, res) => {
  User.findOne({ spotifyId: req.session.user }, "savedAlbums savedAlbumCovers")
    .lean()
    .then(user => {
      const response = {
        savedAlbums: user.savedAlbums,
        savedAlbumCovers: user.savedAlbumCovers
      };

      res.send(response);
    })
    .catch(error => res.send(error));
});

/**
 * GET /update method route
 * Update library
 * @response {string} User's Spotify ID
 */
router.get("/update", (req, res) => {
  getAccessToken(req).then(accessToken => {
    updateLibrary(accessToken, req.session.user).then(() => {
      // Extend session when library updates

      res.send("Library updated!");
    });
  });
});

/**
 * GET /album method route
 * Send album object based on query string parameter
 * @response {string} User's Spotify ID
 */
router.get("/album", (req, res) => {
  Album.findOne({ id: req.query.albumId })
    .lean()
    .then(album => res.send(album))
    .catch(error => res.send(error));
});

module.exports = router;
