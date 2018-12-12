import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { CookiesProvider } from "react-cookie";

import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/LoginForm";
import PageNotFound from "./components/errors/PageNotFound";
import { logout } from "./services/auth";

import { menus } from "./config/menus";

import { EmptyStatePainel } from "./components/EmptyStatePainel";
import ModuleSwitch from "./components/ModuleSwitch";

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
          <Route exact path="/selecionar-modulo" component={ModuleSwitch} />
          <PrivateRoute exact path="/" component={EmptyStatePainel} />

          {Object.keys(menus).map(modulo => {
            {
              return Object.keys(menus[modulo]).map(path => {
                const { exact, ...props } = menus[modulo][path];
                props.exact = exact === void 0 || exact || false; // set true as default
                return <PrivateRoute key={path} path={path} {...props} />;
              });
            }
          })}

          <Route component={PageNotFound} />
        </Switch>
      </div>
    </BrowserRouter>
  </CookiesProvider>
);

export default Routes;
