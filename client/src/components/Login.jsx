import React, { Component } from "react";

import { generateRandomString, getCookie } from "../Utils";
import * as constants from "../Constants";

class Login extends Component {
  componentDidMount() {
    if (getCookie("loggedIn") === "true") {
      window.location.href = "/library";
      return;
    }

    // Generate state
    const state = generateRandomString(16);
    // Set state as cookie
    document.cookie = `${constants.STATE_KEY}=${state}`;

    // Prepare Spotify authorization URL
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${constants.CLIENT_ID}&response_type=code&redirect_uri=${constants.REDIRECT_URI}&scope=user-library-read&state=${state}`;

    // Redirect to Spotify authorization URL
    window.location.href = authUrl;
  }

  render() {
    return <div />;
  }
}

export default Login;
