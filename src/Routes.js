import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { CookiesProvider } from "react-cookie";

import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/LoginForm";
import PageNotFound from "./components/errors/PageNotFound";
import { logout } from "./services/auth";

import { menus } from "./config/menus";

import { EmptyStatePainel } from "./components/EmptyStatePainel";

// this is the default behavior
const getConfirmation = (message, callback) => {
  const allowTransition = window.confirm(message);
  callback(allowTransition);
};

const Routes = () => (
  <CookiesProvider>
    <BrowserRouter getUserConfirmation={getConfirmation}>
      <div>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route
            exact
            path="/logout"
            render={() => {
              logout();
              return null;
            }}
          />
          <PrivateRoute exact path="/" component={EmptyStatePainel} />

          {Object.keys(menus).map(path => {
            const { exact, ...props } = menus[path];
            props.exact = exact === void 0 || exact || false; // set true as default
            return <PrivateRoute key={path} path={path} {...props} />;
          })}

          <Route component={PageNotFound} />
        </Switch>
      </div>
    </BrowserRouter>
  </CookiesProvider>
);

export default Routes;
