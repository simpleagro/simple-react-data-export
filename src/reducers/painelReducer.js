const initialState = {
username: ""
};

export const painelReducer = (state = initialState, action) => {
  switch (action.type) {
    case "USER_LOGGED_IN":
    console.log(action.payload);
      return { ...state, userData: action.payload.userData }
    default:
      return state;
  }
};
