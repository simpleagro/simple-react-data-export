import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/clientes": {
    component: SimpleLoadable(() => import("../../components/Clients/DadosBasicos")),
    key: "/clientes",
    path: "/clientes",
    label: "Clientes",
    icon: "users",
    showMenu: true,
    rule: 'Client',
  },
  "/clientes/:id/edit": {
    component: SimpleLoadable(() =>
      import("../../components/Clients/DadosBasicos/form")
    ),
    path: "/clientes/:id/edit",
    showMenu: false
  },
  "/clientes/new": {
    component: SimpleLoadable(() =>
      import("../../components/Clients/DadosBasicos/form")
    ),
    path: "/clientes/new",
    showMenu: false
  },
  "/clientes/:client_id/propriedades": {
    component: SimpleLoadable(() => import("../../components/Clients/Propriedades")),
    key: "/clientes/propriedades",
    path: "/clientes/:client_id/propriedades",
    showMenu: false
  },
  "/clientes/:client_id/propriedades/new": {
    component: SimpleLoadable(() =>
      import("../../components/Clients/Propriedades/form")
    ),
    key: "/clientes/propriedades/new",
    path: "/clientes/:client_id/propriedades/new",
    showMenu: false
  },
  "/clientes/:client_id/propriedades/:id/edit": {
    component: SimpleLoadable(() =>
      import("../../components/Clients/Propriedades/form")
    ),
    key: "/clientes/propriedades/edit",
    path: "/clientes/:client_id/propriedades/:id/edit",
    showMenu: false
  },
  "/clientes/:client_id/propriedades/:property_id/talhoes": {
    component: SimpleLoadable(() => import("../../components/Clients/Talhoes")),
    key: "/clientes/propriedades/talhoes",
    path: "/clientes/:client_id/propriedades/:property_id/talhoes",
    showMenu: false
  },
  "/clientes/:client_id/propriedades/:property_id/talhoes/new": {
    component: SimpleLoadable(() => import("../../components/Clients/Talhoes/form")),
    key: "/clientes/propriedades/talhoes/new",
    path: "/clientes/:client_id/propriedades/:property_id/talhoes/new",
    showMenu: false
  },
  "/clientes/:client_id/propriedades/:property_id/talhoes/:id/edit": {
    component: SimpleLoadable(() => import("../../components/Clients/Talhoes/form")),
    key: "/clientes/propriedades/talhoes/edit",
    path: "/clientes/:client_id/propriedades/:property_id/talhoes/:id/edit",
    showMenu: false
  }
};

export default menus;
