import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/clientes/:client_id/plantio": {
    component: SimpleLoadable(() => import("../../components/Clients/Plantings")),
    showMenu: false,
    rule: 'Planting'
  },
  "/clientes/:client_id/plantio/:id/edit": {
    component: SimpleLoadable(() =>
      import("../../components/Clients/Plantings/form")
    ),
    showMenu: false
  },
  "/clientes/:client_id/plantio/new": {
    component: SimpleLoadable(() =>
      import("../../components/Clients/Plantings/form")
    ),
    showMenu: false
  }
};

export default menus;
