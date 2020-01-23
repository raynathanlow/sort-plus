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

function checkArraysEqual(arr1, arr2) {
  for (let i = 0; i < arr1.length; i += 1) {
    if (arr1[i] !== arr2[i]) return false;
  }

  return true;
}

class Offline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      caching: false,
      albums: {},
      progress: 0,
      failed: [],
      readyToDownload: false
    };
  }

  componentDidMount() {
    const { updateView } = this.props;

    axios.get("/api/library/update").then(() => {
      console.log("Library updated!");

      updateView();

      if ("caches" in window) {
        // Determine whether or not the user needs to update their offline version

        // Request /albums
        console.log("Checking if cache needs updating...");

        // Compare albumIds in User document with cached version of album data
        axios.get("/api/library/albums").then(response => {
          console.log(response);

          this.setState({
            albums: response.data,
            readyToDownload: true
          });

          const albumIds = [];

          response.data.savedAlbums.forEach(savedAlbum => {
            albumIds.push(savedAlbum.id);
          });

          const cacheKeys = [];

          // TODO: Also need to check if options and album covers are up-to-date
          // Get the albumIds from /albums, get the albumIds from album-list keys using regex
          caches.open("albums").then(function(cache) {
            cache.keys().then(function(keys) {
              keys.forEach(function(request) {
                // Process cacheKeys so that only the id is pushed into array
                const equalSignIndex = request.url.indexOf("=");

                cacheKeys.push(request.url.slice(equalSignIndex + 1));
              });

              // Compare the albumIds
              if (!checkArraysEqual(albumIds.sort(), cacheKeys.sort())) {
                console.log("Update required!");
              } else {
                console.log("Up to date!");
              }
            });
          });
        });

        // Get options
        axios.get("/api/library/options").then(response => {
          const options = response.data;

          // Create array of requests for each option per sort mode
          const newAlbumLists = [];

          const cachedAlbumLists = [];

          // Put all options per sort mode into an array
          // For each option, replace the spaces with %20 to match the cached album lists
          options.duration.forEach(durationOption => {
            newAlbumLists.push(
              `${
                window.location.origin
              }/api/library?sortMode=duration&option=${durationOption.replace(
                / /g,
                "%20"
              )}`
            );
          });

          options.releaseYear.forEach(yearOption => {
            yearOption.replace(/ /g, "%20");
            newAlbumLists.push(
              `${
                window.location.origin
              }/api/library?sortMode=releaseYear&option=${yearOption.replace(
                / /g,
                "%20"
              )}`
            );
          });

          // Get album-lists cache's keys
          caches.open("album-lists").then(function(cache) {
            cache.keys().then(function(keys) {
              keys.forEach(function(request) {
                cachedAlbumLists.push(request.url);
              });

              // Compare the albumIds
              // Notify if there is discrepancy between the new album lists and its cached version
              if (
                !checkArraysEqual(newAlbumLists.sort(), cachedAlbumLists.sort())
              ) {
                console.log("Update required! - album-lists");
              } else {
                console.log("Up to date! - album-lists");
              }
            });
          });
        });
      }
    });
  }

  cache = () => {
    this.setState({
      caching: true,
      progress: 0
    });

    const { options } = this.props;

    const { albums } = this.state;

    // axios.get(`${window.location.origin}/api/library/albums`).then(response => {
    const savedAlbums = albums;

    // Compile array of requests
    const requests = [];

    // Requests for each option for both sort modes to get array of album IDs
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

    // Requests for saved album information
    savedAlbums.savedAlbums.forEach(savedAlbum => {
      requests.push(
        `${window.location.origin}/api/library/album?albumId=${savedAlbum.id}`
      );
    });

    // Requests for saved album covers
    savedAlbums.savedAlbumCovers.forEach(savedAlbumCover => {
      requests.push(savedAlbumCover);
    });

    let successful = 0;
    const total = requests.length;

    let failed = [];

    // Go through array requests and request for them all
    axios
      .all(
        requests.map(request =>
          axios
            .get(request)
            .then(response => {
              if (response.status === 200) {
                successful += 1;
                this.setState({
                  progress: successful / total
                });
              }
            })
            .catch(error => {
              failed.push(request);
              this.setState({
                failed
              });
            })
        )
      )
      .finally(() => {
        // console.log(failed);
        this.setState({
          caching: false
        });
      });
    // });
  };

  render() {
    const { caching, progress, failed, readyToDownload } = this.state;

    if ("caches" in window) {
      if (!caching && readyToDownload) {
        // Render a button that when clicked, will call the cache function
        return (
          <div>
            <Button type="button" onClick={this.cache}>
              Offline
            </Button>
            <div>Progress: {Math.trunc(progress * 100)}%</div>
            <div>Failed: {failed}</div>
          </div>
        );
      }

      if (caching) {
        return (
          <div>
            <ButtonCaching type="button" disabled={true}>
              Caching
            </ButtonCaching>
            <div>Progress: {Math.trunc(progress * 100)}%</div>
            <div>Failed: {failed}</div>
          </div>
        );
      }
    }

    return <div></div>;
  }
}

Offline.propTypes = {
  options: PropTypes.shape({
    duration: PropTypes.arrayOf(PropTypes.string).isRequired,
    releaseYear: PropTypes.arrayOf(PropTypes.string).isRequired
  }),
  updateView: PropTypes.func.isRequired
};

export default Offline;
