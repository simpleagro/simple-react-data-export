import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/pre-colheita": {
    component: SimpleLoadable(() => import("../../components/PreHarvestLab")),
    key: "/pre-colheita",
    path: "/pre-colheita",
    label: "Pré-Colheita",
    icon: "users",
    showMenu: true,
    rule: 'LabPreHarvest',
  },
  "/pre-colheita/:id/edit": {
    component: SimpleLoadable(() =>
      import("../../components/PreHarvestLab/form")
    ),
    path: "/pre-colheita/:id/edit",
    showMenu: false
  },
  "/pre-colheita/new": {
    component: SimpleLoadable(() =>
      import("../../components/PreHarvestLab/form")
    ),
    path: "/pre-colheita/new",
    showMenu: false
  },
};

export default menus;
