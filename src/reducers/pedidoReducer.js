const initialState = {
  pedidoData: {}
};

export const pedidoReducer = (state = initialState, action) => {
  switch (action.type) {
    case "DADOS_PEDIDO":
      console.log("DADOS_PEDIDO", action);
      return { ...state, pedidoData: action.payload.pedidoData };
    default:
      return state;
  }
};
