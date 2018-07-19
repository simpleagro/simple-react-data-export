import { Route, Redirect } from "react-router-dom";
import React, { Component } from 'react';

import { isAuthenticated } from "../services/auth";

class PrivateRoute extends Component {

  render() {

    const { component: Component, redirectTo, ...rest } = this.props;

    return (
      <Route
        {...rest}
        render={props =>
          isAuthenticated() ? (
            <Component {...props} />
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

};

export default PrivateRoute;
