import React from "react";
import { BrowserRouter, Route, Switch, withRouter } from "react-router-dom";
import { CookiesProvider } from "react-cookie";

import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/LoginForm";
import Painel from "./components/Painel";
import Entidades from "./components/Entidades";
import Modulos from "./components/Modulos";

import { logout } from "./services/auth";

//desta forma consigo usar uma rota para fazer logout
//pois o withRouter e Route dependem de um objeto que neste
//caso sera null
const Logout = withRouter(({ history }) => {
  logout(() => history.push("/"));
  return null;
});

const EmptyStatePainel = () => (
  <div className="Aligner emptyState">
    <div className="center">
      <img
        alt="Seja bem vindo"
        width="120"
        src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0xMCw0OTJjLTUuNTEsMC0xMCw0LjQ5LTEwLDEwczQuNDksMTAsMTAsMTBzMTAtNC40OSwxMC0xMFMxNS41MSw0OTIsMTAsNDkyeiIgZmlsbD0iIzRiNGM0OSIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTUwMiw0OTJIMzM3LjE5OGwtNi4zOTItMzEuOTYxYy0wLjU5OC0yLjk5Mi0yLjQ5OC01LjE5MS01LjAzNS02LjU3MUwzMjQuMTMyLDM5MkgzNTZjMi42NTIsMCw1LjE5Ni0xLjMwNCw3LjA3MS0zLjE3OSAgICBsNDAtNDAuMTI1YzMuOTA1LTMuOTA1LDMuOTA1LTEwLjMsMC0xNC4yMDVsLTQwLTM5Ljc4MWMtMS44NzUtMS44NzUtNC40MTktMi43MS03LjA3MS0yLjcxaC0zNC41MjNsLTAuNTMxLTIwSDM1NiAgICBjNS41MjMsMCwxMC00Ljk3OCwxMC0xMC41di04MGMwLTUuNTIyLTQuNDc3LTkuNS0xMC05LjVoLTM3LjcwOWwtMC41MzEtMjBIMzk2YzIuNjUyLDAsNS4xOTYtMS4zMDQsNy4wNzEtMy4xNzlsNDAtNDAuMTI1ICAgIGMzLjkwNS0zLjkwNSwzLjkwNS0xMC4zLDAtMTQuMjA1bC00MC0zOS43ODFDNDAxLjE5Niw1Mi44MzUsMzk4LjY1Miw1MiwzOTYsNTJoLTgwLjg5NWwtMS4xMDktNDIuMDE2ICAgIEMzMTMuODUzLDQuNTY3LDMwOS40MTksMCwzMDQsMGgtNTZjLTUuNDE5LDAtOS44NTMsNC41NjctOS45OTcsOS45ODRMMjM2Ljg5NSw1MkgxMTZjLTUuNTIzLDAtMTAsMy45NzgtMTAsOS41djgwICAgIGMwLDUuNTIyLDQuNDc3LDEwLjUsMTAsMTAuNWgxMTguMjRsLTAuNTMxLDIwSDExNmMtMi42NTIsMC01LjE5NiwwLjgwNC03LjA3MSwyLjY3OWwtNDAsMzkuODc1ICAgIGMtMy45MDUsMy45MDUtMy45MDUsMTAuMTc1LDAsMTQuMDhsNDAsNDAuMjE5YzEuODc1LDEuODc1LDQuNDE5LDMuMTQ3LDcuMDcxLDMuMTQ3aDExNS4wNTRsLTAuNTMxLDIwSDE2OCAgICBjLTUuNTIzLDAtMTAsMy45NzgtMTAsOS41djgwYzAsNS41MjIsNC40NzcsMTAuNSwxMCwxMC41aDU5Ljg2OGwtMS42MzksNjEuNDY4Yy0yLjUzNywxLjM4LTQuNDM3LDMuNzA1LTUuMDM1LDYuNjk2TDIxNC44MDIsNDkyICAgIEg1MGMtNS41MSwwLTEwLDQuNDktMTAsMTBzNC40OSwxMCwxMCwxMGg0NTJjNS41MSwwLDEwLTQuNDksMTAtMTBTNTA3LjUxLDQ5Miw1MDIsNDkyeiBNMjU3LjczOCwyMGgzNi41MjNsMC44MzYsMzJoLTM4LjE5NiAgICBMMjU3LjczOCwyMHogTTEyNiwxMzJWNzJoMjY1Ljg1OGwzMCwzMGwtMzAsMzBIMTI2eiBNMjk4LjI4NCwxNzJoLTQ0LjU2OGwwLjUzMS0yMGg0My41MDZMMjk4LjI4NCwxNzJ6IE0xMjAuMTQyLDI1MmwtMzAtMzAgICAgbDMwLTMwSDM0NnY2MEgxMjAuMTQyeiBNMzAxLjQ2OSwyOTJIMjUwLjUzbDAuNTMxLTIwaDQ5Ljg3N0wzMDEuNDY5LDI5MnogTTE3OCwzNzJ2LTYwaDE3My44NThsMzAsMzBsLTMwLDMwSDE3OHogTTMwNS43MzEsNDUyICAgIGgtNTkuNDYybDEuNjA2LTYwaDU2LjI1TDMwNS43MzEsNDUyeiBNMjM1LjE5OCw0OTJsNC0yMGg3My42MDRsNCwyMEgyMzUuMTk4eiIgZmlsbD0iIzRiNGM0OSIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTE3Miw5MWgtMTZjLTUuNTIzLDAtMTAsNC40NzgtMTAsMTBjMCw1LjUyMiw0LjQ3NywxMCwxMCwxMGgxNmM1LjUyMywwLDEwLTQuNDc4LDEwLTEwQzE4Miw5NS40NzgsMTc3LjUyMyw5MSwxNzIsOTF6IiBmaWxsPSIjNGI0YzQ5Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNMzcyLDkxaC04MGMtNS41MjMsMC0xMCw0LjQ3OC0xMCwxMGMwLDUuNTIyLDQuNDc3LDEwLDEwLDEwaDgwYzUuNTIzLDAsMTAtNC40NzgsMTAtMTBDMzgyLDk1LjQ3OCwzNzcuNTIzLDkxLDM3Miw5MXoiIGZpbGw9IiM0YjRjNDkiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yNTIsOTFoLTQwYy01LjUyMywwLTEwLDQuNDc4LTEwLDEwYzAsNS41MjIsNC40NzcsMTAsMTAsMTBoNDBjNS41MjMsMCwxMC00LjQ3OCwxMC0xMEMyNjIsOTUuNDc4LDI1Ny41MjMsOTEsMjUyLDkxeiIgZmlsbD0iIzRiNGM0OSIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTMxNiwyMTJoLTUwYy01LjUyMywwLTEwLDQuNDc4LTEwLDEwYzAsNS41MjIsNC40NzcsMTAsMTAsMTBoNTBjNS41MjMsMCwxMC00LjQ3OCwxMC0xMEMzMjYsMjE2LjQ3OCwzMjEuNTIzLDIxMiwzMTYsMjEyICAgIHoiIGZpbGw9IiM0YjRjNDkiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yMjYsMjEyYy01LjUyLDAtMTAsNC40NzktMTAsMTBjMCw1LjUyLDQuNDgsMTAsMTAsMTBzMTAtNC40OCwxMC0xMEMyMzYsMjE2LjQ3OSwyMzEuNTIsMjEyLDIyNiwyMTJ6IiBmaWxsPSIjNGI0YzQ5Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNMTg2LDIxMmgtNTBjLTUuNTIzLDAtMTAsNC40NzgtMTAsMTBjMCw1LjUyMiw0LjQ3NywxMCwxMCwxMGg1MGM1LjUyMywwLDEwLTQuNDc4LDEwLTEwQzE5NiwyMTYuNDc4LDE5MS41MjMsMjEyLDE4NiwyMTIgICAgeiIgZmlsbD0iIzRiNGM0OSIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTIwOCwzMzJjLTUuNTEsMC0xMCw0LjQ5LTEwLDEwczQuNDksMTAsMTAsMTBzMTAtNC40OSwxMC0xMFMyMTMuNTEsMzMyLDIwOCwzMzJ6IiBmaWxsPSIjNGI0YzQ5Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNMzI4LDMzMmgtODBjLTUuNTEsMC0xMCw0LjQ5LTEwLDEwczQuNDksMTAsMTAsMTBoODBjNS41MSwwLDEwLTQuNDksMTAtMTBTMzMzLjUxLDMzMiwzMjgsMzMyeiIgZmlsbD0iIzRiNGM0OSIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo="
      />
      <br />
      <br />
      <p>Seja bem vindo! Continue explorando!</p>
    </div>
  </div>
);

const Routes = () => (
  <CookiesProvider>
    <BrowserRouter>
      <div>
        <Route exact path="/login" component={Login} />
        <Route exact path="/logout" component={Logout} />
        {/* <Painel>
          <Switch>
            <PrivateRoute exact path="/" component={EmptyStatePainel} />
            <PrivateRoute exact path="/entidades" component={Entidades} />
            <PrivateRoute exact path="/modulos" component={Modulos} />
          </Switch>
        </Painel> */}
        {/* <Route component={ () => (<div>404</div>)} /> */}
      </div>
    </BrowserRouter>
  </CookiesProvider>
);

export default Routes;
