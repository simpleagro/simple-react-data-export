import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/aprovacao": {
    component: SimpleLoadable(() => import("../../components/Sales/Approval/DadosBasicos/index")),
    path: "/aprovacao",
    label: "Aprovação Pedidos",
    icon: "check-square",
    showMenu: true,
    rule: 'Approval'
  }/* ,
  "/aprovacao/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Sales/Orders/DadosBasicos/form")),
    path: "/pedidos/:id/edit",
    showMenu: false
  } */
};

export default menus;
