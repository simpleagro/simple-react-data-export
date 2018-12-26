import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/metas": {
    component: SimpleLoadable(() => import("../../components/Target/DadosBasicos")),
    key: "/metas",
    path: "/metas",
    label: "Metas",
    icon: "chart-line",
    showMenu: true
  },
  "/metas/:target_id/vendedores": {
    component: SimpleLoadable(() =>
      import("../../components/Target/Sellers")
    ),
    key: "/metas/vendedores",
    path: "/metas/:target_id/vendedores",
    showMenu: false
  },
  "/metas/:target_id/vendedores/:saleman_id/grupos-produto/:productgroup_id/produtos": {
    component: SimpleLoadable(() =>
      import("../../components/Target/Products")
    ),
    key: "/metas/vendedores/grupos-produto/produtos",
    path: "/metas/:target_id/vendedores/:saleman_id/grupos-produto/:productgroup_id/produtos",
    showMenu: false
  }
};

export default menus;
