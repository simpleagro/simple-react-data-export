const initialState = {
  pedidoData: {
    pagamento: {
      parcelas: []
    },
    itens: [],
  }
};

export const pedidoReducer = (state = initialState, action) => {
  switch (action.type) {
    case "DADOS_PEDIDO":
      console.log("DADOS_PEDIDO", action);
      return { ...state, pedidoData: action.payload.pedidoData };
    case "DADOS_PEDIDO_FRETE":
      console.log("DADOS_PEDIDO_FRETE", action);
      return setDadosPedidoFrete(state, action);
    case "DADOS_PEDIDO_PARCELAS_AUTOMATICAS":
      console.log("DADOS_PEDIDO_PARCELAS_AUTOMATICAS", action);
      return setDadosPedidoParcelasAutomaticas(state, action);
    default:
      return state;
  }
};

function setDadosPedidoFrete(state, action) {
  return {
    ...state,
    pedidoData: {
      ...state.pedidoData,
      pagamento: { ...state.pedidoData.pagamento, ...action.payload.freteData }
    }
  };
}

function setDadosPedidoParcelasAutomaticas(state, action) {
  return {
    ...state,
    pedidoData: {
      ...state.pedidoData,
      pagamento: {
        ...state.pedidoData.pagamento,
        parcelas: action.payload.parcelasData
      }
    }
  };
}
