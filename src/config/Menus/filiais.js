import SimpleLoadable from "../../components/common/SimpleLoadable";

const { painelState: { userData: { empresa: company_id } = {} } = {} } =
  JSON.parse(localStorage.getItem("simpleagro_painel")) || {};

const menus = {
  "/filiais": {
    component: SimpleLoadable(() =>
      import("../../components/Companies/Filiais")
    ),
    key: "/filiais",
    path: "/filiais",
    showMenu: true,
    label: "Filiais",
    icon: "building",
    rule: 'Branch'
  },
  "/filiais/new": {
    component: SimpleLoadable(() =>
      import("../../components/Companies/Filiais/form")
    ),
    key: "/filiais/new",
    path: "/filiais/new",
    showMenu: false
  },
  "/filiais/:id/edit": {
    component: SimpleLoadable(() =>
      import("../../components/Companies/Filiais/form")
    ),
    key: "/filiais/edit",
    path: "/filiais/:id/edit",
    showMenu: false
  }
};

export default menus;
