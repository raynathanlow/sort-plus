// This includes code from spotify/web-api-auth-examples/authorization_code/app.js

import React, { Component } from "react";
import axios from "axios";

import Library from "./Library";
import Offline from "./Offline";

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUpdating: false,
      isOnline: false
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

  render() {
    const { isUpdating, isOnline } = this.state;

    if ("caches" in window) {
      return (
        <div>
          <Library />
          <Offline isUpdating={isUpdating} isOnline={isOnline} />
        </div>
      );
    }

    return (
      <div>
        <Library />
      </div>
    );
  }
}

export default Main;
