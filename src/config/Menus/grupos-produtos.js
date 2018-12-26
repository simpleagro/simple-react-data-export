import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/grupos-produtos": {
    component: SimpleLoadable(() => import("../../components/ProductGroups/DadosBasicos")),
    key: "/grupos-produtos",
    path: "/grupos-produtos",
    label: "Grupos de Produtos",
    icon: "object-group",
    showMenu: true
  },
  "/grupos-produtos/new": {
    component: SimpleLoadable(() =>
      import("../../components/ProductGroups/DadosBasicos/form")
    ),
    path: "/grupos-produtos/new",
    showMenu: false
  },
  "/grupos-produtos/:id/edit": {
    component: SimpleLoadable(() =>
      import("../../components/ProductGroups/DadosBasicos/form")
    ),
    path: "/grupos-produtos/:id/edit",
    showMenu: false
  },
  "/grupos-produtos/:group_id/caracteristicas-produtos": {
    component: SimpleLoadable(() =>
      import("../../components/ProductGroups/Caracteristicas")
    ),
    key: "/grupos-produtos/caracteristicas-produtos",
    path: "/grupos-produtos/:group_id/caracteristicas-produtos",
    showMenu: false
  },
  "/grupos-produtos/:group_id/caracteristicas-produtos/new": {
    component: SimpleLoadable(() =>
      import("../../components/ProductGroups/Caracteristicas/form")
    ),
    key: "/grupos-produtos/caracteristicas-produtos/new",
    path: "/grupos-produtos/:group_id/caracteristicas-produtos/new",
    showMenu: false
  },
  "/grupos-produtos/:group_id/caracteristicas-produtos/:id/edit": {
    component: SimpleLoadable(() =>
      import("../../components/ProductGroups/Caracteristicas/form")
    ),
    key: "/grupos-produtos/caracteristicas-produtos/edit",
    path: "/grupos-produtos/:group_id/caracteristicas-produtos/:id/edit",
    showMenu: false
  },
  "/grupos-produtos/:group_id/produtos": {
    component: SimpleLoadable(() =>
      import("../../components/ProductGroups/Produtos")
    ),
    key: "/grupos-produtos/produtos",
    path: "/grupos-produtos/:group_id/produtos",
    showMenu: false
  },
  "/grupos-produtos/:group_id/produtos/new": {
    component: SimpleLoadable(() =>
      import("../../components/ProductGroups/Produtos/form")
    ),
    key: "/grupos-produtos/produtos/new",
    path: "/grupos-produtos/:group_id/produtos/new",
    showMenu: false
  },
  "/grupos-produtos/:group_id/produtos/:id/edit": {
    component: SimpleLoadable(() =>
      import("../../components/ProductGroups/Produtos/form")
    ),
    key: "/grupos-produtos/produtos/edit",
    path: "/grupos-produtos/:group_id/produtos/:id/edit",
    showMenu: false
  }
};

export default menus;
