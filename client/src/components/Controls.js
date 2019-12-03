import React from 'react';

function Controls(props) {
  return (
    <div>
      
      <select
        name="sort"
        id="sort-mode-select"
        value={props.selected}
        onChange={props.onChangeSort} >
        <option value="duration_ms">Duration</option>
        <option value="releaseYear">Release Year</option>
      </select>

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
