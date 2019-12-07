import React from 'react';

import Button from './Button';

function Home() {
  return <Button url={`${window.location.href}login`} text="Login" />;
}

export default Home;
