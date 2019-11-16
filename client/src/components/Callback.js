// This includes code from spotify/web-api-auth-examples/authorization_code/app.js

import React, { Component } from 'react';
import axios from 'axios';

import * as constants from '../Constants.js';
import { getCookie } from '../Utils.js';

class Callback extends Component {

  componentDidMount() {
    const query = this.props.location.search;
    const searchParams = new URLSearchParams(query);

    const code = searchParams.get('code') || null;
    const state = searchParams.get('state') || null;

    // If there are cookies, assign with stateKey value, else, null
    const storedState = document.cookie ? getCookie(constants.STATE_KEY) : null;

    if (state === null || state !== storedState ) {
      // States do not match
    } else {
      // Delete cookie
      document.cookie = constants.STATE_KEY + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';

      // make a POST request with axios - server side
      axios({
        method: 'post',
        url: '/login/callback',
        data: {
          code: code,
        },
      })
        .then(response => window.location.href = '/')
        .catch(error => console.log(error));
    }
  }

  render() {
    return (
      <div>
      Callback
      </div>
    );
  }
}

export default Callback;
