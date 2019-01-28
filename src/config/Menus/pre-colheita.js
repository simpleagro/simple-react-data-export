import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/pre-colheita": {
    component: SimpleLoadable(() => import("../../components/PreHarvestLab")),
    key: "/pre-colheita",
    path: "/pre-colheita",
    label: "Pré-Colheita",
    icon: "users",
    showMenu: true,
    rule: 'PreHarvestLab',
  }
};

export default menus;
