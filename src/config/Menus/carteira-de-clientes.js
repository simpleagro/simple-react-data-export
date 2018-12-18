import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/carteiras-de-clientes": {
    component: SimpleLoadable(() => import("../../components/CustomersWallet")),
    key: "/carteiras-de-clientes",
    path: "/carteiras-de-clientes",
    label: "Carteiras de Clientes",
    icon: "wallet",
    showMenu: true,
    rule: 'CustomerWallet',
  },
  "/carteiras-de-clientes/:id/edit": {
    component: SimpleLoadable(() => import("../../components/CustomersWallet/form")),
    path: "/carteiras-de-clientes/:id/edit",
    showMenu: false
  },
  "/carteiras-de-clientes/new": {
    component: SimpleLoadable(() => import("../../components/CustomersWallet/form")),
    path: "/carteiras-de-clientes/new",
    showMenu: false
  }
};

export default menus;
