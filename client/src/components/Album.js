import React from 'react';
import styled from 'styled-components';

const AlbumLink = styled.span`
  // https://stackoverflow.com/a/22074404
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  text-decoration: none; /* No underlines on the link */
  z-index: 1; /* Places the link above everything else in the div */
  background-color: #FFF; /* Fix to make div clickable in IE */
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
  background-color: hsla(0,0%,100%,.6);
  border-radius: 2px;
  padding: 0 0.3em;
  letter-spacing: .015em;
`;

function Album(props) {
  return <li>

    <AlbumDiv>
      <a target="_blank" rel="noopener noreferrer" href={props.publicUrl}><AlbumLink class="link-spanner"></AlbumLink></a>

      <AlbumImgDiv>
        <AlbumImg src={props.image} alt={props.name} />
      </AlbumImgDiv>

      <InfoDiv>
        <div>
          <div>
            <AlbumName>{props.name}</AlbumName>
          </div>
          <div>
            <OneLine>{props.artistNames}</OneLine>
          </div>
        </div>

        <TracksExplicit>
          <div>{props.totalTracks} {props.totalTracks > 1 ? ' tracks' : ' track'}</div>
          <div>{props.explicit ? <Explicit>EXPLICIT</Explicit> : null}</div>
        </TracksExplicit>
      </InfoDiv>

    </AlbumDiv>

  </li>;
}

export default Album;