import { Route, Redirect } from "react-router-dom";
import React, { Component } from 'react';
import { withCookies, Cookies } from 'react-cookie';
import { instanceOf } from 'prop-types';


class PrivateRoute extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false
    };
  }

  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  render() {

    const { component: Component, redirectTo, ...rest } = this.props;
    const token = this.props.cookies.get("token");
    const isAuthenticated = token && token !== "" ? true : false;

    return (
      <Route
        {...rest}
        render={props =>
          isAuthenticated ? (
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


export default withCookies(PrivateRoute);