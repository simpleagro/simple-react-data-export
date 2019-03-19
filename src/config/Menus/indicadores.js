import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/indicadores": {
    component: SimpleLoadable(() => import("../../components/Indicators")),
    key: "/indicadores",
    path: "/indicadores",
    label: "Indicadores",
    icon: "tachometer-alt",
    showMenu: true
  },
  "/indicadores/vendas": {
    component: SimpleLoadable(() => import("../../components/Indicators/Vendas")),
    key: "/indicadores/vendas",
    path: "/indicadores/vendas",
    label: "Indicadores",
    showMenu: false
  },
};

export default menus;
