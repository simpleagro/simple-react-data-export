import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/pedidos": {
    component: SimpleLoadable(() => import("../../components/Sales/Orders/DadosBasicos/index")),
    path: "/pedidos",
    label: "Pedidos",
    icon: "handshake",
    showMenu: true,
    rule: 'Order'
  },
  "/pedidos/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Sales/Orders/DadosBasicos/form")),
    path: "/pedidos/:id/edit",
    showMenu: false
  },
  "/pedidos/new": {
    component: SimpleLoadable(() => import("../../components/Sales/Orders/DadosBasicos/form")),
    path: "/pedidos/new",
    showMenu: false
  },
  "/pedidos/:order_id/itens-do-pedido": {
    component: SimpleLoadable(() => import("../../components/Sales/Orders/ItensDoPedido")),
    path: "/pedidos/:order_id/itens-do-pedido",
    showMenu: false
  },
  "/pedidos/:order_id/itens-do-pedido/new": {
    component: SimpleLoadable(() => import("../../components/Sales/Orders/ItensDoPedido/form")),
    path: "/pedidos/:order_id/itens-do-pedido/new",
    showMenu: false
  },
  "/pedidos/:order_id/itens-do-pedido/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Sales/Orders/ItensDoPedido/form")),
    path: "/pedidos/:order_id/itens-do-pedido/:id/edit",
    showMenu: false
  },
  "/pedidos/:order_id/finalizar-pedido": {
    component: SimpleLoadable(() => import("../../components/Sales/Orders/Pagamento")),
    path: "/pedidos/:order_id/finalizar-pedido",
    showMenu: false
  },

  "/pedidos/espelho": {
    component: SimpleLoadable(() => import("../../components/Sales/Orders/Espelho")),
    path: "/pedidos/:order_id/espelho",
    showMenu: false
  },
};

export default menus;
