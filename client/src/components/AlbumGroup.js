import React, { Component } from 'react';
import styled from 'styled-components';

import Album from './Album';

const AlbumGroupDiv = styled.div`
  color: white;
`;

const AlbumH1 = styled.h1`
  text-align: center;
  margin: 0;
`;

const AlbumGroupUl = styled.ul`
  list-style-type: none;
  padding: 0 1em;
`;

class AlbumGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      albums: [],
      sortedAlbums: [],
      options: [],
      sortMode: 'duration_ms'
    };
  }

  generateArtistStr = (artistNames) => {
    let result = [];

    artistNames.forEach(function (artist) {
      result.push(artist);
    });

    return result.join(', ');
  }

  render() {
    return <AlbumGroupDiv>
      <AlbumH1 id={this.props.heading}>{this.props.heading}</AlbumH1>
      <AlbumGroupUl>
        {this.props.albums.map((album) => {
          return <Album key={album.id}
            name={album.name}
            artistNames={this.generateArtistStr(album.artistNames)}
            image={album.images[1].url}
            totalTracks={album.totalTracks}
            publicUrl={album.publicUrl}
            explicit={album.explicit} />
        })}
      </AlbumGroupUl>
    </AlbumGroupDiv>
  }
}

export default AlbumGroup;