import React from 'react';
import styled from 'styled-components';

const ButtonA = styled.a`
  padding: 1em 2em;
  background-color: #1DB954;
  border-radius: 2em;
  text-decoration: none;
  color: white;
`;

function Button(props) {
    return <ButtonA href={props.url}>{props.text}</ButtonA>;
}

export default Button;