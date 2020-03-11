import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

import Tabs from "./Tabs";

const ControlsDiv = styled.div`
  position: fixed;
  display: flex;
  flex-direction: row;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  width: 100%;
  justify-content: center;

  @media (min-height: 225px) {
    justify-content: space-between;
    background-color: #282828;
  }

  // Fix width of Controls
  @media (min-width: 600px) {
    width: 38em;
  }

  // Increase padding of Controls
  @media (min-width: 600px) and (min-height: 270px) {
    padding: 1em;
  }
`;

const TabsDiv = styled.div`
  display: none;

  // Show Tabs
  @media (min-width: 200px) and (min-height: 225px) {
    display: flex;
    flex: 0 1 60%;
  }
`;

const SortDiv = styled.div`
  // Hide sortMode select element
  @media (min-width: 200px) and (min-height: 225px) {
    display: none;
  }
`;

const OptionsDiv = styled.div`
  @media (min-width: 185px) {
    margin-left: 0.5em;
  }

  @media (min-width: 185px) and (min-height: 225px) {
    // Vertically center options select element 
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 0.5em;
  }

  // Limit size of options select element to 40%
  // Add margin all around element
  @media (min-width: 200px) and (min-height: 225px) {
    flex: 0 1 40%;
    margin: 0.5em;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.25em;

  @media (min-width: 300px) {
    padding: 0.5em;
    margin-top: 0em;
  }
`;

function Controls(props) {
  const { onChangeSort, selected, value, onChangeOption, options } = props;

  return (
    <ControlsDiv>
      <TabsDiv>
        <Tabs
          tabs={[
            { value: "duration", text: "Duration" },
            { value: "releaseYear", text: "Release Year" }
          ]}
          onClick={onChangeSort}
          selected={selected}
        />
      </TabsDiv>

      <SortDiv>
        <Select name="options" id="options-select" onChange={onChangeSort}>
          <option key="duration" value="duration">
            Duration
          </option>
          <option key="releaseYear" value="releaseYear">
            Year
          </option>
        </Select>
      </SortDiv>

      <OptionsDiv>
        <Select
          name="options"
          id="options-select"
          onChange={onChangeOption}
          value={value}
        >
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
  selected: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChangeSort: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChangeOption: PropTypes.func.isRequired
};

export default Controls;
