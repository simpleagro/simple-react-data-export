import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/caracteristicas-produtos": {
    component: SimpleLoadable(() => false),
    key: "/caracteristicas-produtos",
    path: "/caracteristicas-produtos",
    label: "Caract. Produtos",
    icon: "list-alt",
    showMenu: true
  }
};

export default menus;
