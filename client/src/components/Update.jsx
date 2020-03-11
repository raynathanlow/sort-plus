import React from "react";
import styled from "styled-components";

const ReloadDiv = styled.div`
  position: fixed;
  display: flex;
  width: 100%;
  flex-direction: column;
  // justify-content: center;
  color: white;
  background-color: #1db954;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  border-radius: 7px;
  font-size: 0.7em;
  padding: 0.2em 0;
  z-index: 20;
  margin: 0.5em;

  & * {
    padding: 0.5em;
  }

  @media (min-width: 145px) {
    width: 13em;
    text-align: center;
  }

  @media (min-width: 200px) {
    width: 14em;
    padding: 0.5em;
  }

  @media (min-width: 420px) {
    flex-direction: row;
    text-align: left;
    left: initial;
    right: 0;
    transform: initial;
    margin: 1em;
    width: 18em;
  }

  @media (min-width: 350px) and (min-height: 300px) {
    font-size: 1em;
  }
`;

const Button = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  overflow: hidden;
  outline: none;
  font-size: 1em;
  // padding: 0;
  // margin-left: 0.5em;
`;

// Component that appropriately reloads the PWA if there is a new version available
function Reload(props) {
  const { update } = props;

  return (
    <ReloadDiv>
      <div>A new version is available!</div>

      <Button onClick={update}>Reload</Button>
    </ReloadDiv>
  );
}

export default Reload;
