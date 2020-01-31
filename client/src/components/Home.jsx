import React, { Component } from "react";
import styled from "styled-components";
import { Redirect } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudDownloadAlt } from "@fortawesome/free-solid-svg-icons";

import { getCookie } from "../Utils";
import mockup from "../mockup.png";
import time from "../time.png";

const HeaderDiv = styled.div`
  margin-bottom: 5em;
`;

const HomeDiv = styled.div`
  padding: 0.5em;
  font-size: 0.85em;
  background-color: #111114;
  color: white;
`;

const HomeH1 = styled.h1`
  // font-size: 1.25em;
  // margin: 0.5em 0;
  // font-weight: bold;
  text-align: center;
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
  font-size: 1.5em;
`;

const UseCaseDiv = styled.div`
  text-align: center;
  margin: 7em 0;

  & p {
    font-size: 1.3em;
    margin-bottom: 2em;
  }

  & img {
    box-shadow: 5px 5px 5px 0px rgba(0, 0, 0, 0.75);
  }
`;

const HeroImgDiv = styled.div`
  width: 100%;
  margin: 5em auto;

  @media (min-width: 1000px) {
    width: 80%;
  }

  @media (min-width: 1300px) {
    width: 60%;
  }

  & img {
    display: block;
    width: 100%;
  }
`;

const ImgDiv = styled.div`
  width: 20%;
  margin: 4em auto;

  // @media (min-width: 1000px) {
  //   width: 80%;
  // }

  // @media (min-width: 1300px) {
  //   width: 60%;
  // }

  & img {
    display: block;
    width: 100%;
  }
`;

// Open and use a popup for Spotify authorization
// Adapted from https://developer.mozilla.org/en-US/docs/Web/API/Window/open#Best_practices

var windowObjectReference = null; // global variable

function openAuthPopup() {
  if (windowObjectReference == null || windowObjectReference.closed) {
    /* if the pointer to the window object in memory does not exist
     or if such pointer exists but the window was closed */

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
    windowObjectReference.close();
  }
}

window.addEventListener("message", updateAuthInfo);

function Home() {
  if (getCookie("loggedIn") === "true") {
    return <Redirect to="/library" />;
  }

  return (
    <HomeDiv>
      <HeaderDiv>Name</HeaderDiv>
      <HomeH1>
        Automatically sort your saved albums by duration and release year.
      </HomeH1>
      <HeroImgDiv>
        <img src={mockup} alt="mockup" />
      </HeroImgDiv>

      <ButtonDiv>
        <ButtonA
          href={`${window.location.href}login`}
          onClick={click}
          target="AuthWindowName"
        >
          Log in with Spotify
        </ButtonA>
      </ButtonDiv>
      <UseCaseDiv>
        {/* <p>Find the album you can complete in the time you have.</p> */}
        {/* <p> */}
        {/*   Name can help you find the albums you can listen to in full if you */}
        {/*   don't have much time. */}
        {/* </p> */}
        <p>
          If you're a fan of listening to albums in full, Name can help you find
          the ones that fit your situation.
        </p>
        <ImgDiv>
          <img src={time} alt="time" />
        </ImgDiv>
      </UseCaseDiv>

      <UseCaseDiv>
        <p>
          If you see this icon{" "}
          <FontAwesomeIcon icon={faCloudDownloadAlt} size="lg" />, you can save
          your sorted albums on your device for offline use.*
        </p>

        <em>
          *Only available on Progressive Web App (PWA) supported web browsers.
        </em>
      </UseCaseDiv>
    </HomeDiv>
  );
}

export default Home;
