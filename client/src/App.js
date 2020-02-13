import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from "react-router-dom";
import "./App.css";
import * as serviceWorker from "./serviceWorker";

import { getCookie } from "./Utils";

import Home from "./components/Home";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Callback from "./components/Callback";
import Main from "./components/Main";
import Update from "./components/Update";

function App() {
  // Adapted from https://felixgerschau.com/2020/01/27/cra-pwa-update-notification.html
  // State used to show Update notification
  const [waiting, setWaiting] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  const onSWUpdate = registration => {
    setWaiting(true);
    setWaitingWorker(registration.waiting);
  };

  const update = () => {
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
    setWaiting(false);
  };

  useEffect(() => {
    serviceWorker.register({ onUpdate: onSWUpdate });
  });

  if (waiting) {
    return (
      <Router>
        <div>
          <Update update={update} />
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/login">
              <Login />
            </Route>
            <Route path="/logout">
              <Logout />
            </Route>
            <Route path="/callback">
              <Callback />
            </Route>

            <PrivateRoute path="/library">
              <Main />
            </PrivateRoute>
          </Switch>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/logout">
            <Logout />
          </Route>
          <Route path="/callback">
            <Callback />
          </Route>
          <PrivateRoute path="/library">
            <Main />
          </PrivateRoute>
        </Switch>
      </div>
    </Router>
  );
}

// Function that finds out if there is a session or not through API
function isAuthenticated() {
  if (getCookie("loggedIn") === "true") {
    return true;
  }
  return false;
}

// Adapted from https://reacttraining.com/react-router/web/example/auth-workflow
// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function PrivateRoute({ children, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        isAuthenticated() ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}

export default App;
