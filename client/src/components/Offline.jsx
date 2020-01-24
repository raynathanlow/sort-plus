import React, { Component } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import styled from "styled-components";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSync,
  faExclamationCircle,
  faCloudDownloadAlt
} from "@fortawesome/free-solid-svg-icons";
import offlinePin from "../offline-pin.svg";

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
      isDownloading: false,
      isUpdating: true,
      error: false,
      updateAvailable: false,
      albums: {},
      progress: 0
    };
  }

  componentDidMount() {
    const { updateView } = this.props;

    const { updateAvailable } = this.state;

    axios.get("/api/library/update").then(() => {
      console.log("Library updated!");

      updateView();

      if ("caches" in window) {
        // Determine whether or not the user needs to update their offline version

        // Request /albums
        console.log("Checking if cache needs updating...");

        // Promise.all for /albums and /options
        axios
          .all([
            axios.get("/api/library/albums"),
            axios.get("/api/library/options")
          ])
          .then(response => {
            // Store savedAlbum IDs
            const albumsRes = response[0].data;

            this.setState({
              albums: albumsRes
            });

            const albumIds = [];

            albumsRes.savedAlbums.forEach(savedAlbum => {
              albumIds.push(savedAlbum.id);
            });

            // Store album lists
            const optionsRes = response[1].data;

            const albumLists = [];

            // Put all options per sort mode into an array
            // For each option, replace the spaces with %20 to match the cached album lists
            optionsRes.duration.forEach(durationOption => {
              albumLists.push(
                `${
                  window.location.origin
                }/api/library?sortMode=duration&option=${durationOption.replace(
                  / /g,
                  "%20"
                )}`
              );
            });

            optionsRes.releaseYear.forEach(yearOption => {
              yearOption.replace(/ /g, "%20");
              albumLists.push(
                `${
                  window.location.origin
                }/api/library?sortMode=releaseYear&option=${yearOption.replace(
                  / /g,
                  "%20"
                )}`
              );
            });

            // Get cached album IDs and album lists
            Promise.all([
              caches.open("albums"),
              caches.open("album-lists")
            ]).then(values => {
              const albumIdsCache = values[0];
              const albumListsCache = values[1];

              const cachedAlbumIds = [];
              const cachedAlbumLists = [];

              Promise.all([albumIdsCache.keys(), albumListsCache.keys()]).then(
                keys => {
                  const albumIdsCacheKeys = keys[0];
                  const albumListsCacheKeys = keys[1];

                  albumIdsCacheKeys.forEach(request => {
                    // Process cacheKeys so that only the id is pushed into array
                    const equalSignIndex = request.url.indexOf("=");
                    cachedAlbumIds.push(request.url.slice(equalSignIndex + 1));
                  });

                  albumListsCacheKeys.forEach(request => {
                    cachedAlbumLists.push(request.url);
                  });

                  // Determine if cache update is available or not

                  // If there are discrepancies between the updated and cached versions,
                  // then update is available
                  if (
                    !checkArraysEqual(albumIds.sort(), cachedAlbumIds.sort()) ||
                    !checkArraysEqual(
                      albumLists.sort(),
                      cachedAlbumLists.sort()
                    )
                  ) {
                    this.setState({
                      isUpdating: false,
                      updateAvailable: true
                    });

                    console.log("Update available!");
                  }

                  // If there are no discrepancies between updated and cached versions,
                  // then no update is available
                  if (
                    checkArraysEqual(albumIds.sort(), cachedAlbumIds.sort()) ||
                    checkArraysEqual(albumLists.sort(), cachedAlbumLists.sort())
                  ) {
                    this.setState({
                      isUpdating: false,
                      updateAvailable: false
                    });

                    console.log("No update necessary!");
                  }
                }
              );
            });
          });
      }
    });
  }

  cache = () => {
    this.setState({
      isDownloading: true,
      progress: 0,
      updateAvailable: false
    });

    const { options } = this.props;

    const { albums } = this.state;

    const savedAlbums = albums;

    console.log("savedAlbums", savedAlbums);

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
              this.setState({
                error: true
              });
            })
        )
      )
      .finally(() => {
        this.setState({
          isDownloading: false
        });
      });
    // });
  };

  render() {
    const {
      isDownloading,
      isUpdating,
      progress,
      error,
      updateAvailable
    } = this.state;

    if ("caches" in window) {
      if (isDownloading && !isUpdating) {
        return (
          <CircularProgressbar
            value={Math.trunc(progress * 100)}
            text={`${Math.trunc(progress * 100)}%`}
          />
        );
      }

      if (!isDownloading && !isUpdating && !updateAvailable) {
        return <img src={offlinePin} alt="offline pin" />;
      }

      if (updateAvailable) {
        return (
          <FontAwesomeIcon icon={faCloudDownloadAlt} onClick={this.cache} />
        );
      }

      if (isUpdating) {
        return <FontAwesomeIcon icon={faSync} spin />;
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
