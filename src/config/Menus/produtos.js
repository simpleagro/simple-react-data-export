import Loadable from "react-loadable";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  "/produtos": {
    component: loadable(() => false),
    key: "/produtos",
    path: "/produtos",
    label: "Produtos",
    icon: "box",
    showMenu: true
  }
};

export default menus;
