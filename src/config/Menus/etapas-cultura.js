import Loadable from "react-loadable";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  "/etapas-cultura": {
    component: loadable(() => false),
    key: "/etapas-cultura",
    path: "/etapas-cultura",
    label: "Etapas de Cultura",
    icon: "leaf",
    showMenu: true
  }
};

export default menus;
