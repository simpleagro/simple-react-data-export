import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/regioes": {
    component: SimpleLoadable(() => import("../../components/Zone/DadosBasicos")),
    key: "/regioes",
    path: "/regioes",
    label: "Tabela de Regiões",
    icon: "map-marked",
    showMenu: true,
    rule: "Zone"
  },
  "/regioes/:zone_id/cidade/:city_id/locais-de-entrega": {
    component: SimpleLoadable(() => import("../../components/Zone/LocaisEntrega")),
    key: "/regioes/cidade/locais-de-entrega",
    path: "/regioes/:zone_id/cidade/:cidade_id/locais-de-entrega",
    showMenu: false
  },
};

export default menus;
