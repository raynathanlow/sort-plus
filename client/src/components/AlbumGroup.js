import React from 'react';
import Album from './Album';

function AlbumGroup(props) {
  return <div>
    <h1 id={props.heading}>{props.heading}</h1>
    <ul>
      {props.albums.map((album) => {
        return <Album key={album.id}
          name={album.name}
          artistNames={album.artistNames[0]}
          image={album.images[2].url}
          releaseYear={album.releaseYear}
          publicUrl={album.publicUrl}
          explicit={album.explicit.toString()} />
      })}
    </ul>
  </div>
}

export default AlbumGroup;