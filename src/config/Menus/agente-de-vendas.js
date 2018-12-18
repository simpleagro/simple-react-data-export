import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/agente-de-vendas": {
    component: SimpleLoadable(() => import("../../components/Sales/SalesAgents")),
    key: "/agente-de-vendas",
    path: "/agente-de-vendas",
    label: "Agente de Vendas",
    icon: "database",
    showMenu: true,
    rule: 'SaleAgent',
  },
  "/agente-de-vendas/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Sales/SalesAgents/form")),
    path: "/agente-de-vendas/:id/edit",
    showMenu: false
  },
  "/agente-de-vendas/new": {
    component: SimpleLoadable(() => import("../../components/Sales/SalesAgents/form")),
    path: "/agente-de-vendas/new",
    showMenu: false
  },
};

export default menus;
