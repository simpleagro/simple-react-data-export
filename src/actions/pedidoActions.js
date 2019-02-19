export const dadosPedido = pedidoData => ({
  type: "DADOS_PEDIDO",
  payload: {
    pedidoData
  }
});

export const dadosPedidoFrete = freteData => ({
  type: "DADOS_PEDIDO_FRETE",
  payload: {
    freteData
  }
});

export const dadosPedidoParcelaAutomatica = parcelasData => ({
  type: "DADOS_PEDIDO_PARCELAS_AUTOMATICAS",
  payload: {
    parcelasData
  }
});
