import Loadable from "react-loadable";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  "/grupos-produtos": {
    component: loadable(() => false),
    key: "/grupos-produtos",
    path: "/grupos-produtos",
    label: "Grupos de Produtos",
    icon: "object-group",
    showMenu: true
  }
};

export default menus;
