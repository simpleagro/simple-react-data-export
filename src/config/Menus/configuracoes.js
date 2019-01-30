import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/configuracoes": {
    component: SimpleLoadable(() => import("../../components/Configurations")),
    key: "/configuracoes",
    path: "/configuracoes",
    label: "Configurações",
    icon: "sliders-h",
    showMenu: true,
    rule: 'Configurations'
  },
  "/configuracoes/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Configurations/form")),
    path: "/configuracoes/:id/edit",
    showMenu: false
  },
  "/configuracoes/new": {
    component: SimpleLoadable(() => import("../../components/Configurations/form")),
    path: "/configuracoes/new",
    showMenu: false
  }
};

export default menus;
