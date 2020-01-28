const express = require("express");

const request = require("request");

const Album = require("../../models/Album");
const User = require("../../models/User");

const router = express.Router();

function getAccessToken(req) {
  return new Promise((resolve, reject) => {
    // Return accessToken from session object if it hasn't expired yet
    if (Date.now() < req.session.accessExpiration) {
      resolve(req.session.accessToken);
    }

    const authorization = Buffer.from(
      `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
    ).toString("base64");

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

// Compile array of endpoints based on total possible items
// Function used to enable asynchronously requesting information
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

function sortAlbums(albums, sortMode) {
  // Sort in ascending order based on sortMode
  albums.sort((a, b) => a[sortMode] - b[sortMode]);

  let key = "prettyDuration";

  if (sortMode === "releaseYear") {
    key = "releaseYear";
  }

  // Each group of albums will be a key in the object sorted
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

function addSortedAlbumsToDb(albums, spotifyId) {
  return new Promise((resolve, reject) => {
    const doc = {
      sortedByDuration: sortAlbums(albums, "duration_ms"),
      sortedByReleaseYear: sortAlbums(albums, "releaseYear")
    };

    User.updateOne({ spotifyId }, doc, { upsert: true }, error => {
      if (error) console.log(error);
      resolve();
    });
  });
}

// Convert milliseconds to hours and minutes
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

// Function that adds saved albums to database
function addToDb(album) {
  return new Promise((resolve, reject) => {
    // Doc used to update Album
    const doc = {};

    doc.id = album.id;
    doc.name = album.name;

    doc.artistNames = [];

    // Only keep artist's name
    album.artists.forEach(artist => {
      doc.artistNames.push(artist.name);
    });

    doc.duration_ms = 0;
    doc.explicit = false;

    // If album object has durationMs key, this means that it was processed further to calculate
    // the album's duration. There is a limit of 50 tracks provided in the album object
    if (!album.duration_ms) {
      // Album doesn't have durationMs key, so album's duration can be calculated here
      album.tracks.items.forEach(track => {
        doc.duration_ms += track.duration_ms;
        if (track.explicit) doc.explicit = true;
      });
      doc.prettyDuration = toHoursAndMinutes(doc.duration_ms);
    } else {
      // Album does have durationMs key, so use that value and the other values added while
      // it was processed further
      doc.duration_ms = album.duration_ms;
      doc.prettyDuration = album.prettyDuration;
      doc.explicit = album.explicit;
    }

    doc.releaseYear = +album.release_date.substring(0, 4);
    doc.publicUrl = album.external_urls.spotify;
    doc.images = album.images;
    doc.totalTracks = album.tracks.total;

    Album.updateOne({ id: album.id }, doc, { upsert: true }, error => {
      if (error) reject();
      resolve(doc);
    });
  });
}

// Function used to process the albums that exceeded the 50 track limit
function processOverLimit(album, accessToken) {
  return new Promise((resolve, reject) => {
    const albumUrl = album.tracks.next;
    const index = albumUrl.indexOf("?");
    const baseUrl = albumUrl.slice(0, index);

    // Get the endpoints for the tracks
    getAllEndpoints(accessToken, baseUrl).then(endpoints => {
      const tracks = [];
      let completed = 0;

      endpoints.forEach(endpoint => {
        const options = {
          url: endpoint,
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          json: true
        };

        // Get the data from those endpoints
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

// Go through all of the albums to see whether they can be added to database
// right away, or it requires more processing first
function processAlbums(albums, accessToken, spotifyId) {
  return new Promise((resolve, reject) => {
    const promises = [];
    const updatedSavedAlbums = [];
    const updatedSavedAlbumCovers = [];

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
    User.findOneAndUpdate(
      { spotifyId },
      {
        savedAlbums: updatedSavedAlbums,
        savedAlbumCovers: updatedSavedAlbumCovers
      },
      function(err, user) {
        if (err) throw err;
      }
    );

    Promise.all(promises).then(processedAlbums =>
      addSortedAlbumsToDb(processedAlbums, spotifyId).then(resolve())
    );
  });
}

// Get all albums asynchronously
function getAllAlbums(accessToken) {
  return new Promise((resolve, reject) => {
    getAllEndpoints(accessToken, "https://api.spotify.com/v1/me/albums").then(
      endpoints => {
        const albums = [];
        let completed = 0;

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
      }
    );
  });
}

function updateLibrary(accessToken, spotifyId) {
  return new Promise((resolve, reject) => {
    getAllAlbums(accessToken).then(albums => {
      processAlbums(albums, accessToken, spotifyId).then(
        resolve("Library updated!")
      );
    });
  });
}

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

// Endpoint used to get options for each sort mode
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

router.get("/update", (req, res) => {
  getAccessToken(req).then(accessToken => {
    updateLibrary(accessToken, req.session.user).then(() => {
      // Extend session when library updates

      res.send("Library updated!");
    });
  });
});

router.get("/album", (req, res) => {
  Album.findOne({ id: req.query.albumId })
    .lean()
    .then(album => res.send(album))
    .catch(error => res.send(error));
});

module.exports = router;
