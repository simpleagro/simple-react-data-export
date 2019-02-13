const initialState = {
  pedidoData: {}
};

export const pedidoReducer = (state = initialState, action) => {
  switch (action.type) {
    case "DADOS_PEDIDO":
      console.log("DADOS_PEDIDO", action);
      return { ...state, pedidoData: action.payload.pedidoData };
    case "DADOS_PEDIDO_FRETE":
      console.log("DADOS_PEDIDO_FRETE", action);
      return { ...state, pedidoData: action.payload.pedidoData };
    default:
      return state;
  }
};
