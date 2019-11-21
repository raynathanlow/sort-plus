import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';

import Home from './components/Home';
import Login from './components/Login';
import Callback from './components/Callback';
import Library from './components/Library';

function App() {
  return (
    <Router>
      <div>
        <Route exact path='/' component={Home} />
        <Route exact path='/login' component={Login} />
        <Route exact path='/callback' component={Callback} />
        <Route exact path='/library' component={Library} />
      </div>
    </Router>
  );
}

export default App;
