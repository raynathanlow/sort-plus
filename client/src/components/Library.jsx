import React, { Component } from "react";
import request from "request";
import styled from "styled-components";
import LazyLoad from "react-lazyload";

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

const optionsUrl = `${window.location.origin}/api/library/options`;
const albumIdsUrl = `${window.location.origin}/api/library?sortMode=${defaultSortMode}&option=${defaultOption}`;

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
    // Get all available options
    request.get(
      {
        url: optionsUrl,
        json: true
      },
      (optionsErr, optionsRes, optionsBody) => {
        if (!optionsErr && optionsRes.statusCode === 200) {
          this.setState({
            options: optionsBody
          });

          // Get album IDs based on defaults
          request.get(
            {
              url: albumIdsUrl,
              json: true
            },
            (albumIdsErr, albumsIdsRes, albumIdsBody) => {
              if (!albumIdsErr && albumsIdsRes.statusCode === 200) {
                this.setState({
                  albumIds: albumIdsBody
                });
              }
            }
          );
        }
      }
    );
  }

  updateMode = e => {
    const { sortMode, options } = this.state;

    // When sortMode has changed (current sortMode and e.target.value are not the same
    if (sortMode !== e.target.value) {
      const firstOption = options[e.target.value][0];

      this.setState({
        sortMode: e.target.value
      });

      request.get(
        {
          url: `${window.location.origin}/api/library?sortMode=${e.target.value}&option=${firstOption}`,
          json: true
        },
        (error, response, body) => {
          if (!error && response.statusCode === 200) {
            this.setState({
              albumIds: body,
              selectedOption: firstOption
            });
          }
        }
      );
    }
  };

  updateOption = e => {
    const { sortMode } = this.state;

    const selectedOption = e.target.value;

    request.get(
      {
        url: `${window.location.origin}/api/library?sortMode=${sortMode}&option=${selectedOption}`,
        json: true
      },
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          this.setState({
            albumIds: body,
            selectedOption
          });
        }
      }
    );
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
