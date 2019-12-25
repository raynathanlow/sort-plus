import React, { Component } from "react";
import request from "request";
import styled from "styled-components";
import PropTypes from "prop-types";
import LazyLoad from "react-lazyload";

import AlbumPlaceholder from "./AlbumPlaceholder";

const AlbumLink = styled.span`
  // https://stackoverflow.com/a/22074404
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  text-decoration: none; No underlines on the link
  z-index: 1; Places the link above everything else in the div
  background-color: #fff; Fix to make div clickable in IE
  opacity: 0; Fix to make div clickable in IE
  filter: alpha(opacity=1); Fix to make div clickable in IE
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
  position: relative; // Needs to be relative for link span
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
`;

const TracksExplicit = styled.div`
  display: none;
  @media (min-width: 180px) {
    display: flex;
  }
  justify-content: space-between;
`;

const OneLine = styled.span`
  // https://stackoverflow.com/a/13924997 - may need some fallbacks for IE?
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1; number of lines to show
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

class Album extends Component {
  constructor(props) {
    super(props);
    this.state = {
      publicUrl: "",
      image: "https:via.placeholder.com/300",
      name: "Fetching album data...",
      artistNames: "",
      totalTracks: "",
      explicit: false
    };
  }

  componentDidMount() {
    const { albumId } = this.props;

    request.get(
      {
        url: `${window.location.origin}/api/library/album?albumId=${albumId}`,
        json: true
      },
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          this.setState({
            publicUrl: body.publicUrl,
            image: body.images[1].url,
            name: body.name,
            artistNames: body.artistNames,
            totalTracks: `${body.totalTracks} ${
              body.totalTracks !== 1 ? " tracks" : " track"
            }`,
            explicit: body.explicit
          });
        }
      }
    );
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

    return (
      <LazyLoad placeholder={<AlbumPlaceholder />}>
        <AlbumLi>
          <AlbumDiv>
            <AlbumImgDiv>
              <AlbumImg src={image} alt={name} />
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
      </LazyLoad>
    );
  }
}

Album.propTypes = {
  albumId: PropTypes.string.isRequired
};

export default Album;
