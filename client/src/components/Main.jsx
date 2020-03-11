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
  background-color: #282828;
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

// Component used to check Internet connectivity, update user's library data,
// render Library component, and render menu
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
    // Check if connected to Internet
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

          // Update user's library data
          axios.get("/api/library/update").then(() => {
            console.log("Library updated!");

            this.setState({
              isUpdating: false
            });
          });
        }
      });
  }

  /**
   * Toggle state used to open and close menu
   * @return {undefined} 
   */
  toggle = () => {
    const { isOpen } = this.state;

    this.setState({
      isOpen: !isOpen
    });
  };

  /**
   * Redirect user to /logout
   * @return {undefined} 
   */
  logout = () => {
    window.location.href = "/logout";
  };

  render() {
    const { isUpdating, isOnline, isOpen } = this.state;

    // If menu is closed
    if (!isOpen) {
      return (
        <div>
          <Library />
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
          <Library />
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
        <Library />
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
