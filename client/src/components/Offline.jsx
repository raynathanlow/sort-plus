import React, { Component } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import styled from "styled-components";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSync,
  faExclamationCircle,
  faCloudDownloadAlt
} from "@fortawesome/free-solid-svg-icons";
import offlinePin from "../offline-pin.svg";
import wifiOff from "../wifi-off.svg";

const OfflineDiv = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 15;
`;

const IconDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;

  & img {
    width: 1.7em;
  }
`;

const ProgressDiv = styled.div`
  width: 1.5em;
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
      updateAvailable: false,
      albums: {},
      options: [],
      progress: 0,
      isSyncing: true
    };
  }

  componentDidMount() {
    if ("caches" in window) {
      // Cache wifi off icon
      axios.get(wifiOff);
    }
  }

  componentDidUpdate(prevProps) {
    const { updateAvailable } = this.state;
    const { isUpdating } = this.props;

    if (
      "caches" in window &&
      prevProps.isUpdating &&
      !isUpdating &&
      !updateAvailable
    ) {
      // Determine whether or not the user needs to update their offline version
      // Request /albums
      console.log("Checking if cache needs updating...");

      axios
        .all([
          axios.get("/api/library/albums"),
          axios.get("/api/library/options")
        ])
        .then(response => {
          // Store savedAlbum IDs
          const albumsRes = response[0].data;
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

          this.setState({
            albums: albumsRes,
            options: optionsRes
          });
          // Get cached album IDs and album lists
          Promise.all([caches.open("albums"), caches.open("album-lists")]).then(
            values => {
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
                      updateAvailable: true,
                      isSyncing: false
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
                      updateAvailable: false,
                      isSyncing: false
                    });
                    console.log("No update necessary!");
                  }
                }
              );
            }
          );
        });
    }
  }

  cache = () => {
    this.setState({
      isDownloading: true,
      progress: 0,
      updateAvailable: false
    });

    const { albums, options } = this.state;

    const savedAlbums = albums;

    console.log("savedAlbums", savedAlbums);

    console.log("options", options);

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
    const { isDownloading, progress, updateAvailable, isSyncing } = this.state;

    const { isUpdating, isOnline } = this.props;

    if ("caches" in window) {
      if (isDownloading && !isUpdating && isOnline) {
        return (
          <OfflineDiv>
            <ProgressDiv>
              <CircularProgressbar
                value={Math.trunc(progress * 100)}
                strokeWidth={15}
                styles={buildStyles({
                  pathColor: "#1db954",
                  trailColor: "#ffffff"
                })}
              />
            </ProgressDiv>
          </OfflineDiv>
        );
      }

      if (
        !isDownloading &&
        !isUpdating &&
        !updateAvailable &&
        isOnline &&
        !isSyncing
      ) {
        return (
          <OfflineDiv>
            <IconDiv>
              <img src={offlinePin} alt="offline pin" />
            </IconDiv>
          </OfflineDiv>
        );
      }

      if (updateAvailable && isOnline) {
        return (
          <OfflineDiv>
            <IconDiv>
              <FontAwesomeIcon
                icon={faCloudDownloadAlt}
                size="lg"
                onClick={this.cache}
                style={{ cursor: "pointer" }}
              />
            </IconDiv>
          </OfflineDiv>
        );
      }

      if ((isUpdating || isSyncing) && isOnline) {
        return (
          <OfflineDiv>
            <IconDiv>
              <FontAwesomeIcon icon={faSync} size="lg" spin />
            </IconDiv>
          </OfflineDiv>
        );
      }

      if (!isOnline) {
        return (
          <OfflineDiv>
            <IconDiv>
              <img src={wifiOff} alt="wifi off" />
            </IconDiv>
          </OfflineDiv>
        );
      }
    }

    return <div />;
  }
}

Offline.propTypes = {
  options: PropTypes.shape({
    duration: PropTypes.arrayOf(PropTypes.string).isRequired,
    releaseYear: PropTypes.arrayOf(PropTypes.string).isRequired
  }),
  isUpdating: PropTypes.bool.isRequired,
  isOnline: PropTypes.bool.isRequired
};

export default Offline;
