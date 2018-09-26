import Loadable from "react-loadable";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  "/usuarios": {
    component: loadable(() => false),
    key: "/usuarios",
    path: "/usuarios",
    label: "Usuários",
    icon: "user-friends",
    showMenu: true
  }
};

export default menus;
