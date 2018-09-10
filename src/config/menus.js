import React from "react";
import Loadable from "react-loadable";

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
    icon: "home"
  },
  "/empresas": {
    component: loadable(() => false),
    key: "/empresas",
    path: "/empresas",
    label: "Empresa",
    icon: "building",
    onlyAccess: ["SuperUser"]
  },
  "/modulos": {
    component: loadable(() => import("../components/Modules")),
    path: "/modulos",
    label: "Módulos",
    icon: "bezier-curve",
    onlyAccess: ["SuperUser"]
  },
  "/entidades": {
    component: loadable(() => import("../components/Entities")),
    key: "/entidades",
    path: "/entidades",
    label: "Entidades",
    icon: "file",
    onlyAccess: ["SuperUser"]
  },
  "/usuarios": {
    component: loadable(() => false),
    key: "/usuarios",
    path: "/usuarios",
    label: "Usuários",
    icon: "user-friends"
  },
  "/consultores": {
    component: loadable(() => false),
    key: "/consultores",
    path: "/consultores",
    label: "Consultores",
    icon: "user-tie"
  },
  "/clientes": {
    component: loadable(() => import("../components/Clients")),
    key: "/clientes",
    path: "/clientes",
    label: "Clientes",
    icon: "users"
  },
  "/carteira-clientes": {
    component: loadable(() => false),
    key: "/carteira-clientes",
    path: "/carteira-clientes",
    label: "Carteira de Clientes",
    icon: "wallet"
  },
  "/caracteristicas-produtos": {
    component: loadable(() => false),
    key: "/caracteristicas-produtos",
    path: "/caracteristicas-produtos",
    label: "Caract. Produtos",
    icon: "list-alt"
  },
  "/grupos-produtos": {
    component: loadable(() => false),
    key: "/grupos-produtos",
    path: "/grupos-produtos",
    label: "Grupos de Produtos",
    icon: "object-group"
  },
  "/produtos": {
    component: loadable(() => false),
    key: "/produtos",
    path: "/produtos",
    label: "Produtos",
    icon: "box"
  },
  "/safras": {
    component: loadable(() => false),
    key: "/safras",
    path: "/safras",
    label: "Safras",
    icon: "circle-notch"
  },
  "/etapas-cultura": {
    component: loadable(() => false),
    key: "/etapas-cultura",
    path: "/etapas-cultura",
    label: "Etapas de Cultura",
    icon: "leaf"
  },
  "/unidades-medidas": {
    component: loadable(() => false),
    key: "/unidades-medidas",
    path: "/unidades-medidas",
    label: "Unidades de Medidas",
    icon: "exchange-alt"
  }
};

export { menus };
