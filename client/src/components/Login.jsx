import React, { Component } from "react";
import { Helmet } from "react-helmet";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

import { generateRandomString, getCookie } from "../Utils";
import * as constants from "../Constants";

const LoggingInDiv = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

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
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${constants.CLIENT_ID}&response_type=code&redirect_uri=${constants.REDIRECT_URI}&scope=user-library-read&state=${state}&show_dialog=true`;

    // Redirect to Spotify authorization URL
    window.location.href = authUrl;
  }

  render() {
    return (
      <div>
        <Helmet>
          <title>Redirecting to Spotify for authorization... - Sort Plus</title>
        </Helmet>
        <LoggingInDiv>
          <FontAwesomeIcon icon={faCircleNotch} size="2x" spin />
          <p>Redirecting to Spotify for authorization...</p>
        </LoggingInDiv>
      </div>
    );
  }
}

export default Login;
