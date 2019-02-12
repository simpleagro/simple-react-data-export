import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/fornecedores": {
    component: SimpleLoadable(() => import("../../components/Sales/Providers")),
    key: "/fornecedores",
    path: "/fornecedores",
    label: "Fornecedores",
    icon: "address-card",
    showMenu: true,
    rule: 'Providers'
  },
  "/fornecedores/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Sales/Providers/form")),
    path: "/fornecedores/:id/edit",
    showMenu: false
  },
  "/fornecedores/new": {
    component: SimpleLoadable(() => import("../../components/Sales/Providers/form")),
    path: "/fornecedores/new",
    showMenu: false
  },
};

export default menus;
