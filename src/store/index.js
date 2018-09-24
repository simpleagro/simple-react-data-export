import { createStore } from "redux";

import { Reducers } from "../reducers";
import { loadState, saveState } from "./localStorage";

const persistedState = loadState();

const Store = createStore(
  Reducers,
  persistedState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

Store.subscribe(() => {
  // ver a lib redux-persist
  console.log("subscribe");
  saveState({ painelState: Store.getState().painelState });
});

export default Store;
