import React from "react";
import { BrowserRouter, Route, Switch, withRouter } from "react-router-dom";
import { CookiesProvider } from "react-cookie";

import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/LoginForm";
import PageNotFound from "./components/PageNotFound";
import Entidades from "./components/Entidades";
import Modulos from "./components/Modulos";

import { logout } from "./services/auth";

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
      <img alt="Seja bem vindo" width="120" src="../assets/keep-explore.svg" />
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
          <PrivateRoute exact path="/entidades" component={Entidades} />
          <PrivateRoute exact path="/modulos" component={Modulos} />
          <Route component={PageNotFound} />
        </Switch>
      </div>
    </BrowserRouter>
  </CookiesProvider>
);

export default Routes;
