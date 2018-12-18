import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/unidades-medidas": {
    component: SimpleLoadable(() => import("../../components/UnitMeasure")),
    key: "/unidades-medidas",
    path: "/unidades-medidas",
    label: "Unidades de Medidas",
    icon: "exchange-alt",
    showMenu: true,
    rule: 'UnitMeasure'
  },
  "/unidades-medidas/:id/edit": {
    component: SimpleLoadable(() => import("../../components/UnitMeasure/form")),
    path: "/unidades-medidas/:id/edit",
    showMenu: false
  },
  "/unidades-medidas/new": {
    component: SimpleLoadable(() => import("../../components/UnitMeasure/form")),
    path: "/unidades-medidas/new",
    showMenu: false
  },
};

export default menus;
