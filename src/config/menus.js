import Loadable from "react-loadable";
import React from "react";
import ClientService from "../services/clients";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  "/dashboard": {
    component: loadable(() => false),
    key: "/dashboard",
    path: "/dashboard",
    label: "Dashboard",
    icon: "home",
    showMenu: true
  },
  "/empresas": {
    component: loadable(() => false),
    key: "/empresas",
    path: "/empresas",
    label: "Empresa",
    icon: "building",
    onlyAccess: ["SuperUser"],
    showMenu: true
  },
  "/modulos": {
    component: loadable(() => import("../components/Modules")),
    path: "/modulos",
    label: "Módulos",
    icon: "bezier-curve",
    onlyAccess: ["SuperUser"],
    showMenu: true
  },
  "/entidades": {
    component: loadable(() => import("../components/Entities")),
    key: "/entidades",
    path: "/entidades",
    label: "Entidades",
    icon: "file",
    onlyAccess: ["SuperUser"],
    showMenu: true
  },
  "/usuarios": {
    component: loadable(() => false),
    key: "/usuarios",
    path: "/usuarios",
    label: "Usuários",
    icon: "user-friends",
    showMenu: true
  },
  "/consultores": {
    component: loadable(() => false),
    key: "/consultores",
    path: "/consultores",
    label: "Consultores",
    icon: "user-tie",
    showMenu: true
  },
  "/clientes": {
    component: loadable(() => import("../components/Clients/DadosBasicos")),
    key: "/clientes",
    path: "/clientes",
    label: "Clientes",
    icon: "users",
    showMenu: true
  },
  "/clientes/:id/edit": {
    component: loadable(() => import("../components/Clients/DadosBasicos/form")),
    path: "/clientes/:id/edit",
    showMenu: false
  },
  "/clientes/new": {
    component: loadable(() => import("../components/Clients/DadosBasicos/form")),
    path: "/clientes/new",
    showMenu: false
  },
  "/clientes/:client_id/propriedades": {
    component: loadable(() => import("../components/Clients/Propriedades")),
    key: "/clientes/propriedades",
    path: "/clientes/:client_id/propriedades",
    showMenu: false
  },
  "/clientes/:client_id/propriedades/new": {
    component: loadable(() => import("../components/Clients/Propriedades/form")),
    key: "/clientes/propriedades/new",
    path: "/clientes/:client_id/propriedades/new",
    showMenu: false
  },
  "/clientes/:client_id/propriedades/:id/edit": {
    component: loadable(() => import("../components/Clients/Propriedades/form")),
    key: "/clientes/propriedades/edit",
    path: "/clientes/:client_id/propriedades/:id/edit",
    showMenu: false
  },
  "/clientes/:client_id/propriedades/:property_id/talhoes": {
    component: loadable(() => import("../components/Clients/Talhoes")),
    key: "/clientes/propriedades/talhoes",
    path: "/clientes/:client_id/propriedades/:property_id/talhoes",
    showMenu: false
  },
  "/clientes/:client_id/propriedades/:property_id/talhoes/new": {
    component: loadable(() => import("../components/Clients/Talhoes/form")),
    key: "/clientes/propriedades/talhoes/new",
    path: "/clientes/:client_id/propriedades/:property_id/talhoes/new",
    showMenu: false
  },
  "/clientes/:client_id/propriedades/:property_id/talhoes/:id/edit": {
    component: loadable(() => import("../components/Clients/Talhoes/form")),
    key: "/clientes/propriedades/talhoes/edit",
    path: "/clientes/:client_id/propriedades/:property_id/talhoes/:id/edit",
    showMenu: false
  },
  "/carteira-clientes": {
    component: loadable(() => false),
    key: "/carteira-clientes",
    path: "/carteira-clientes",
    label: "Carteira de Clientes",
    icon: "wallet",
    showMenu: true
  },
  "/caracteristicas-produtos": {
    component: loadable(() => false),
    key: "/caracteristicas-produtos",
    path: "/caracteristicas-produtos",
    label: "Caract. Produtos",
    icon: "list-alt",
    showMenu: true
  },
  "/grupos-produtos": {
    component: loadable(() => false),
    key: "/grupos-produtos",
    path: "/grupos-produtos",
    label: "Grupos de Produtos",
    icon: "object-group",
    showMenu: true
  },
  "/produtos": {
    component: loadable(() => false),
    key: "/produtos",
    path: "/produtos",
    label: "Produtos",
    icon: "box",
    showMenu: true
  },
  "/safras": {
    component: loadable(() => false),
    key: "/safras",
    path: "/safras",
    label: "Safras",
    icon: "circle-notch",
    showMenu: true
  },
  "/etapas-cultura": {
    component: loadable(() => false),
    key: "/etapas-cultura",
    path: "/etapas-cultura",
    label: "Etapas de Cultura",
    icon: "leaf",
    showMenu: true
  },
  "/unidades-medidas": {
    component: loadable(() => false),
    key: "/unidades-medidas",
    path: "/unidades-medidas",
    label: "Unidades de Medidas",
    icon: "exchange-alt",
    showMenu: true
  }
};

export { menus };
