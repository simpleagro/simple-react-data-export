import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/safras": {
    component: SimpleLoadable(() => import("../../components/Seasons")),
    key: "/safras",
    path: "/safras",
    label: "Safras",
    icon: "circle-notch",
    showMenu: true
  },
  "/safras/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Seasons/form")),
    path: "/safras/:id/edit",
    showMenu: false
  },
  "/safras/new": {
    component: SimpleLoadable(() => import("../../components/Seasons/form")),
    path: "/safras/new",
    showMenu: false
  }
};

export default menus;
