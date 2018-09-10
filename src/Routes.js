import React from "react";
import { BrowserRouter, Route, Switch, withRouter } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import Loadable from "react-loadable";

import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/LoginForm";
import PageNotFound from "./components/errors/PageNotFound";
import Entities from "./components/Entities";
import Modules from "./components/Modules";
import Clients from "./components/Clients";

import { logout } from "./services/auth";
import emptyStateImage from "../src/assets/keep-explore.svg";
import { menus } from "./config/menus";

//desta forma consigo usar uma rota para fazer logout
//pois o withRouter e Route dependem de um objeto que neste
//caso sera null
const Logout = withRouter(({ history }) => {
  logout(() => history.push("/login"));
  return null;
});

const EmptyStatePainel = () => (
  <div className="Aligner emptyState">
    <div className="center">
      <img alt="Seja bem vindo" width="120" src={emptyStateImage} />
      <br />
      <br />
      <p>Seja bem vindo! Continue explorando!</p>
    </div>
  </div>
);

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
          <Route exact path="/logout" component={Logout} />
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
