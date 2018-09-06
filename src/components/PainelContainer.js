import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter,
} from "react-router-dom";
import { withCookies, Cookies } from 'react-cookie';

import PrivateRoute from "./PrivateRoute";
import LoginForm from "./LoginForm";
import Painel from "./Painel";
import { isAuthenticated } from "../services/auth";


class PainelContainer extends Component {
  render() {
    return (
      <Router>
        <div>
          <Route path="/" render={() => (
            isAuthenticated() ? (
              <Painel />
            ) : (
                <LoginForm />
              )
          )} />
        </div>
      </Router>
    )
  }

};

export default PainelContainer;
