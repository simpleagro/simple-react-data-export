import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/inscricao-de-campo": {
    component: SimpleLoadable(() => import("../../components/FieldRegistration/DadosBasicos")),
    key: "/inscricao-de-campo",
    path: "/inscricao-de-campo",
    label: "Inscrição de Campo",
    icon: "users",
    showMenu: true,
    rule: 'FieldRegistration',
  },
  "/inscricao-de-campo/:id/edit": {
    component: SimpleLoadable(() =>
      import("../../components/FieldRegistration/DadosBasicos/form")
    ),
    path: "/inscricao-de-campo/:id/edit",
    showMenu: false
  },
  "/inscricao-de-campo/new": {
    component: SimpleLoadable(() =>
      import("../../components/FieldRegistration/DadosBasicos/form")
    ),
    path: "/inscricao-de-campo/new",
    showMenu: false
  },


  "/inscricao-de-campo/:field_registration_id/pre-colheita": {
    component: SimpleLoadable(() => import("../../components/FieldRegistration/PreColheita/index")),
    key: "/inscricao-de-campo/pre-colheita",
    path: "/inscricao-de-campo/:field_registration_id/pre-colheita",
    showMenu: false
  },
  "/inscricao-de-campo/:field_registration_id/pre-colheita/new": {
    component: SimpleLoadable(() =>
      import("../../components/FieldRegistration/PreColheita/form")
    ),
    key: "/inscricao-de-campo/pre-colheita/new",
    path: "/inscricao-de-campo/:field_registration_id/pre-colheita/new",
    showMenu: false
  },
  "/inscricao-de-campo/:field_registration_id/pre-colheita/:id/edit": {
    component: SimpleLoadable(() =>
      import("../../components/FieldRegistration/PreColheita/form")
    ),
    key: "/inscricao-de-campo/pre-colheita/edit",
    path: "/inscricao-de-campo/:field_registration_id/pre-colheita/:id/edit",
    showMenu: false
  },


  "/inscricao-de-campo/:field_registration_id/pre-colheita/:pre_harvest_id/authorization": {
    component: SimpleLoadable(() => import("../../components/FieldRegistration/Autorizacao")),
    key: "/inscricao-de-campo/pre-colheita/autorizacao",
    path: "/inscricao-de-campo/:field_registration_id/pre-colheita/:pre_harvest_id/autorizacao",
    showMenu: false
  },
  "/inscricao-de-campo/:field_registration_id/pre-colheita/:pre_harvest_id/autorizacao/new": {
    component: SimpleLoadable(() => import("../../components/FieldRegistration/Autorizacao/form")),
    key: "/inscricao-de-campo/pre-colheita/autorizacao/new",
    path: "/inscricao-de-campo/:field_registration_id/pre-colheita/:pre_harvest_id/autorizacao/new",
    showMenu: false
  },
  "/inscricao-de-campo/:field_registration_id/pre-colheita/:pre_harvest_id/autorizacao/:id/edit": {
    component: SimpleLoadable(() => import("../../components/FieldRegistration/Autorizacao/form")),
    key: "/inscricao-de-campo/pre-colheita/autorizacao/edit",
    path: "/inscricao-de-campo/:field_registration_id/pre-colheita/:pre_harvest_id/autorizacao/:id/edit",
    showMenu: false
  }
};

export default menus;
