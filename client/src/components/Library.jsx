import React, { Component } from "react";
import request from "request";
import styled from "styled-components";
import LazyLoad from "react-lazyload";

import Album from "./Album";
import Controls from "./Controls";

const LibraryH1 = styled.h1`
  text-align: center;
  color: white;
  margin: 0;
  margin-bottom: 1em;
  font-size: 1.75em;

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

class Library extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortMode: "duration",
      selectedOption: "1m",
      albumIds: [],
      options: {
        duration: [],
        releaseYear: []
      }
    };
  }

  componentDidMount() {
    // console.log("componentDidMount");

    // Get query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sortModeParam = urlParams.get("sortMode");
    const optionParam = urlParams.get("option");

    // Initialize with default settings first
    request.get(
      {
        url: `${window.location.origin}/api/library/initialize?sortMode=${sortModeParam}&option=${optionParam}`,
        json: true
      },
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          // TODO: Don't set state if array is empty
          this.setState({
            albumIds: body.albumIds,
            options: body.options
          });
        }
      }
    );

    // Update library asynchronously, which will re-render, if necessary
    // request.get(
    //   {
    //     url: `${window.location.origin}/api/library/update`,
    //     json: true
    //   },
    //   (error, response, body) => {
    //     if (!error && response.statusCode === 200) {
    //       // TODO: Check if there is difference between current state and body before setting state
    //       this.setState({
    //         albumIds: body.albumIds,
    //         options: body.options
    //       });
    //     }
    //   }
    // );
  }

  updateMode = e => {
    const { sortMode, options } = this.state;

    // When sortMode has changed (current sortMode and e.target.value are not the same
    if (sortMode !== e.target.value) {
      const firstOption = options[e.target.value][0];

      window.history.pushState(
        {
          sortMode: e.target.value,
          option: firstOption
        },
        "",
        `?sortMode=${e.target.value}&option=${firstOption}`
      );

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

    window.history.pushState(
      {
        sortMode,
        option: selectedOption
      },
      "",
      `?sortMode=${sortMode}&option=${selectedOption}`
    );

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
            // TODO: Dynamically change height?
            return (
              <LazyLoad key={albumId} height={200}>
                <Album albumId={albumId} />
              </LazyLoad>
            );
          })}
        </AlbumsUl>

        <Controls
          selected={sortMode}
          onChangeSort={this.updateMode}
          options={options[sortMode]}
          onChangeOption={this.updateOption}
        />
      </div>
    );
  }
}

export default Library;
