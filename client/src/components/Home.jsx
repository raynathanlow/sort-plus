import React from "react";
import styled from "styled-components";

import Button from "./Button";

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

function Home() {
  return (
    <HomeDiv>
      <div>Name</div>
      <HomeH1>More sorting options for Spotify</HomeH1>
      <p>Name sorts albums by duration and release date</p>
      <ButtonDiv>
        <Button url={`${window.location.href}login`} text="Login" />
      </ButtonDiv>
    </HomeDiv>
  );
}

export default Home;
