import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/tabela-comissao": {
    component: SimpleLoadable(() => import("../../components/ComissionTable/DadosBasicos")),
    key: "/tabela-comissao",
    path: "/tabela-comissao",
    label: "Tabela de Comissão",
    icon: "hand-holding-usd",
    showMenu: true
  },
  "/tabela-comissao/:comissiontable_id/regras": {
    component: SimpleLoadable(() =>
      import("../../components/ComissionTable/Rules")
    ),
    key: "/tabela-comissao/regras",
    path: "/tabela-comissao/:comissiontable_id/regras",
    showMenu: false
  },
  "/tabela-comissao/:comissiontable_id/regras/:rule_id/grupos-produto/:productgroup_id/produtos": {
    component: SimpleLoadable(() =>
      import("../../components/ComissionTable/Products")
    ),
    key: "/tabela-comissao/regras/grupos-produto/produtos",
    path: "/tabela-comissao/:comissiontable_id/regras/:rule_id/grupos-produto/:productgroup_id/produtos",
    showMenu: false
  },
  "/tabela-comissao/:comissiontable_id/regras/:rule_id/grupos-produto/:productgroup_id/produtos/:product_id/variacoes": {
    component: SimpleLoadable(() =>
      import("../../components/ComissionTable/Variations")
    ),
    key: "/tabela-comissao/regras/grupos-produto/produtos/variacoes",
    path: "/tabela-comissao/:comissiontable_id/regras/:rule_id/grupos-produto/:productgroup_id/produtos/:product_id/variacoes",
    showMenu: false
  }
};

export default menus;
