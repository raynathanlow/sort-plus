// This includes code from spotify/web-api-auth-examples/authorization_code/app.js

const express = require("express");

const router = express.Router();

const request = require("request");

const User = require("../../models/User");

/**
 * Get access and refresh tokens using code
 * @param  {string} code returned by Spotify after user login callback
 * @return {promise}
 */
function getTokens(code) {
  return new Promise((resolve, reject) => {
    const authorization = Buffer.from(
      `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
    ).toString("base64");

    request.post(
      {
        url: "https://accounts.spotify.com/api/token",
        form: {
          code,
          redirect_uri: process.env.REDIRECT_URI,
          grant_type: "authorization_code"
        },
        headers: {
          Authorization: `Basic ${authorization}`
        },
        json: true
      },
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          resolve(body);
        }
        reject(body);
      }
    );
  });
}

/**
 * Get user profile using access token
 * @param  {string} accessToken returned by getTokens
 * @return {promise}
 */
function getUserProfile(accessToken) {
  return new Promise((resolve, reject) => {
    request.get(
      {
        url: "https://api.spotify.com/v1/me",
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        json: true
      },
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          resolve(body);
        }

        reject(body);
      }
    );
  });
}

/**
 * POST /callback method route
 * Finalize user authorization by getting tokens and Spotify ID to start session
 * @response {string} User's Spotify ID
 */
router.post("/callback", (req, res) => {
  const doc = {}; // MongoDB doc to update

  getTokens(req.body.code)
    .then(tokens => {
      req.session.accessToken = tokens.access_token;
      req.session.refreshToken = tokens.refresh_token;

      doc.refreshToken = tokens.refresh_token;

      // Set expiration time 50 minutes from now instead of 60 minutes
      // to give some buffer time for requests
      req.session.accessExpiration = Date.now() + 3000000;

      getUserProfile(tokens.access_token)
        .then(profile => {
          const spotifyId = profile.id; // Necessary for MongoDB filter parameter below
          req.session.user = spotifyId;
          doc.spotifyId = spotifyId;

          if (profile.display_name !== null) {
            doc.display_name = profile.display_name;
          }

          User.updateOne(
            { spotifyId },
            doc,
            { upsert: true, runValidators: true },
            () => {
              res.send(profile.id);
            }
          );
        })
        .catch(error => console.log("getUserProfile", error));
    })
    .catch(error => console.log("getTokens", error));
});

/**
 * GET /logout method route
 * Destroy session in server and session store
 * @response {undefined}
 */
router.get("/logout", (req, res) => {
  req.app.get("store").destroy(req.session.id, error => {
    console.log("Session in store destroyed");
    console.log("error", error);
    req.session.destroy(() => {
      res.send();
    });
  });
});

module.exports = router;
