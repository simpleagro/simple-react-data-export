import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/dashboard": {
    component: SimpleLoadable(() => false),
    key: "/dashboard",
    path: "/dashboard",
    label: "Dashboard",
    icon: "home",
    showMenu: true,
    rule: 'Dashboard',
  }
};

export default menus;
