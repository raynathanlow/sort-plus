// This includes code from spotify/web-api-auth-examples/authorization_code/app.js

import React, { Component } from "react";
import axios from "axios";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faChevronCircleLeft,
  faChevronCircleRight
} from "@fortawesome/free-solid-svg-icons";

import Library from "./Library";
import Offline from "./Offline";

const MenuDiv = styled.div`
  position: fixed;
  top: 0.5em;
  right: 0.5em;
  z-index: 15;
  color: white;
  background-color: #1db954;
  padding: 0.5em;

  display: flex;
  align-items: center;

  & div {
    margin: 0 0.5em;
  }
`;

const MenuDivClosed = styled.div`
  position: fixed;
  top: 0.5em;
  right: 0.5em;
  z-index: 15;
  color: white;
  padding: 0.5em;
`;

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUpdating: false,
      isOnline: false,
      isOpen: false
    };
  }

  componentDidMount() {
    axios
      .get(`google.com?_t=${Math.trunc(Math.random() * 10000)}`)
      .then(response => {
        if (response.status === 200) {
          // Connected to Internet
          console.log("connected!");

          this.setState({
            isUpdating: true,
            isOnline: true
          });

          axios.get("/api/library/update").then(() => {
            console.log("Library updated!");

            this.setState({
              isUpdating: false
            });
          });
        }
      });
  }

  toggle = () => {
    const { isOpen } = this.state;

    this.setState({
      isOpen: !isOpen
    });
  };

  logout = () => {
    window.location.href = "/logout";
  };

  render() {
    const { isUpdating, isOnline, isOpen } = this.state;

    // If menu is closed
    if (!isOpen) {
      return (
        <div>
          <Library isUpdating={isUpdating} isOnline={isOnline} />
          <MenuDivClosed>
            <FontAwesomeIcon
              icon={faChevronCircleLeft}
              size="lg"
              onClick={this.toggle}
              style={{ cursor: "pointer" }}
            />
          </MenuDivClosed>
        </div>
      );
    }

    // If menu is open and Cache API available
    if ("caches" in window) {
      return (
        <div>
          <Library isUpdating={isUpdating} isOnline={isOnline} />
          <MenuDiv>
            <FontAwesomeIcon
              icon={faChevronCircleRight}
              size="lg"
              onClick={this.toggle}
              style={{ cursor: "pointer" }}
            />
            <Offline isUpdating={isUpdating} isOnline={isOnline} />
            <FontAwesomeIcon
              icon={faSignOutAlt}
              size="lg"
              onClick={this.logout}
              style={{ cursor: "pointer" }}
            />
          </MenuDiv>
        </div>
      );
    }

    // If menu is open and Cache API is NOT available
    return (
      <div>
        <Library isUpdating={isUpdating} isOnline={isOnline} />
        <MenuDiv>
          <FontAwesomeIcon
            icon={faChevronCircleRight}
            size="lg"
            onClick={this.toggle}
            style={{ cursor: "pointer" }}
          />
          <FontAwesomeIcon
            icon={faSignOutAlt}
            size="lg"
            onClick={this.logout}
            style={{ cursor: "pointer" }}
          />
        </MenuDiv>
      </div>
    );
  }
}

export default Main;
