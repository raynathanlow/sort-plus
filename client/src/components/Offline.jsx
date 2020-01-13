import React, { Component } from "react";
import request from "request";
import PropTypes from "prop-types";
import styled from "styled-components";

const Button = styled.button`
  background-color: green;
`;

const ButtonCaching = styled.button`
  background-color: red;
`;

function cacheOptions(options) {
  // Compile array of requests for all options regardless of sort mode
  const requests = [];

  options.duration.forEach(durationOption => {
    requests.push(
      `${window.location.origin}/api/library?sortMode=duration&option=${durationOption}`
    );
  });

  options.releaseYear.forEach(yearOption => {
    requests.push(
      `${window.location.origin}/api/library?sortMode=releaseYear&option=${yearOption}`
    );
  });

  console.log(requests);

  // Go through both arrays of requests and request them all
  Promise.all(requests.map(request => fetch(request).then(res => res.json())));
}

function cacheAlbums(savedAlbums) {
  console.log(savedAlbums.length);
  // Compile array of requests for all saved albums
  const requests = [];

  savedAlbums.forEach(savedAlbum => {
    console.log(savedAlbum.id);
    requests.push(
      `${window.location.origin}/api/library/album?albumId=${savedAlbum.id}`
    );
  });

  // Go through array of album IDs and request for them all, but don't do anything with them
  Promise.all(requests.map(request => fetch(request).then(res => res.json())));

  // Once both are done, visually give feedback
}

class Offline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      caching: false
    };
  }

  cache = () => {
    this.setState({
      caching: true
    });

    const { options } = this.props;

    cacheOptions(options);

    // Get album IDs based on defaults
    request.get(
      {
        url: `${window.location.origin}/api/library/albums`,
        json: true
      },
      (savedAlbumsErr, savedAlbumsRes, savedAlbumsBody) => {
        if (!savedAlbumsErr && savedAlbumsRes.statusCode === 200) {
          cacheAlbums(savedAlbumsBody);
        }
      }
    );

    // TODO: Once caching is finished, set caching state to false
  };

  render() {
    const { caching } = this.state;

    if ("caches" in window) {
      if (caching === false) {
        // Render a button that when clicked, will call the cache function
        return (
          <Button type="button" onClick={this.cache}>
            Offline
          </Button>
        );
      }

      return (
        <ButtonCaching type="button" disabled="true">
          Caching
        </ButtonCaching>
      );
    }

    return <div></div>;
  }
}

Offline.propTypes = {
  options: PropTypes.shape({
    duration: PropTypes.arrayOf(PropTypes.string).isRequired,
    releaseYear: PropTypes.arrayOf(PropTypes.string).isRequired
  })
};

export default Offline;
