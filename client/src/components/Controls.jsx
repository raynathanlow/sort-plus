import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

import Tabs from "./Tabs";

const tabs = 300; // pixel breakpoint to show tabs

const ControlsDiv = styled.div`
  position: sticky;
  display: flex;
  flex-direction: column;
  background-color: #282828;
  bottom: 0;
  z-index: 10;

  @media (min-width: ${tabs}px) {
    flex-direction: row;
  }

  @media ((min-width: ${tabs}px) and (max-height: ${tabs}px)) {
    justify-content: center;
    margin: 0 auto;
  }

  @media (min-height: ${tabs}px) {
    justify-content: space-between;
  }

  @media((min-width: 725px) and (min-height: 200px)) {
    width: 35em;
    margin: 0 auto;
    padding: 1em;
  }
`;

const TabsDiv = styled.div`
  display: none;
  @media ((min-width: ${tabs}px) and (min-height: ${tabs}px)) {
    display: flex;
    flex: 0 1 60%;
  }

  @media(min-width: 400px) {
    flex: 0 1 75%;
  }
`;

const SortDiv = styled.div`
  @media ((min-width: ${tabs}px) and (min-height: ${tabs}px)) {
    display: none;
  }
`;

const OptionsDiv = styled.div`
  @media (min-width: ${tabs}px) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 0.5em;
  }

  @media ((min-width: ${tabs}px) and (min-height: ${tabs}px)) {
     flex: 0 1 40%;
  }

  @media(min-width: 400px) {
    flex: 0 1 25%;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.25em;
  margin-top: 0.5em;

  @media (min-width: ${tabs}px) {
    padding: 0.5em;
    margin: 0;
  }
`;

function Controls(props) {
  const { onChangeSort, selected, onChangeOption, options } = props;

  return (
    <ControlsDiv>
      <TabsDiv>
        <Tabs
          tabs={[
            { value: "duration_ms", text: "Duration" },
            { value: "releaseYear", text: "Release Year" }
          ]}
          onClick={onChangeSort}
          selected={selected}
        />
      </TabsDiv>

      <SortDiv>
        <Select name="options" id="options-select" onChange={onChangeSort}>
          <option key="duration_ms" value="duration_ms">
            Duration
          </option>
          <option key="releaseYear" value="releaseYear">
            Year
          </option>
        </Select>
      </SortDiv>

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
