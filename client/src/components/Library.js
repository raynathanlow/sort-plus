import React, { Component } from 'react';
import request from 'request';

class Library extends Component {

  componentDidMount() {
    const options = {
      url: window.location.origin + '/library',
      json: true
    };

    request.get(options, function(error, response, body) {
      if (!error & response.statusCode === 200) {
	console.log(body);
      }
    });
  }

  render() {
    return (
	<div>
	Library
      </div>
    );
  }
}

export default Library;
