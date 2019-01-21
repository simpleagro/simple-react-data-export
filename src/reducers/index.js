import { combineReducers } from "redux";

import { painelReducer } from "./painelReducer";
import { plantioReducer } from "./plantioReducer";
import { pedidoReducer } from "./pedidoReducer";

export const Reducers = combineReducers({
  painelState: painelReducer,
  plantioState: plantioReducer,
  pedidoState: pedidoReducer
});
