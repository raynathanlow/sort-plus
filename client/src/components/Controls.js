import React, { Component } from 'react';

class Controls extends Component {
  render() {
    return (
      <select name="sort" id="sort-mode-select" onChange={this.props.onChange} >
        <option value="duration_ms">Duration</option>
        <option value="releaseYear">Release Year</option>
      </select>
    );
  }
}

export default Controls;
