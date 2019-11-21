// This includes code from spotify/web-api-auth-examples/authorization_code/app.js

import React, { Component } from 'react';
import request from 'request';

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

      // Make a POST request
      const options = {
	url: window.location.origin + '/login/callback',
	body : {
	  code: code
	},
	json: true
      };

      request.post(options, function(error, response, body) {
	if (!error && response.statusCode === 200) {
	  window.location.href = '/library';
	}
      });
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
