import Loadable from "react-loadable";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  "/clientes/:client_id/plantio": {
    component: loadable(() => import("../../components/Clients/Plantings")),
    showMenu: false
  },
  "/clientes/:client_id/plantio/:id/edit": {
    component: loadable(() => import("../../components/Clients/Plantings/form")),
    showMenu: false
  },
  "/clientes/:client_id/plantio/new/edit": {
    component: loadable(() => import("../../components/Clients/Plantings/form")),
    showMenu: false
  }
};

export default menus;
