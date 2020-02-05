import React from "react";
import styled from "styled-components";
import { Redirect } from "react-router-dom";

import { getCookie } from "../Utils";
import mockup from "../mockup.png";
import time from "../time.png";
import cloud from "../cloud-alt.png";
import mobile from "../mobile-mockup.png";

const HeaderDiv = styled.div`
  padding-bottom: 1em;
  padding: 0.5em;
`;

const HomeDiv = styled.div`
  font-size: 0.9em;
  background-color: #111114;
  color: white;
`;

const HomeH1 = styled.h1`
  text-align: center;
  font-size: 1em;
  padding: 0.5em;

  @media (min-width: 265px) {
    font-size: 1em;
  }

  @media (min-width: 350px) {
    font-size: 1.5em;
    margin: 2em auto;
  }

  @media (min-width: 600px) {
    margin: 2.5em auto;
  }

  @media (min-width: 800px) {
    margin: 3.5em auto;
  }
`;

const ButtonDiv = styled.div`
  text-align: center;
  padding: 0.5em;
`;

const Button = styled.button`
  background-color: #1db954;
  text-decoration: none;
  color: white;
  border: none;
  padding: 0.5em 1em;
  border-radius: 2em;
  margin: 1em auto;

  @media (min-width: 350px) {
    margin: 1.5em auto;
    font-size: 1.25em;
  }

  @media (min-width: 600px) {
    margin: 2.5em auto;
  }

  @media (min-width: 800px) {
    margin: 4em auto;
  }
`;

const Img = styled.img`
  display: block;
  width: 100%;
  margin: 1em auto;
`;

const HeroImgDiv = styled.div`
  background-color: hsla(0, 0%, 100%, 0.6);
`;

const HeroImgWrapper = styled.div`
  width: 100%;
  margin: 0em auto;
  padding: 0.01em 0;

  @media (min-width: 500px) {
    padding: 1em 0;
  }

  @media (min-width: 1000px) {
    width: 80%;
    padding: 2em;
  }

  @media (min-width: 1300px) {
    width: 60%;
  }
`;

const FeaturesDiv = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5em;

  @media (min-width: 350px) {
    margin: 1em auto;
  }

  @media (min-width: 655px) {
    flex-direction: row;
  }

  @media (min-width: 1000px) {
    width: 80%;
    margin: 2em auto;
  }

  @media (min-width: 1300px) {
    width: 60em;
  }
`;

const FeatureDiv = styled.div`
  & p {
    font-size: 0.85em;
  }

  & em {
    font-size: 0.75em;
  }

  @media (min-width: 200px) {
    & img {
      width: 13em;
    }
  }

  @media (min-width: 350px) {
    & p {
      font-size: 1em;
    }

    & em {
      font-size: 0.9em;
    }
  }

  @media (min-width: 500px) {
    padding: 0 2em;
  }

  @media (min-width: 655px) {
    flex: 0 1 50%;
    padding: 2em;

    & img {
      width: 13em;
    }
  }

  @media (min-width: 1000px) {
    & img {
      width: 17em;
    }
  }
`;

const FeatureH2 = styled.h2`
  font-size: 0.9em;

  @media (min-width: 265px) {
    font-size: 0.9em;
  }

  @media (min-width: 350px) {
    font-size: 1.5em;
    margin: 1em auto;
  }

  @media (min-width: 600px) {
    margin: 1.5em auto;
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
      <HeaderDiv>69</HeaderDiv>
      <HomeH1>
        Automatically sort your saved albums by duration and release year.
      </HomeH1>
      <HeroImgDiv>
        <HeroImgWrapper>
          <picture>
            <source srcSet={mobile} media="(max-width: 500px)" />
            <Img src={mockup} alt="mockups" />
          </picture>
        </HeroImgWrapper>
      </HeroImgDiv>

      <ButtonDiv>
        <Button
          href={`${window.location.href}login`}
          onClick={click}
          target="AuthWindowName"
          style={{ cursor: "pointer" }}
        >
          Log in with Spotify
        </Button>
      </ButtonDiv>

      <FeaturesDiv>
        <FeatureDiv>
          <Img src={time} alt="time" />
          <FeatureH2>Enjoy listening to albums in full?</FeatureH2>
          <p>Name can help you find albums that work with your schedule.</p>
        </FeatureDiv>

        <FeatureDiv>
          <Img src={cloud} alt="cloud" />
          <FeatureH2>Offline support*</FeatureH2>

          <p>
            You can download the sorted albums on your device for offline use.
          </p>
          <em>
            *Only available on Progressive Web App (PWA) supported web browsers.
          </em>
        </FeatureDiv>
      </FeaturesDiv>
    </HomeDiv>
  );
}

export default Home;
