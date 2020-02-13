import React, { Component } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

const LoggingOutDiv = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

class Logout extends Component {
  componentDidMount() {
    axios.get(`/api/authorization/logout`).then(() => {
      document.cookie = `loggedIn=;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      window.location.href = "../";
    });
  }

  render() {
    return (
      <div>
        <Helmet>
          <title>Logging out... - Sort Plus</title>
        </Helmet>
        <LoggingOutDiv>
          <FontAwesomeIcon icon={faCircleNotch} size="2x" spin />
          <p>Logging out...</p>
        </LoggingOutDiv>
      </div>
    );
  }
}

export default Logout;
