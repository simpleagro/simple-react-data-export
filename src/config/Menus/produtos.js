import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/produtos": {
    component: SimpleLoadable(() => false),
    key: "/produtos",
    path: "/produtos",
    label: "Produtos",
    icon: "box",
    showMenu: true,
    rule: 'ProductGroup'
  }
};

export default menus;
