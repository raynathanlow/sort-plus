import React from "react";
import styled, { keyframes } from "styled-components";

import placeholderImg from "../placeholder.png";

const loading = keyframes`
  to {
    opacity: 0.3;
  }
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

  background-color: #282828;

  animation: ${loading} 1s alternate infinite ease-in-out;
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
  justify-content: space-between;

  @media (min-width: 180px) {
    display: flex;
  }
`;

const Skeleton = styled.div`
  height: 1.5em;
  background-color: #282828;

  animation: ${loading} 1s alternate infinite ease-in-out;
`;

const AlbumNameSkeleton = styled(Skeleton)`
  width: 70%;
  margin-bottom: 0.5em;
`;

const ArtistNamesSkeleton = styled(Skeleton)`
  width: 50%;
`;

const TracksExplicitSkeleton = styled(Skeleton)`
  width: 33%;
`;

// Version of Album component where a grey bar replaces where album data would be
function AlbumPlaceholder() {
  return (
    <AlbumLi>
      <AlbumDiv>
        <AlbumImgDiv>
          <AlbumImg src={placeholderImg} />
        </AlbumImgDiv>

        <InfoDiv>
          <div>
            <AlbumNameSkeleton />
            <ArtistNamesSkeleton />
          </div>

          <TracksExplicit>
            <TracksExplicitSkeleton />
            <TracksExplicitSkeleton />
          </TracksExplicit>
        </InfoDiv>
      </AlbumDiv>
    </AlbumLi>
  );
}

export default AlbumPlaceholder;
