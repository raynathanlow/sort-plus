// This includes code from spotify/web-api-auth-examples/authorization_code/app.js

const express = require("express");

const router = express.Router();

const request = require("request");

const User = require("../../models/User");

router.post("/callback", (req, res) => {
  console.log("enter callback");

  const { code } = req.body;

  const authorization = Buffer.from(
    `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
  ).toString("base64");

  const tokenOptions = {
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
  };

  // Request tokens
  request.post(tokenOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const accessToken = body.access_token;
      const refreshToken = body.refresh_token;

      // Request current user's profile
      const profileOptions = {
        url: "https://api.spotify.com/v1/me",
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        json: true
      };

      request.get(profileOptions, (getError, getResponse, getBody) => {
        if (!getError && getResponse.statusCode === 200) {
          const doc = {}; // MongoDB doc to update

          const spotifyId = getBody.id;

          doc.spotifyId = spotifyId;
          doc.refreshToken = refreshToken;

          if (getBody.display_name !== null) {
            doc.display_name = getBody.display_name;
          }

          req.session.user = spotifyId;
          req.session.accessToken = accessToken;
          req.session.refreshToken = refreshToken;

          // Create or Update User in database
          // upsert option is true so that when there are no documents found,
          // a new document is inserted
          User.updateOne(
            { spotifyId },
            doc,
            { upsert: true, runValidators: true },
            () => {
              res.send(spotifyId);
            }
          );
        } else {
          console.log(error);
        }
      });
    } else {
      console.log(error);
    }
  });
});

module.exports = router;
