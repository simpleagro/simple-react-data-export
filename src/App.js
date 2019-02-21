import React from "react";
// import { Provider } from "react-redux";
// import { Store } from "./store";
import Routes from "./Routes";
import {
  getNumber,
  currency
} from "./components/common/utils";
import "./components/common/FAIcons";
import { LocaleProvider } from "antd";
import pt_BR from "antd/lib/locale-provider/pt_BR";
import "moment/locale/pt-br";

window.simpleagroapp = {
  getNumber,
  currency
};

const App = () => (
  <LocaleProvider locale={pt_BR}>
    <Routes />
  </LocaleProvider>
);

export default App;
