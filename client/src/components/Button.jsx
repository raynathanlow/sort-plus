import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const ButtonA = styled.a`
  padding: 1em 2em;
  background-color: #1db954;
  border-radius: 2em;
  text-decoration: none;
  color: white;
`;

function Button(props) {
  const { url, text } = props;
  return <ButtonA href={url}>{text}</ButtonA>;
}

Button.propTypes = {
  url: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired
};

export default Button;
