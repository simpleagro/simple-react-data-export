const initialState = {
  userData: {
    user: {
      usertype: '',
      nome: ''
    }
  }
};

export const painelReducer = (state = initialState, action) => {
  switch (action.type) {
    case "USER_LOGGED_IN":
      return { ...state, userData: action.payload.userData };
    default:
      return state;
  }
};
