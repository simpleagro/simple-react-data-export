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
};

export default menus;
