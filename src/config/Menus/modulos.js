import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/modulos": {
    component: SimpleLoadable(() => import("../../components/Modules")),
    path: "/modulos",
    label: "Módulos",
    icon: "bezier-curve",
    onlyAccess: ["SuperUser"],
    showMenu: true
  }
};

export default menus;
