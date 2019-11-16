import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';

import Home from './components/Home';
import Login from './components/Login';
import Callback from './components/Callback';

function App() {
  return (
    <Router>
      <div>
        <Route exact path='/' component={Home} />
        <Route exact path='/login' component={Login} />
        <Route exact path='/callback' component={Callback} />
      </div>
    </Router>
  );
}

export default App;
