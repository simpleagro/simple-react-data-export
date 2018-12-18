import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/tipo-de-pagamento": {
    component: SimpleLoadable(() => import("../../components/Sales/TypeOfPayment")),
    key: "/tipo-de-pagamento",
    path: "/tipo-de-pagamento",
    label: "Tipo de Pagamento",
    icon: "database",
    showMenu: true,
    rule: 'TypeOfPayment'
  },
  "/tipo-de-pagamento/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Sales/TypeOfPayment/form")),
    path: "/tipo-de-pagamento/:id/edit",
    showMenu: false
  },
  "/tipo-de-pagamento/new": {
    component: SimpleLoadable(() => import("../../components/Sales/TypeOfPayment/form")),
    path: "/tipo-de-pagamento/new",
    showMenu: false
  },
};

export default menus;
