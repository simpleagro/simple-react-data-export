import React from 'react';
import { render } from 'react-dom';

import "./styles/utils.css";
import App from "./App";
import { Provider } from 'react-redux';
import Store from './store';

render(<Provider store={Store}><App /></Provider>, document.getElementById('root'));