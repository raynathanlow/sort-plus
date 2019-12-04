import React from 'react';
import styled from 'styled-components';

import Tabs from './Tabs';

const ControlsDiv = styled.div`
  position: sticky;
  display: flex;
  justify-content: space-between;
  background-color: #282828;
  bottom: 0;
  z-index: 10;
`;

const OptionsDiv = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 0.4;
  justify-content: center;
  align-items: center;
`;

const Select = styled.select`
  // display: block;
  width: 5em;
  text-align: center;
`;

function Controls(props) {
  return (
    <ControlsDiv>
      <Tabs
        tabs={[{ value: "duration_ms", text: "Duration" },
        { value: "releaseYear", text: "Release Year" }]}
        onClick={props.onChangeSort}
        selected={props.selected} />

      <OptionsDiv>
        <Select
          name="options"
          id="options-select"
          // value={props.selected}
          onChange={props.onChangeOption} >
          {props.options.map((option) => {
            return <option key={option} value={option}>{option}</option>;
          })}
        </Select>
      </OptionsDiv>

    </ControlsDiv>
  );
}

export default Controls;
