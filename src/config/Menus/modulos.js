import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/modulos": {
    component: SimpleLoadable(() => import("../../components/Modules")),
    path: "/modulos",
    label: "Módulos",
    icon: "bezier-curve",
    onlyAccess: ["SuperUser"],
    showMenu: true
  },
  "/modulos/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Modules/form")),
    path: "/modulos/:id/edit",
    showMenu: false
  },
  "/modulos/new": {
    component: SimpleLoadable(() => import("../../components/Modules/form")),
    path: "/modulos/new",
    showMenu: false
  },
};

export default menus;
