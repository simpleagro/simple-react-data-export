import Loadable from "react-loadable";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  "/carteiras-de-clientes": {
    component: loadable(() => import("../../components/CustomersWallet")),
    key: "/carteiras-de-clientes",
    path: "/carteiras-de-clientes",
    label: "Carteiras de Clientes",
    icon: "wallet",
    showMenu: true
  },
  "/carteiras-de-clientes/:id/edit": {
    component: loadable(() => import("../../components/CustomersWallet/form")),
    path: "/carteiras-de-clientes/:id/edit",
    showMenu: false
  },
  "/carteiras-de-clientes/new": {
    component: loadable(() => import("../../components/CustomersWallet/form")),
    path: "/carteiras-de-clientes/new",
    showMenu: false
  }
};

export default menus;
