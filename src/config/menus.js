export default [
  {
    key: "/dashboard",
    link: "/dashboard",
    label: "Dashboard",
    icon: "home"
  },
  {
    key: "/empresas",
    link: "/empresas",
    label: "Empresas",
    icon: "building",
    onlyAccess: ["SuperUser"]
  },
  {
    key: "/modulos",
    link: "/modulos",
    label: "Módulos",
    icon: "bezier-curve",
    onlyAccess: ["SuperUser"]
  },
  {
    key: "/entidades",
    link: "/entidades",
    label: "Entidades",
    icon: "file",
    onlyAccess: ["SuperUser"]
  },
  {
    key: "/usuarios",
    link: "/usuarios",
    label: "Usuários",
    icon: "users"
  },
  {
    key: "/consultores",
    link: "/consultores",
    label: "Consultores",
    icon: "user-tie"
  },
  {
    key: "/carteira-clientes",
    link: "/carteira-clientes",
    label: "Carteira de Clientes",
    icon: "wallet"
  },
  {
    key: "/caracteristicas-produtos",
    link: "/caracteristicas-produtos",
    label: "Caract. Produtos",
    icon: "list-alt"
  },
  {
    key: "/grupos-produtos",
    link: "/grupos-produtos",
    label: "Grupos de Produtos",
    icon: "object-group"
  },
  {
    key: "/produtos",
    link: "/produtos",
    label: "Produtos",
    icon: "box"
  },
  {
    key: "/safras",
    link: "/safras",
    label: "Safras",
    icon: "circle-notch"
  },
  {
    key: "/etapas-cultura",
    link: "/etapas-cultura",
    label: "Etapas de Cultura",
    icon: "leaf"
  },
  {
    key: "/unidades-medidas",
    link: "/unidades-medidas",
    label: "Unidades de Medidas",
    icon: "exchange-alt"
  }
];
