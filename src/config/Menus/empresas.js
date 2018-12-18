import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/empresas": {
    component: SimpleLoadable(() => import("../../components/Companies/DadosBasicos")),
    key: "/empresas",
    path: "/empresas",
    label: "Empresas",
    icon: "building",
    onlyAccess: ["SuperUser"],
    showMenu: true,
  },
  "/empresas/:id/edit": {
    component: SimpleLoadable(() =>
      import("../../components/Companies/DadosBasicos/form")
    ),
    path: "/empresas/:id/edit",
    showMenu: false
  },
  "/empresas/new": {
    component: SimpleLoadable(() =>
      import("../../components/Companies/DadosBasicos/form")
    ),
    path: "/empresas/new",
    showMenu: false
  },
  "/empresas/:company_id/filiais": {
    component: SimpleLoadable(() =>
      import("../../components/Companies/Filiais")
    ),
    key: "/empresas/filiais",
    path: "/empresas/:company_id/filiais",
    showMenu: false
  },
  "/empresas/:company_id/filiais/new": {
    component: SimpleLoadable(() =>
      import("../../components/Companies/Filiais/form")
    ),
    key: "/empresas/filiais/new",
    path: "/empresas/:company_id/filiais/new",
    showMenu: false
  },
  "/empresas/:company_id/filiais/:id/edit": {
    component: SimpleLoadable(() =>
      import("../../components/Companies/Filiais/form")
    ),
    key: "/empresas/filiais/edit",
    path: "/empresas/:company_id/filiais/:id/edit",
    showMenu: false
  }
};

export default menus;
