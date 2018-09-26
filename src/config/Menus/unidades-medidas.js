import Loadable from "react-loadable";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  "/unidades-medidas": {
    component: loadable(() => false),
    key: "/unidades-medidas",
    path: "/unidades-medidas",
    label: "Unidades de Medidas",
    icon: "exchange-alt",
    showMenu: true
  }
};

export default menus;
