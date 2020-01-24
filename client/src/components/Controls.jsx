import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

import Tabs from "./Tabs";

const tabs = 300; // pixel breakpoint to show tabs

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

  @media (min-height: ${225}px) {
    justify-content: space-between;
    background-color: #282828;
  }

  @media (min-width: 600px) {
    width: 38em;
  }

  @media (min-width: 600px) and (min-height: 270px) {
    padding: 1em;
  }
`;

const TabsDiv = styled.div`
  display: none;

  @media (min-width: ${200}px) and (min-height: ${225}px) {
    display: flex;
    flex: 0 1 60%;
  }
`;

const SortDiv = styled.div`
  @media (min-width: ${200}px) and (min-height: ${225}px) {
    display: none;
  }
`;

const OptionsDiv = styled.div`
  @media (min-width: ${185}px) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 0.5em;
  }

  @media (min-width: ${200}px) and (min-height: ${225}px) {
    flex: 0 1 40%;
    margin: 0.5em;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.25em;

  @media (min-width: ${tabs}px) {
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
  onChangeSort: PropTypes.func.isRequired,
  selected: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChangeOption: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default Controls;
