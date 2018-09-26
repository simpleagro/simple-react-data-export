import Loadable from "react-loadable";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  "/caracteristicas-produtos": {
    component: loadable(() => false),
    key: "/caracteristicas-produtos",
    path: "/caracteristicas-produtos",
    label: "Caract. Produtos",
    icon: "list-alt",
    showMenu: true
  }
};

export default menus;
