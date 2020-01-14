import React, { Component } from "react";
import styled from "styled-components";

import { getCookie } from "../Utils";

const HomeDiv = styled.div`
  padding: 0.5em;
  font-size: 0.85em;
  background-color: #111114;
  color: white;
`;

const HomeH1 = styled.div`
  font-size: 1.25em;
  margin: 0.5em 0;
  font-weight: bold;
`;

const ButtonDiv = styled.div`
  margin: 1.5em;
  text-align: center;
`;

const ButtonA = styled.a`
  padding: 0.5em 1em;
  background-color: #1db954;
  border-radius: 2em;
  text-decoration: none;
  color: white;
`;

// Open and use a popup for Spotify authorization
// Adapted from https://developer.mozilla.org/en-US/docs/Web/API/Window/open#Best_practices

var windowObjectReference = null; // global variable

function openAuthPopup() {
  if (windowObjectReference == null || windowObjectReference.closed) {
    /* if the pointer to the window object in memory does not exist
     or if such pointer exists but the window was closed */

    console.log("POPUP", `${window.location.href}login`);

    windowObjectReference = window.open(
      `${window.location.href}login`,
      "AuthWindowName",
      "resizable,scrollbars,status"
    );
    /* then create it. The new window will be created and
       will be brought on top of any other window. */
  } else {
    windowObjectReference.focus();
    /* else the window reference must exist and the window
       is not closed; therefore, we can bring it back on top of any other
       window with the focus() method. There would be no need to re-create
       the window or to reload the referenced resource. */
  }
}

function click() {
  openAuthPopup();
  return false;
}

function updateAuthInfo(e) {
  if (windowObjectReference !== null) {
    window.location.href = "/library";
    // windowObjectReference.close();
  }
}

window.addEventListener("message", updateAuthInfo);

class Home extends Component {
  componentDidMount() {
    if (getCookie("loggedIn") === "true") window.location.href = "/library";
  }

  render() {
    return (
      <HomeDiv>
        <div>Name</div>
        <HomeH1>More sorting options for Spotify</HomeH1>
        <p>Name sorts albums by duration and release date</p>
        <ButtonDiv>
          <ButtonA
            href={`${window.location.href}login`}
            onClick={click}
            target="AuthWindowName"
          >
            Login
          </ButtonA>
        </ButtonDiv>
      </HomeDiv>
    );
  }
}

export default Home;
