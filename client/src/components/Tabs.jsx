import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const TabsDiv = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 0.6;
`;

const Button = styled.button`
  padding: 1em;
  color: white;
  background-color: #282828;
  // outline: none;
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
