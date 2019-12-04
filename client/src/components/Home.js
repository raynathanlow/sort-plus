import React, { Component } from 'react';

import Button from './Button';

class Home extends Component {
  render() {
    return (
      <Button url={window.location.href + "login"} text="Login"/>
    );
  }
}

export default Home;
