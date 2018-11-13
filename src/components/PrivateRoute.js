import { Route, Redirect, withRouter } from "react-router-dom";
import React, { Component } from "react";
import { connect } from "react-redux";
import { isAuthenticated } from "../services/auth";
import Painel from "./Painel";
import { NoAccessPainel } from "../components/NoAccessPainel";

class PrivateRoute extends Component {
  render() {
    const {
      component: Component,
      redirectTo,
      userType,
      onlyAccess,
      ...rest
    } = this.props;

    return (
      <Route
        {...rest}
        render={props => {
          switch (isAuthenticated()) {
            case true:
              if (onlyAccess) {
                if (onlyAccess.includes(userType))
                  return (
                    <Painel>
                      <Component {...props} />
                    </Painel>
                  );
                else
                  return (
                    <Painel>
                      <NoAccessPainel />
                    </Painel>
                  );
              } else
                return (
                  <Painel>
                    <Component {...props} />
                  </Painel>
                );
            default:
              return (
                <Redirect
                  to={{
                    pathname: redirectTo || "/login",
                    state: { from: props.location }
                  }}
                />
              );
          }
        }}
      />
    );
  }
}

// export default PrivateRoute;

const mapStateToProps = ({ painelState }) => {
  return {
    userType:
      (painelState &&
        painelState.userData &&
        painelState.userData.user &&
        painelState.userData.user.usertype) ||
      ""
  };
};

export default withRouter(connect(mapStateToProps)(PrivateRoute));
