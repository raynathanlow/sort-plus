import React, { Component } from "react";
import axios from "axios";
import styled from "styled-components";
import PropTypes from "prop-types";

import AlbumPlaceholder from "./AlbumPlaceholder";
import placeholderImg from "../placeholder.png";

const AlbumLink = styled.span`
  // Make div into a link - https://stackoverflow.com/a/22074404
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  text-decoration: none; // No underlines on the link
  z-index: 1; // Places the link above everything else in the div
  background-color: #fff; // Fix to make div clickable in IE
  opacity: 0; // Fix to make div clickable in IE
  filter: alpha(opacity=1); // Fix to make div clickable in IE
`;

const AlbumLi = styled.li`
  color: white;

  @media (min-width: 500px) {
    flex: 0 1 50%;
  }

  @media (min-width: 1000px) {
    flex: 0 1 33%;
  }

  @media (min-width: 1500px) {
    flex: 0 1 25%;
  }
`;

const AlbumDiv = styled.div`
  position: relative; // Needs to be relative for AlbumLink span
  display: flex;
  margin-bottom: 1em;

  @media (min-width: 500px) {
    padding: 0.5em;
  }
`;

const AlbumImgDiv = styled.div`
  display: flex;
  align-items: center;
  flex: 0 1 30%;
`;

const AlbumImg = styled.img`
  width: 100%;
`;

const InfoDiv = styled.div`
  display: flex;
  flex: 0 1 70%;
  flex-direction: column;
  justify-content: space-between;
  font-size: 0.85em;
  padding-left: 0.5em;
  line-height: 1.5em;
`;

const TracksExplicit = styled.div`
  display: none;
  @media (min-width: 180px) {
    display: flex;
  }
  justify-content: space-between;
`;

const OneLine = styled.span`
  // Limit text to n lines - https://stackoverflow.com/a/13924997
  // This solution may need some fallbacks for IE
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1; // number of lines to show
`;

const AlbumName = styled(OneLine)`
  color: white;
  text-decoration: none;
  font-weight: bold;
`;

const Explicit = styled.span`
  color: #000000;
  background-color: hsla(0, 0%, 100%, 0.6);
  border-radius: 2px;
  padding: 0 0.3em;
  letter-spacing: 0.015em;
`;

/**
 * Generate string of artist names separated by comma and space
 * @param  {array} artistNames
 * @return {string}
 */
function generateArtistStr(artistNames) {
  const result = [];

  artistNames.forEach(artist => {
    result.push(artist);
  });

  return result.join(", ");
}

class Album extends Component {
  constructor(props) {
    super(props);
    this.state = {
      publicUrl: "",
      image: placeholderImg,
      name: "",
      artistNames: "",
      totalTracks: "",
      explicit: ""
    };
  }

  componentDidMount() {
    const { albumId } = this.props;

    // Get album data based on albumId prop
    axios
      .get(`/api/library/album?albumId=${albumId}`)
      .then(response => {
        this.setState({
          publicUrl: response.data.publicUrl,
          image: response.data.images[1].url,
          name: response.data.name,
          artistNames: generateArtistStr(response.data.artistNames),
          totalTracks: `${response.data.totalTracks} ${
            response.data.totalTracks !== 1 ? " tracks" : " track"
          }`,
          explicit: response.data.explicit
        });
      })
      .catch(error => {
        // TODO: handle error
        console.log(error);
      });
  }

  render() {
    const {
      publicUrl,
      image,
      name,
      artistNames,
      totalTracks,
      explicit
    } = this.state;

    // Before getting album data with albumId prop, render AlbumPlaceholder
    if (name === "") {
      return <AlbumPlaceholder />;
    }

    // Otherwise, render with received album data
    return (
      <AlbumLi>
        <AlbumDiv>
          <AlbumImgDiv>
            <AlbumImg src={image} alt="" />
          </AlbumImgDiv>

          <a target="_blank" rel="noopener noreferrer" href={publicUrl}>
            <AlbumLink className="link-spanner" />
          </a>

          <InfoDiv>
            <div>
              <div>
                <AlbumName>{name}</AlbumName>
              </div>
              <div>
                <OneLine>{artistNames}</OneLine>
              </div>
            </div>

            <TracksExplicit>
              <div>{totalTracks}</div>
              <div>{explicit ? <Explicit>EXPLICIT</Explicit> : null}</div>
            </TracksExplicit>
          </InfoDiv>
        </AlbumDiv>
      </AlbumLi>
    );
  }
}

Album.propTypes = {
  albumId: PropTypes.string.isRequired
};

export default Album;
