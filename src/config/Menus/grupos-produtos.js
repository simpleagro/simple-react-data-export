import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/grupos-produtos": {
    component: SimpleLoadable(() => false),
    key: "/grupos-produtos",
    path: "/grupos-produtos",
    label: "Grupos de Produtos",
    icon: "object-group",
    showMenu: true,
    rule: 'ProductGroup'
  }
};

export default menus;
