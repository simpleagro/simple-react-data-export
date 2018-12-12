import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/tipo-de-vendedores": {
    component: SimpleLoadable(() => import("../../components/Sales/SalesmanTypes")),
    key: "/tipo-de-vendedores",
    path: "/tipo-de-vendedores",
    label: "Tipo de Vendedores",
    icon: "database",
    showMenu: true
  },
  "/tipo-de-vendedores/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Sales/SalesmanTypes/form")),
    path: "/tipo-de-vendedores/:id/edit",
    showMenu: false
  },
  "/tipo-de-vendedores/new": {
    component: SimpleLoadable(() => import("../../components/Sales/SalesmanTypes/form")),
    path: "/tipo-de-vendedores/new",
    showMenu: false
  },
};

export default menus;
