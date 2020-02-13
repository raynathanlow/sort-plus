// This includes code from spotify/web-api-auth-examples/authorization_code/app.js

import React, { Component } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

import * as constants from "../Constants";
import { getCookie } from "../Utils";

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

class Callback extends Component {
  componentDidMount() {
    if (getCookie("loggedIn") === "true") window.location.href = "/library";

    const query = document.location.search;
    const searchParams = new URLSearchParams(query);

    const code = searchParams.get("code") || null;
    const state = searchParams.get("state") || null;

    // If there are cookies, assign with stateKey value, else, null
    const storedState = document.cookie ? getCookie(constants.STATE_KEY) : null;

    if (state === null || state !== storedState) {
      console.log("states dont match");
      // States do not match
    } else {
      // Delete cookie
      document.cookie = `${constants.STATE_KEY}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;

      axios({
        method: "post",
        url: "/api/authorization/callback",
        data: {
          code
        }
      }).then(() => {
        console.log("Setting session cookie");

        document.cookie = `loggedIn=true; max-age=${60 * 60 * 24 * 30}`;
        window.location.href = "/library";
      });
    }
  }

  render() {
    return (
      <div>
        <Helmet>
          <title>Finalizing authorization... - Sort Plus</title>
        </Helmet>
        <LoggingInDiv>
          <FontAwesomeIcon icon={faCircleNotch} size="2x" spin />
          <p>Finalizing authorization...</p>
        </LoggingInDiv>
      </div>
    );
  }
}

export default Callback;
