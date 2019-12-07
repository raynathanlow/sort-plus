import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

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
  const { onChangeSort, selected, onChangeOption, options } = props;

  return (
    <ControlsDiv>
      <Tabs
        tabs={[
          { value: 'duration_ms', text: 'Duration' },
          { value: 'releaseYear', text: 'Release Year' }
        ]}
        onClick={onChangeSort}
        selected={selected}
      />

      <OptionsDiv>
        <Select name="options" id="options-select" onChange={onChangeOption}>
          {options.map(option => {
            return (
              <option key={option} value={option}>
                {option}
              </option>
            );
          })}
        </Select>
      </OptionsDiv>
    </ControlsDiv>
  );
}

Controls.propTypes = {
  onChangeSort: PropTypes.func.isRequired,
  selected: PropTypes.string.isRequired,
  onChangeOption: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default Controls;
