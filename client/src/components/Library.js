import React, { Component } from 'react';
import AlbumGroup from './AlbumGroup';
import Controls from './Controls';

import request from 'request';

class Library extends Component {
  constructor(props) {
    super(props);
    this.state = { albums: [], sortedAlbums: [], sortMode: 'duration_ms' };
  }

  componentDidMount() {
    const options = {
      url: window.location.origin + '/library',
      json: true
    };

    request.get(options, (error, response, body) => {
      if (!error & response.statusCode === 200) {
        this.organize(this.state.sortMode, body);
      }
    });
  }

  // Return an array of arrays which is divided by similar data
  organize = (sortMode, albums) => {
    albums.sort((a, b) => a[sortMode] - b[sortMode]);

    let currentGroup;
    let currentGroupArr = [];
    let combinedArr = [];

    if (sortMode === 'duration_ms') {
      currentGroup = this.toHoursAndMinutes(albums[0].duration_ms);

      albums.forEach(element => {
        // If element doesn't match the currentGroup,
        if (currentGroup !== this.toHoursAndMinutes(element.duration_ms)) {
          combinedArr.push(currentGroupArr); // Add the currentGroup to the combined array
          currentGroup = this.toHoursAndMinutes(element.duration_ms); // Update currentGroup
          currentGroupArr = []; // Reset array

          currentGroupArr.push(element); // Add element of new group to arr
        } else {
          currentGroupArr.push(element); // Add element to arr
        }
      });

      combinedArr.push(currentGroupArr); // Add last group

      this.setState({ albums: albums, sortedAlbums: combinedArr, sortMode: sortMode });
    } else if (sortMode === 'releaseYear') {
      currentGroup = albums[0].releaseYear;

      albums.forEach(element => {
        // If element doesn't match the currentGroup,
        if (currentGroup !== element.releaseYear) {
          combinedArr.push(currentGroupArr); // Add the currentGroup to the combined array
          currentGroup = element.releaseYear; // Update currentGroup
          currentGroupArr = []; // Reset array

          currentGroupArr.push(element); // Add element of new group to arr
        } else {
          currentGroupArr.push(element); // Add element to arr
        }
      });

      combinedArr.push(currentGroupArr); // Add last group

      this.setState({ albums: albums, sortedAlbums: combinedArr, sortMode: sortMode });
    }
  }

  updateMode = (e) => {
    this.organize(e.target.value, this.state.albums);
  }

  toHoursAndMinutes = (ms) => {
    let minutes = ms / 1000 / 60;
    let hours = Math.trunc(minutes / 60);
    minutes = Math.trunc(minutes - (hours * 60));

    // Only show hours, if it is not 0
    if (hours) {
      return hours.toString() + 'h ' + minutes.toString() + 'm';
    } else {
      return minutes.toString() + 'm';
    }
  }

  getHeading = (group) => {
    if (this.state.sortMode === 'duration_ms') {
      return this.toHoursAndMinutes(group[0].duration_ms);
    } else if (this.state.sortMode === 'releaseYear') {
      return group[0].releaseYear;
    }
  }

  render() {
    console.log('render');
    return (
      <div>
        <Controls onChange={this.updateMode} />
        {this.state.sortedAlbums.map((group) => {
          return <AlbumGroup key={this.getHeading(group)}
            heading={this.getHeading(group)}
            albums={group} />;
        })}
      </div>
    );
  }
}

export default Library;
