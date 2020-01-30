import React, { Component } from "react";
import axios from "axios";
import styled from "styled-components";
import LazyLoad from "react-lazyload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

import Album from "./Album";
import Controls from "./Controls";
import AlbumPlaceholder from "./AlbumPlaceholder";

const LibraryH1 = styled.h1`
  position: sticky;
  top: 0;
  text-align: center;
  color: white;
  background-color: #111114;
  margin: 0;
  padding-top: 0.25em;
  padding-bottom: 0.25em;
  font-size: 1.75em;
  z-index: 15;

  @media (min-width: 500px) {
    font-size: 2em;
  }
`;

const AlbumsUl = styled.ul`
  list-style-type: none;
  padding: 0 0.5em;

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

// Defaults
const defaultSortMode = "duration";
const defaultOption = "1 m";

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
      isRequesting: false
    };
  }

  componentDidMount() {
    this.updateView();
  }

  updateView = () => {
    document.cookie = `loggedIn=true; max-age=${60 * 60 * 24 * 90}`;

    axios.get("/api/library/options").then(response => {
      const options = response.data;

      axios
        .get(`/api/library?sortMode=${defaultSortMode}&option=${defaultOption}`)
        .then(response => {
          console.log("Update current view!");

          this.setState({
            options,
            albumIds: response.data
          });
        });
    });
  };

  updateMode = e => {
    const { sortMode, options } = this.state;

    // When sortMode has changed (current sortMode and e.target.value are not the same
    if (sortMode !== e.target.value) {
      const firstOption = options[e.target.value][0];

      this.setState({
        sortMode: e.target.value,
        isRequesting: true
      });

      document.cookie = `loggedIn=true; max-age=${60 * 60 * 24 * 90}`;

      axios
        .get(`/api/library?sortMode=${e.target.value}&option=${firstOption}`)
        .then(response => {
          this.setState({
            albumIds: response.data,
            selectedOption: firstOption,
            isRequesting: false
          });
        });
    }
  };

  updateOption = e => {
    const { sortMode } = this.state;

    const selectedOption = e.target.value;

    this.setState({
      isRequesting: true,
      selectedOption
    });

    document.cookie = `loggedIn=true; max-age=${60 * 60 * 24 * 90}`;

    axios
      .get(`/api/library?sortMode=${sortMode}&option=${selectedOption}`)
      .then(response => {
        this.setState({
          albumIds: response.data,
          selectedOption,
          isRequesting: false
        });
      });
  };

  render() {
    const {
      sortMode,
      albumIds,
      options,
      selectedOption,
      isRequesting
    } = this.state;

    if (isRequesting) {
      return (
        <div>
          <LibraryH1>{selectedOption}</LibraryH1>
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

    return (
      <div>
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
