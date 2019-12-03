import React from 'react';

import Tabs from './Tabs';

function Controls(props) {
  return (
    <div>
      <Tabs
        tabs={[{ value: "duration_ms", text: "Duration" },
        { value: "releaseYear", text: "Release Year" }]}
        onClick={props.onChangeSort}
        selected={props.selected} />

      <select
        name="options"
        id="options-select"
        // value={props.selected}
        onChange={props.onChangeOption} >
        {props.options.map((option) => {
          return <option key={option} value={option}>{option}</option>;
        })}
      </select>
    </div>
  );
}

export default Controls;
