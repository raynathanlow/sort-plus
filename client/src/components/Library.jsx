import React, { Component } from "react";
import axios from "axios";
import styled from "styled-components";
import LazyLoad from "react-lazyload";

import Album from "./Album";
import Offline from "./Offline";
import Controls from "./Controls";
import AlbumPlaceholder from "./AlbumPlaceholder";

const LibraryH1 = styled.h1`
  position: sticky;
  top: 0;
  text-align: center;
  color: white;
  background-color: #111114;
  margin: 0;
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

  @media (min-width: 500px) {
    display: flex;
    flex-wrap: wrap;
  }
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
      }
    };
  }

  componentDidMount() {
    axios.get("/api/library/options").then(response => {
      this.setState({
        options: response.data
      });

      axios
        .get(`/api/library?sortMode=${defaultSortMode}&option=${defaultOption}`)
        .then(response => {
          this.setState({
            albumIds: response.data
          });
        });
    });
  }

  updateMode = e => {
    const { sortMode, options } = this.state;

    // When sortMode has changed (current sortMode and e.target.value are not the same
    if (sortMode !== e.target.value) {
      const firstOption = options[e.target.value][0];

      this.setState({
        sortMode: e.target.value
      });

      axios
        .get(`/api/library?sortMode=${e.target.value}&option=${firstOption}`)
        .then(response => {
          this.setState({
            albumIds: response.data,
            selectedOption: firstOption
          });
        });
    }
  };

  updateOption = e => {
    const { sortMode } = this.state;

    const selectedOption = e.target.value;

    axios
      .get(`/api/library?sortMode=${sortMode}&option=${selectedOption}`)
      .then(response => {
        this.setState({
          albumIds: response.data,
          selectedOption
        });
      });
  };

  render() {
    const { sortMode, albumIds, options, selectedOption } = this.state;

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

        <Offline options={options} />

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
