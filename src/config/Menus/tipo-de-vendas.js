import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/tipo-de-vendas": {
    component: SimpleLoadable(() => import("../../components/Sales/TypesOfSales")),
    key: "/tipo-de-vendas",
    path: "/tipo-de-vendas",
    label: "Tipo de Vendas",
    icon: "database",
    showMenu: true
  },
  "/tipo-de-venda/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Sales/TypesOfSales/form")),
    path: "/tipo-de-vendas/:id/edit",
    showMenu: false
  },
  "/tipo-de-vendas/new": {
    component: SimpleLoadable(() => import("../../components/Sales/TypesOfSales/form")),
    path: "/tipo-de-vendas/new",
    showMenu: false
  },
};

export default menus;
