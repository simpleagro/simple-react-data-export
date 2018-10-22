import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/consultores": {
    component: SimpleLoadable(() => import("../../components/Consultants")),
    key: "/consultores",
    path: "/consultores",
    label: "Consultores",
    icon: "user-tie",
    showMenu: true
  },
  "/consultores/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Consultants/form")),
    path: "/consultores/:id/edit",
    showMenu: false
  },
  "/consultores/new": {
    component: SimpleLoadable(() => import("../../components/Consultants/form")),
    path: "/consultores/new",
    showMenu: false
  },
};

export default menus;
