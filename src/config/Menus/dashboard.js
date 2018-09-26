import Loadable from "react-loadable";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  "/dashboard": {
    component: loadable(() => false),
    key: "/dashboard",
    path: "/dashboard",
    label: "Dashboard",
    icon: "home",
    showMenu: true
  }
};

export default menus;
