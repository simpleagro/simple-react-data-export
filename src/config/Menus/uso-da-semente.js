import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/uso-da-semente": {
    component: SimpleLoadable(() => import("../../components/Sales/SeedUse")),
    key: "/uso-da-semente",
    path: "/uso-da-semente",
    label: "Uso da Semente",
    icon: "database",
    showMenu: true
  },
  "/uso-da-semente/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Sales/SeedUse/form")),
    path: "/uso-da-semente/:id/edit",
    showMenu: false
  },
  "/uso-da-semente/new": {
    component: SimpleLoadable(() => import("../../components/Sales/SeedUse/form")),
    path: "/uso-da-semente/new",
    showMenu: false
  },
};

export default menus;
