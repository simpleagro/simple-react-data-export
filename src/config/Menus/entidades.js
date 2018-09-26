import Loadable from "react-loadable";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  "/entidades": {
    component: loadable(() => import("../../components/Entities")),
    key: "/entidades",
    path: "/entidades",
    label: "Entidades",
    icon: "file",
    onlyAccess: ["SuperUser"],
    showMenu: true
  }
};

export default menus;
