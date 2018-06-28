import React from "react";
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";
import { CookiesProvider } from "react-cookie";

import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/LoginForm";

const Main = () => (
  <div>
    <h1>HELLO WORLD</h1>
    <Link to="/1">Acesso restrito</Link>
  </div>
);

const Protec = () => (<h1>Protec</h1>);

const Routes = () => (
  <CookiesProvider>
    <BrowserRouter>
      <Switch>
        <Route exact path="/login" component={Login} />
        <PrivateRoute exact path="/" component={Main} />
        <PrivateRoute exact path="/1" component={Protec} />
      </Switch>
    </BrowserRouter>
  </CookiesProvider>
);

export default Routes;