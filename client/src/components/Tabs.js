import React, { Component } from 'react';

function Tabs(props) {
  return (
    <div>
      {props.tabs.map((tab) => {
        if (tab.value === props.selected) {
          return <button value={tab.value} className="activeTab" onClick={props.onClick}>
            {tab.text}
          </button>;
        } else {
          return <button value={tab.value} onClick={props.onClick}>
            {tab.text}
          </button>;
        }
      })}
    </div >
  );
}

export default Tabs;
