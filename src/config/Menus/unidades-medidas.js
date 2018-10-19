import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/unidades-medidas": {
    component: SimpleLoadable(() => false),
    key: "/unidades-medidas",
    path: "/unidades-medidas",
    label: "Unidades de Medidas",
    icon: "exchange-alt",
    showMenu: true
  }
};

export default menus;
