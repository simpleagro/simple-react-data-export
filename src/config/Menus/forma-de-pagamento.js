import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/forma-de-pagamento": {
    component: SimpleLoadable(() => import("../../components/Sales/FormOfPayment")),
    key: "/forma-de-pagamento",
    path: "/forma-de-pagamento",
    label: "Forma de Pagamento",
    icon: "database",
    showMenu: true
  },
  "/forma-de-pagamento/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Sales/FormOfPayment/form")),
    path: "/forma-de-pagamento/:id/edit",
    showMenu: false
  },
  "/forma-de-pagamento/new": {
    component: SimpleLoadable(() => import("../../components/Sales/FormOfPayment/form")),
    path: "/forma-de-pagamento/new",
    showMenu: false
  },
};

export default menus;
