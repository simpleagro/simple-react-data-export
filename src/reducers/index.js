import { combineReducers } from "redux";

import { painelReducer } from "./painelReducer";
import { plantioReducer } from "./plantioReducer";

export const Reducers = combineReducers({
  painelState: painelReducer,
  plantioState: plantioReducer,
});
