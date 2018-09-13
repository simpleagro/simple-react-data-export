import { Route, Redirect } from "react-router-dom";
import React, { Component } from "react";

import { isAuthenticated } from "../services/auth";
import Painel from "./Painel";

class PrivateRoute extends Component {
  render() {
    const { component: Component, redirectTo, ...rest } = this.props;

    return (
      <Route
        {...rest}
        render={props =>
          isAuthenticated() ? (
            <Painel>
              <Component {...props} />
            </Painel>
          ) : (
            <Redirect
              to={{
                pathname: redirectTo || "login",
                state: { from: props.location }
              }}
            />
          )
        }
      />
    );
  }
}

export default PrivateRoute;
