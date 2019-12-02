import React, { Component } from 'react';
import Album from './Album';
import Controls from './Controls';

import request from 'request';

class Library extends Component {
  constructor(props) {
    super(props);
    this.state = { albums: [], sortMode: 'duration_ms' };
  }

  componentDidMount() {
    const options = {
      url: window.location.origin + '/library',
      json: true
    };

    request.get(options, (error, response, body) => {
      if (!error & response.statusCode === 200) {
        this.setState({
          albums: body.sort((a, b) => a[this.state.sortMode] - b[this.state.sortMode])
        });
      }
    });
  }

  updateMode = (e) => {
    this.setState({
      sortMode: e.target.value,
      albums: this.state.albums.sort((a, b) => a[e.target.value] - b[e.target.value])
    });
  }

  render() {
    return (
      <div>
        <Controls onChange={this.updateMode} />
        <ul>
          {this.state.albums.map(function (currentAlbum, index) {
            return <Album key={index}
              name={currentAlbum.name}
              artistNames={currentAlbum.artistNames[0]}
              duration={currentAlbum.duration_ms}
              image={currentAlbum.images[2].url}
              totalTracks={currentAlbum.totalTracks}
              publicUrl={currentAlbum.publicUrl}
              explicit={currentAlbum.explicit.toString()}
            />
          })}
        </ul>
      </div>
    );
  }
}

export default Library;
