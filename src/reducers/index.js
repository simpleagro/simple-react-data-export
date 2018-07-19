import { combineReducers } from "redux";

import { painelReducer } from "./painelReducer";

export const Reducers = combineReducers({
  painelState: painelReducer,
});