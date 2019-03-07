import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/regioes": {
    component: SimpleLoadable(() => import("../../components/Zone/DadosBasicos")),
    key: "/regioes",
    path: "/regioes",
    label: "Regiões",
    icon: "map-marked",
    showMenu: true,
    rule: "Zone"
  }
  // "/regioes/:id/edit": {
  //   component: SimpleLoadable(() => import("../../components/Sales/Zone/form")),
  //   path: "/regioes/:id/edit",
  //   showMenu: false
  // },
  // "/regioes/new": {
  //   component: SimpleLoadable(() => import("../../components/Sales/Zone/form")),
  //   path: "/regioes/new",
  //   showMenu: false
  // },
};

export default menus;
