import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/cotas": {
    component: SimpleLoadable(() => import("../../components/Quota/DadosBasicos")),
    key: "/cotas",
    path: "/cotas",
    label: "Cotas",
    icon: "chart-pie",
    showMenu: true,
    rule: 'Quota',
  },
  "/cotas/:quota_id/vendedores": {
    component: SimpleLoadable(() =>
      import("../../components/Quota/Sellers")
    ),
    key: "/cotas/vendedores",
    path: "/cotas/:quota_id/vendedores",
    showMenu: false
  },
  "/cotas/:quota_id/resumo": {
    component: SimpleLoadable(() =>
      import("../../components/Quota/Resumo")
    ),
    key: "/cotas/resumo",
    path: "/cotas/:quota_id/resumo",
    showMenu: false
  },
  "/cotas/:quota_id/vendedores/:saleman_id/grupos-produto/:productgroup_id/produtos": {
    component: SimpleLoadable(() =>
      import("../../components/Quota/Products")
    ),
    key: "/cotas/vendedores/grupos-produto/produtos",
    path: "/cotas/:quota_id/vendedores/:saleman_id/grupos-produto/:productgroup_id/produtos",
    showMenu: false
  },
  "/cotas/:quota_id/vendedores/:saleman_id/grupos-produto/:productgroup_id/produtos/:product_id/variacoes": {
    component: SimpleLoadable(() =>
      import("../../components/Quota/Variacoes")
    ),
    key: "/cotas/vendedores/grupos-produto/produtos/variacoes",
    path: "/cotas/:quota_id/vendedores/:saleman_id/grupos-produto/:productgroup_id/produtos/:product_id/variacoes",
    showMenu: false
  }
};

export default menus;
