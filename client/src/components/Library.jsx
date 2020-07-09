import React, { Component } from "react";
import axios from "axios";
import styled from "styled-components";
import LazyLoad from "react-lazyload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faExclamationTriangle,
  faBan
} from "@fortawesome/free-solid-svg-icons";
import { Helmet } from "react-helmet";

import Album from "./Album";
import Controls from "./Controls";
import AlbumPlaceholder from "./AlbumPlaceholder";
import * as constants from "../Constants";

const LibraryH1 = styled.h1`
  position: sticky;
  top: 0;
  text-align: center;
  color: white;
  background-color: #111114;
  margin: 0;
  padding-top: 0.25em;
  padding-bottom: 0.25em;
  padding-left: 0.5em;
  font-size: 1.75em;
  z-index: 15;

  @media (min-width: 500px) {
    font-size: 2em;
  }
`;

const AlbumsUl = styled.ul`
  list-style-type: none;
  padding: 0 0.5em;
  margin-bottom: 2em;

  @media (min-width: 300px) {
    margin-bottom: 3em;
  }

  @media (min-width: 200px) and (min-height: 225px) {
    margin-bottom: 6em;
  }

  @media (min-width: 420px) and (min-height: 225px) {
    margin-bottom: 4em;
  }

  @media (min-width: 500px) {
    display: flex;
    flex-wrap: wrap;
  }
`;

const IconDiv = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
`;

const ErrorDiv = styled.div`
  background-color: rgb(40, 40, 40);
  color: white;

  padding: 0.5em;

  @media (min-width: 150px) {
    padding: 1em;
  }

  @media (min-height: 230px) {
    // center of the page
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  @media (min-width: 430px) {
    display: flex;
    align-items: center;
  }
`;

const ErrorChildDiv = styled.div`
  margin: 0 1em;
`;

const ErrorType = styled.p`
  font-weight: bold;
  font-size: 1.3em;
`;

const LogInButton = styled.a`
  color: #1db954;
`;

const NoAlbumsDiv = styled.div`
  padding: 0.5em;
  text-align: center;
  color: white;

  @media (min-height: 400px) {
    // center of the page
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  @media (min-width: 260px) {
    margin: 2em 0;
  }
`;

const defaultSortMode = "duration";
let defaultOption = "1 m";

class Library extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortMode: defaultSortMode,
      selectedOption: defaultOption,
      albumIds: [],
      options: {
        duration: [],
        releaseYear: []
      },
      isRequesting: false,
      invalidSession: false,
      noSavedAlbums: false
    };
  }

  componentDidMount() {
    this.updateView();
  }

  /**
   * Update view with updated data based on default sort mode and option
   * @return {undefined}
   */
  updateView = () => {
    // Update max-age of loggedIn cookie to extend user's session by 90 days
    document.cookie = `loggedIn=true; max-age=${constants.SESSION_LENGTH}; secure; samesite=strict`;

    axios
      .get("/api/library/options")
      .then(optionsRes => {
        const options = optionsRes.data;

        if (options.duration.length > 0) {
          [defaultOption] = options.duration;

          axios
            .get(
              `/api/library?sortMode=${defaultSortMode}&option=${defaultOption}`
            )
            .then(response => {
              console.log("Update current view!");

              this.setState({
                options,
                albumIds: response.data,
                selectedOption: defaultOption
              });
            })
            .catch(error => {
              if (
                error.response.status === 401 &&
                error.response.data === "Invalid session"
              ) {
                this.setState({
                  invalidSession: true
                });
              }
            });
        } else {
          this.setState({
            noSavedAlbums: true
          });
        }
      })
      .catch(error => {
        if (
          error.response.status === 401 &&
          error.response.data === "Invalid session"
        ) {
          this.setState({
            invalidSession: true
          });
        }
      });
  };

  /**
   * Update mode based on user's interaction with Tabs component
   * @param  {object} e JavaScript onClick event
   * @return {undefined}
   */
  updateMode = e => {
    const { sortMode, options } = this.state;

    // When sortMode has changed (current sortMode and e.target.value are not the same
    if (sortMode !== e.target.value) {
      const firstOption = options[e.target.value][0];

      this.setState({
        sortMode: e.target.value,
        isRequesting: true
      });

      // Update max-age of loggedIn cookie to extend user's session by 90 days
      document.cookie = `loggedIn=true; max-age=${constants.SESSION_LENGTH}; secure; samesite=strict`;

      axios
        .get(`/api/library?sortMode=${e.target.value}&option=${firstOption}`)
        .then(response => {
          this.setState({
            albumIds: response.data,
            selectedOption: firstOption,
            isRequesting: false
          });
        })
        .catch(error => {
          if (
            error.response.status === 401 &&
            error.response.data === "Invalid session"
          ) {
            this.setState({
              invalidSession: true
            });
          }
        });
    }
  };

  /**
   * Update option of current sort mode based on user's interaction with Controls component's select element
   * @param  {object} e JavaScript onChange event
   * @return {undefined}
   */
  updateOption = e => {
    const { sortMode } = this.state;

    const selectedOption = e.target.value;

    this.setState({
      isRequesting: true,
      selectedOption
    });

    // Update max-age of loggedIn cookie to extend user's session by 90 days
    document.cookie = `loggedIn=true; max-age=${constants.SESSION_LENGTH}; secure; samesite=strict`;

    axios
      .get(`/api/library?sortMode=${sortMode}&option=${selectedOption}`)
      .then(response => {
        this.setState({
          albumIds: response.data,
          selectedOption,
          isRequesting: false
        });
      })
      .catch(error => {
        if (
          error.response.status === 401 &&
          error.response.data === "Invalid session"
        ) {
          this.setState({
            invalidSession: true
          });
        }
      });
  };

  render() {
    const {
      sortMode,
      albumIds,
      options,
      selectedOption,
      isRequesting,
      invalidSession,
      noSavedAlbums
    } = this.state;

    if (isRequesting) {
      return (
        <div>
          <LibraryH1>{selectedOption}</LibraryH1>

          {/* Loading icon */}
          <IconDiv>
            <FontAwesomeIcon icon={faCircleNotch} size="2x" spin />
          </IconDiv>

          <Controls
            selected={sortMode}
            value={selectedOption}
            onChangeSort={this.updateMode}
            options={options[sortMode]}
            onChangeOption={this.updateOption}
          />
        </div>
      );
    }

    // When session is invalid
    if (invalidSession) {
      // Delete loggedIn cookie
      document.cookie = `loggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;

      return (
        // Session Error
        <div>
          <Helmet>
            <title>Session Error - Sort Plus</title>
          </Helmet>
          <ErrorDiv>
            <ErrorChildDiv>
              <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
            </ErrorChildDiv>
            <ErrorChildDiv>
              <ErrorType>Session Error</ErrorType>
              <p>
                Please <LogInButton href="login">log in</LogInButton> again.
              </p>
            </ErrorChildDiv>
          </ErrorDiv>
        </div>
      );
    }

    // When user has no saved albums
    if (noSavedAlbums) {
      return (
        <div>
          <Helmet>
            <title>No Saved Albums - Sort Plus</title>
          </Helmet>
          <NoAlbumsDiv>
            <FontAwesomeIcon icon={faBan} size="4x" />
            <ErrorType>No Saved Albums in Your Spotify Library</ErrorType>
            <p>Save some albums first then refresh the page</p>
          </NoAlbumsDiv>
        </div>
      );
    }

    return (
      <div>
        <Helmet>
          <title>Library - Sort Plus</title>
        </Helmet>
        <LibraryH1>{selectedOption}</LibraryH1>
        <AlbumsUl>
          {albumIds.map(albumId => {
            return (
              <LazyLoad key={albumId} placeholder={<AlbumPlaceholder />}>
                <Album albumId={albumId} />
              </LazyLoad>
            );
          })}
        </AlbumsUl>

        <Controls
          selected={sortMode}
          value={selectedOption}
          onChangeSort={this.updateMode}
          options={options[sortMode]}
          onChangeOption={this.updateOption}
        />
      </div>
    );
  }
}

export default Library;
