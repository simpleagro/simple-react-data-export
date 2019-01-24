import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/tabela-frete": {
    component: SimpleLoadable(() => import("../../components/ShipTable/DadosBasicos")),
    key: "/tabela-frete",
    path: "/tabela-frete",
    label: "Tabela de Frete",
    icon: "truck",
    showMenu: true,
    rule: 'ShipTable',
  },
  "/tabela-frete/:shiptable_id/range-km": {
    component: SimpleLoadable(() =>
      import("../../components/ShipTable/RangeKM")
    ),
    key: "/tabela-frete/range-km",
    path: "/tabela-frete/:shiptable_id/range-km",
    showMenu: false
  },
  "/tabela-frete/:shiptable_id/range-km/:rangekm_id/range-volume": {
    component: SimpleLoadable(() =>
      import("../../components/ShipTable/RangeKG")
    ),
    key: "/tabela-frete/range-km/range-volume",
    path: "/tabela-frete/:shiptable_id/range-km/:rangekm_id/range-volume",
    showMenu: false
  }/* ,
  "/tabela-frete/:shiptable_id/range-km/new": {
    component: SimpleLoadable(() =>
      import("../../components/ShipTable/RangeKM/form")
    ),
    key: "/tabela-frete/range-km/new",
    path: "/tabela-frete/:shiptable_id/range-km/new",
    showMenu: false
  },
  "/tabela-frete/:shiptable_id/range-km/:id/edit": {
    component: SimpleLoadable(() =>
      import("../../components/ShipTable/RangeKM/form")
    ),
    key: "/tabela-frete/range-km/edit",
    path: "/tabela-frete/:shiptable_id/range-km/:id/edit",
    showMenu: false
  } */
};

export default menus;
