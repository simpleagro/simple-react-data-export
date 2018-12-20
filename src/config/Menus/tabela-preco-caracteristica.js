import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/tabela-preco-caracteristica": {
    component: SimpleLoadable(() => import("../../components/Sales/FeaturePriceTable/DadosBasicos")),
    key: "/tabela-preco-caracteristica",
    path: "/tabela-preco-caracteristica",
    label: "Tabela Preço Característica",
    icon: "database",
    showMenu: true
  },
  "/tabela-preco-caracteristica/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Sales/FeaturePriceTable/DadosBasicos/form")),
    path: "/tabela-preco-caracteristica/:id/edit",
    showMenu: false
  },
  "/tabela-preco-caracteristica/new": {
    component: SimpleLoadable(() => import("../../components/Sales/FeaturePriceTable/DadosBasicos/form")),
    path: "/tabela-preco-caracteristica/new",
    showMenu: false
  },
  "/tabela-preco-caracteristica/:tabela_id/variacao-de-preco": {
    component: SimpleLoadable(() => import("../../components/Sales/FeaturePriceTable/VariacaoPrecos")),
    key: "/tabela-preco-caracteristica/variacao-de-preco",
    path: "/tabela-preco-caracteristica/:tabela_id/variacao-de-preco",
    showMenu: false
  },
  "/tabela-preco-caracteristica/:tabela_id/variacao-de-preco/new": {
    component: SimpleLoadable(() => import("../../components/Sales/FeaturePriceTable/VariacaoPrecos/form")),
    key: "/tabela-preco-caracteristica/variacao-de-preco/new",
    path: "/tabela-preco-caracteristica/:tabela_id/variacao-de-preco/new",
    showMenu: false
  },
  "/tabela-preco-caracteristica/:tabela_id/variacao-de-preco/:id-edit": {
    component: SimpleLoadable(() => import("../../components/Sales/FeaturePriceTable/VariacaoPrecos/form")),
    key: "/tabela-preco-caracteristica/variacao-de-preco/edit",
    path: "/tabela-preco-caracteristica/:tabela_id/variacao-de-preco/:id/edit",
    showMenu: false
  },
};

export default menus;
