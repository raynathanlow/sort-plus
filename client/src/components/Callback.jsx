// This includes code from spotify/web-api-auth-examples/authorization_code/app.js

import React, { Component } from "react";
import axios from "axios";

import * as constants from "../Constants";
import { getCookie } from "../Utils";

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
        url: "/api/login/callback",
        data: {
          code
        }
      }).then(() => {
        document.cookie = `loggedIn=true; max-age="${60 * 60 * 24 * 30}"`;
        window.opener.postMessage("TEST MESSAGE", constants.TARGET_ORIGIN);
      });
    }
  }

  render() {
    return <div>Callback</div>;
  }
}

export default Callback;
