import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/moeda": {
    component: SimpleLoadable(() => import("../../components/Sales/Currency")),
    key: "/moeda",
    path: "/moeda",
    label: "Moeda",
    icon: "coins",
    showMenu: true,
    rule: 'Currency'
  },
  "/moeda/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Sales/Currency/form")),
    path: "/moeda/:id/edit",
    showMenu: false
  },
  "/moeda/new": {
    component: SimpleLoadable(() => import("../../components/Sales/Currency/form")),
    path: "/moeda/new",
    showMenu: false
  },
};

export default menus;
