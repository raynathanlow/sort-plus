import React, { Component } from "react";
import axios from "axios";
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

  // Go through both arrays of requests and request them all
  Promise.all(requests.map(request => axios.get(request)));
}

function cacheAlbums(savedAlbums) {
  // Compile array of requests for all saved albums
  const requests = [];

  savedAlbums.savedAlbums.forEach(savedAlbum => {
    requests.push(
      `${window.location.origin}/api/library/album?albumId=${savedAlbum.id}`
    );
  });

  savedAlbums.savedAlbumCovers.forEach(savedAlbumCover => {
    requests.push(savedAlbumCover);
  });

  // Go through array of album IDs and request for them all, but don't do anything with them
  Promise.all(requests.map(request => axios.get(request)));

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

    axios.get(`${window.location.origin}/api/library/albums`).then(response => {
      console.log(response);
      cacheAlbums(response.data);
    });

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
        <ButtonCaching type="button" disabled={true}>
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
