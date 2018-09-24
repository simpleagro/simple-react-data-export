import React from 'react';
// import { Provider } from "react-redux";
// import { Store } from "./store";
import Routes from "./Routes";
import "./components/common/FAIcons";
import { LocaleProvider } from 'antd';
import pt_BR from 'antd/lib/locale-provider/pt_BR';


const App = () => <LocaleProvider locale={pt_BR}><Routes /></LocaleProvider>;

export default App;
