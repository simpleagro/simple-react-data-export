import Loadable from "react-loadable";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  "/clientes": {
    component: loadable(() => import("../../components/Clients/DadosBasicos")),
    key: "/clientes",
    path: "/clientes",
    label: "Clientes",
    icon: "users",
    showMenu: true
  },
  "/clientes/:id/edit": {
    component: loadable(() =>
      import("../../components/Clients/DadosBasicos/form")
    ),
    path: "/clientes/:id/edit",
    showMenu: false
  },
  "/clientes/new": {
    component: loadable(() =>
      import("../../components/Clients/DadosBasicos/form")
    ),
    path: "/clientes/new",
    showMenu: false
  },
  "/clientes/:client_id/propriedades": {
    component: loadable(() => import("../../components/Clients/Propriedades")),
    key: "/clientes/propriedades",
    path: "/clientes/:client_id/propriedades",
    showMenu: false
  },
  "/clientes/:client_id/propriedades/new": {
    component: loadable(() =>
      import("../../components/Clients/Propriedades/form")
    ),
    key: "/clientes/propriedades/new",
    path: "/clientes/:client_id/propriedades/new",
    showMenu: false
  },
  "/clientes/:client_id/propriedades/:id/edit": {
    component: loadable(() =>
      import("../../components/Clients/Propriedades/form")
    ),
    key: "/clientes/propriedades/edit",
    path: "/clientes/:client_id/propriedades/:id/edit",
    showMenu: false
  },
  "/clientes/:client_id/propriedades/:property_id/talhoes": {
    component: loadable(() => import("../../components/Clients/Talhoes")),
    key: "/clientes/propriedades/talhoes",
    path: "/clientes/:client_id/propriedades/:property_id/talhoes",
    showMenu: false
  },
  "/clientes/:client_id/propriedades/:property_id/talhoes/new": {
    component: loadable(() => import("../../components/Clients/Talhoes/form")),
    key: "/clientes/propriedades/talhoes/new",
    path: "/clientes/:client_id/propriedades/:property_id/talhoes/new",
    showMenu: false
  },
  "/clientes/:client_id/propriedades/:property_id/talhoes/:id/edit": {
    component: loadable(() => import("../../components/Clients/Talhoes/form")),
    key: "/clientes/propriedades/talhoes/edit",
    path: "/clientes/:client_id/propriedades/:property_id/talhoes/:id/edit",
    showMenu: false
  }
};

export default menus;
