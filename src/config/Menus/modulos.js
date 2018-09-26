import Loadable from "react-loadable";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  "/modulos": {
    component: loadable(() => import("../../components/Modules")),
    path: "/modulos",
    label: "Módulos",
    icon: "bezier-curve",
    onlyAccess: ["SuperUser"],
    showMenu: true
  }
};

export default menus;
