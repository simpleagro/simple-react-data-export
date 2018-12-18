import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/usuarios": {
    component: SimpleLoadable(() => import("../../components/Users")),
    key: "/usuarios",
    path: "/usuarios",
    label: "Usuários",
    icon: "user-friends",
    showMenu: true,
    rule: 'UserCompany'
  },
  "/usuarios/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Users/form")),
    path: "/usuarios/:id/edit",
    showMenu: false
  },
  "/usuarios/new": {
    component: SimpleLoadable(() => import("../../components/Users/form")),
    path: "/usuarios/new",
    showMenu: false
  },
};

export default menus;
