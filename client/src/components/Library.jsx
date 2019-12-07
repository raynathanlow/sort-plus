import React, { Component } from 'react';
import request from 'request';
import styled from 'styled-components';

import AlbumGroup from './AlbumGroup';
import Controls from './Controls';

const LibraryDiv = styled.div`
  background-color: #282828;
`;

function updateOption(e) {
  window.location.href = `#${e.target.value}`;
}

function toHoursAndMinutes(ms) {
  let minutes = ms / 1000 / 60;
  const hours = Math.trunc(minutes / 60);
  minutes = Math.trunc(minutes - hours * 60);

  // Only show hours, if it is not 0
  if (hours) {
    return `${hours.toString()} h ${minutes.toString()} m`;
  }
  return `${minutes.toString()} m`;
}

class Library extends Component {
  constructor(props) {
    super(props);
    this.state = {
      albums: [],
      sortedAlbums: [],
      options: [],
      sortMode: 'duration_ms'
    };
  }

  componentDidMount() {
    const { sortMode } = this.state;

    const options = {
      url: `${window.location.origin}/api/library`,
      json: true
    };

    request.get(options, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        this.organize(sortMode, body);
      }
    });
  }

  getHeading(group) {
    const { sortMode } = this.state;

    if (sortMode === 'duration_ms') {
      return toHoursAndMinutes(group[0].duration_ms);
    }
    return group[0].releaseYear;
  }

  updateMode = e => {
    const { albums } = this.state;

    this.organize(e.target.value, albums);
  };

  // Return an array of arrays which is divided by similar data
  organize(sortMode, albums) {
    albums.sort((a, b) => a[sortMode] - b[sortMode]);

    let currentGroup;
    let currentGroupArr = [];
    const combinedArr = [];
    const options = [];

    if (sortMode === 'duration_ms') {
      currentGroup = toHoursAndMinutes(albums[0].duration_ms);

      options.push(toHoursAndMinutes(albums[0].duration_ms));

      albums.forEach(element => {
        // If element doesn't match the currentGroup,
        if (currentGroup !== toHoursAndMinutes(element.duration_ms)) {
          combinedArr.push(currentGroupArr); // Add the currentGroup to the combined array
          currentGroup = toHoursAndMinutes(element.duration_ms); // Update currentGroup
          currentGroupArr = []; // Reset array

          // Add toHoursAndMinutes(element.duration_ms) to options state array
          options.push(toHoursAndMinutes(element.duration_ms));

          currentGroupArr.push(element); // Add element of new group to arr
        } else {
          currentGroupArr.push(element); // Add element to arr
        }
      });

      combinedArr.push(currentGroupArr); // Add last group

      this.setState({
        albums,
        sortedAlbums: combinedArr,
        options,
        sortMode
      });
    } else if (sortMode === 'releaseYear') {
      currentGroup = albums[0].releaseYear;

      options.push(albums[0].releaseYear);

      albums.forEach(element => {
        // If element doesn't match the currentGroup,
        if (currentGroup !== element.releaseYear) {
          combinedArr.push(currentGroupArr); // Add the currentGroup to the combined array
          currentGroup = element.releaseYear; // Update currentGroup
          currentGroupArr = []; // Reset array

          // Add element.releaseYear to options state array
          options.push(element.releaseYear);

          currentGroupArr.push(element); // Add element of new group to arr
        } else {
          currentGroupArr.push(element); // Add element to arr
        }
      });

      combinedArr.push(currentGroupArr); // Add last group

      this.setState({
        albums,
        sortedAlbums: combinedArr,
        options,
        sortMode
      });
    }
  }

  render() {
    const { sortedAlbums, sortMode, options } = this.state;

    return (
      <LibraryDiv>
        {/* pass options array to Controls */}

        {sortedAlbums.map(group => {
          return (
            <AlbumGroup
              key={this.getHeading(group)}
              heading={this.getHeading(group)}
              albums={group}
            />
          );
        })}
        <Controls
          selected={sortMode}
          onChangeSort={this.updateMode}
          options={options}
          onChangeOption={updateOption}
        />
      </LibraryDiv>
    );
  }
}

export default Library;
