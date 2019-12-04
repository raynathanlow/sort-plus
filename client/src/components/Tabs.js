import React from 'react';
import styled from 'styled-components';

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
  background-color: #1DB954;
`;

function Tabs(props) {
  return (
    <TabsDiv>
      {props.tabs.map((tab) => {
        if (tab.value === props.selected) {
          return <SelectedButton value={tab.value} onClick={props.onClick}>
            {tab.text}
          </SelectedButton>;
        } else {
          return <Button value={tab.value} onClick={props.onClick}>
            {tab.text}
          </Button>;
        }
      })}
    </TabsDiv>
  );
}

export default Tabs;
