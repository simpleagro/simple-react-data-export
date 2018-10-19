import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/usuarios": {
    component: SimpleLoadable(() => false),
    key: "/usuarios",
    path: "/usuarios",
    label: "Usuários",
    icon: "user-friends",
    showMenu: true
  }
};

export default menus;
