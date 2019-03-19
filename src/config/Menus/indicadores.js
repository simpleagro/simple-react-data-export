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
};

export default menus;
