import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/entidades": {
    component: SimpleLoadable(() => import("../../components/Entities")),
    key: "/entidades",
    path: "/entidades",
    label: "Entidades",
    icon: "file",
    onlyAccess: ["SuperUser"],
    showMenu: true
  },
  "/entidades/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Entities/form")),
    path: "/entidades/:id/edit",
    showMenu: false,
  },
  "/entidades/new": {
    component: SimpleLoadable(() => import("../../components/Entities/form")),
    path: "/entidades/new",
    showMenu: false,
  },
};

export default menus;
