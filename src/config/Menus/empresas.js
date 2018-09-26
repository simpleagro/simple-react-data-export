import Loadable from "react-loadable";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  "/empresas": {
    component: loadable(() => false),
    key: "/empresas",
    path: "/empresas",
    label: "Empresa",
    icon: "building",
    onlyAccess: ["SuperUser"],
    showMenu: true
  }
};

export default menus;
