import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const AlbumLink = styled.span`
  // https://stackoverflow.com/a/22074404
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  text-decoration: none; /* No underlines on the link */
  z-index: 1; /* Places the link above everything else in the div */
  background-color: #fff; /* Fix to make div clickable in IE */
  opacity: 0; /* Fix to make div clickable in IE */
  filter: alpha(opacity=1); /* Fix to make div clickable in IE */
`;

const AlbumDiv = styled.div`
  position: relative;
  display: flex;
  margin-bottom: 1em;
`;

const AlbumImgDiv = styled.div`
  // display: flex;
  width: 30%;
`;

const AlbumImg = styled.img`
  display: block;
  width: 100%;
`;

const InfoDiv = styled.div`
  display: flex;
  width: 70%;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.25em 0em;
  padding-left: 1em;
`;

const TracksExplicit = styled.div`
  display: flex;
  justify-content: space-between;
`;

const OneLine = styled.span`
  // https://stackoverflow.com/a/13924997 - may need some fallbacks for IE?
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1; /* number of lines to show */
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

function Album(props) {
  const { publicUrl, image, name, artistNames, totalTracks, explicit } = props;

  return (
    <li>
      <AlbumDiv>
        <a target="_blank" rel="noopener noreferrer" href={publicUrl}>
          <AlbumLink className="link-spanner" />
        </a>

        <AlbumImgDiv>
          <AlbumImg src={image} alt={name} />
        </AlbumImgDiv>

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
            <div>
              {totalTracks}
              {totalTracks > 1 ? " tracks" : " track"}
            </div>
            <div>{explicit ? <Explicit>EXPLICIT</Explicit> : null}</div>
          </TracksExplicit>
        </InfoDiv>
      </AlbumDiv>
    </li>
  );
}

Album.propTypes = {
  publicUrl: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  artistNames: PropTypes.string.isRequired,
  totalTracks: PropTypes.number.isRequired,
  explicit: PropTypes.bool.isRequired
};

export default Album;
