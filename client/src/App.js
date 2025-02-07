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
    // registration.waiting refers to the new service worker
    // It is saved in the state so we can use it to skip waiting in update function
  };

  const update = () => {
    // Tell new service worker to skip waiting and become active
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
    setWaiting(false);
  };

  // Use the onUpdate callback provided in the register function of the service worker
  // to trigger the update notification.
  useEffect(() => {
    serviceWorker.register({ onUpdate: onSWUpdate });
  });

  if (waiting) {
    return (
      <Router>
        <div>
          <Update update={update} />

          {/* <Switch> Renders the first child <Route> or <Redirect> that matches the location */}
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
        {/* <Switch> Renders the first child <Route> or <Redirect> that matches the location */}
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

/**
 * Finds out if there is a session or not through cookie loggedIn
 * @return {bool}
 */
function isAuthenticated() {
  if (getCookie("loggedIn") === "true") {
    return true;
  }
  return false;
}

// Adapted from https://reacttraining.com/react-router/web/example/auth-workflow
/**
 * A wrapper for <Route> that redirects to the login screen if you're not yet authenticated.
 * @param  {object}
 * @return Route component
 */
function PrivateRoute({ children, ...rest }) {
  // children: children elements. In this case, <Main /> is the children element.
  // rest: Rest of the other routeProps. In this case, path.
  // render: It allows for convenient inline rendering and wrapping without the
  // undesired remounting when using component render prop. It has access to all the
  // same route props (match, location, and history) as the component render prop.
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
