import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

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

function generateArtistStr(artistNames) {
  const result = [];

  artistNames.forEach(artist => {
    result.push(artist);
  });

  return result.join(', ');
}

function AlbumGroup(props) {
  const { heading, albums } = props;

  return (
    <AlbumGroupDiv>
      <AlbumH1 id={heading}>{heading}</AlbumH1>
      <AlbumGroupUl>
        {albums.map(album => {
          return (
            <Album
              key={album.id}
              name={album.name}
              artistNames={generateArtistStr(album.artistNames)}
              image={album.images[1].url}
              totalTracks={album.totalTracks}
              publicUrl={album.publicUrl}
              explicit={album.explicit}
            />
          );
        })}
      </AlbumGroupUl>
    </AlbumGroupDiv>
  );
}

AlbumGroup.propTypes = {
  heading: PropTypes.string.isRequired,
  albums: PropTypes.arrayOf(PropTypes.shape).isRequired
};

export default AlbumGroup;
