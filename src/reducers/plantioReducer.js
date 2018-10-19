const initialState = {
  plantioData: {}
};

export const plantioReducer = (state = initialState, action) => {
  switch (action.type) {
    case "NOVO_PLANTIO":
      console.log("NOVO plantio", action);
      return { ...state, plantioData: action.payload.plantioData };
    default:
      return state;
  }
};
