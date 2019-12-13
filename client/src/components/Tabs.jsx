import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const TabsDiv = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  @media (min-width: 400px) {
    flex-direction: row;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1em;
  color: white;
  background-color: #111114;
  outline: none;
  border: none;
  cursor: pointer;
  cursor: hand;
`;

const SelectedButton = styled(Button)`
  background-color: #1db954;
`;

function Tabs(props) {
  const { tabs, selected, onClick } = props;
  return (
    <TabsDiv>
      {tabs.map(tab => {
        if (tab.value === selected) {
          return (
            <SelectedButton key={tab.value} value={tab.value} onClick={onClick}>
              {tab.text}
            </SelectedButton>
          );
        }
        return (
          <Button key={tab.value} value={tab.value} onClick={onClick}>
            {tab.text}
          </Button>
        );
      })}
    </TabsDiv>
  );
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape).isRequired,
  selected: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
};

export default Tabs;
