import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/tabela-preco": {
    component: SimpleLoadable(() => import("../../components/PriceTable/DadosBasicos")),
    key: "/tabela-preco",
    path: "/tabela-preco",
    label: "Tabela de Preço",
    icon: "dollar-sign",
    showMenu: true
  },
  "/tabela-preco/:pricetable_id/grupo-produto/:productgroup_id/produtos": {
    component: SimpleLoadable(() =>
      import("../../components/PriceTable/Products")
    ),
    key: "/tabela-preco/grupo-produto/produtos",
    path: "/tabela-preco/:pricetable_id/grupo-produto/:productgroup_id/produtos",
    showMenu: false
  },
  "/tabela-preco/:pricetable_id/grupo-produto/:productgroup_id/produtos/:product_id/caracteristicas": {
    component: SimpleLoadable(() =>
      import("../../components/PriceTable/Caracteristicas")
    ),
    key: "/tabela-preco/grupo-produto/produtos/caracteristicas",
    path: "/tabela-preco/:pricetable_id/grupo-produto/:productgroup_id/produtos/:product_id/caracteristicas",
    showMenu: false
  }
};

export default menus;
