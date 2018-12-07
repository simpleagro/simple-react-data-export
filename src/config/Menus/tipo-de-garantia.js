import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/tipo-de-garantia": {
    component: SimpleLoadable(() => import("../../components/Sales/TypesOfWarranty")),
    key: "/tipo-de-garantia",
    path: "/tipo-de-garantia",
    label: "Tipo de Garantia",
    icon: "database",
    showMenu: true
  },
  "/tipo-de-garantia/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Sales/TypesOfWarranty/form")),
    path: "/tipo-de-garantia/:id/edit",
    showMenu: false
  },
  "/tipo-de-garantia/new": {
    component: SimpleLoadable(() => import("../../components/Sales/TypesOfWarranty/form")),
    path: "/tipo-de-garantia/new",
    showMenu: false
  },
};

export default menus;
