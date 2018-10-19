import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/visitas": {
    submenu: true,
    subKey: "gestao-projetos-agricolas",
    subTitle: "Gestão de Projeto",
    subIcon: "clipboard-list",
    subs: [
      {
        component: SimpleLoadable(() => import("../../components/Clients/DadosBasicos")),
        key: "/visitas",
        path: "/visitas",
        label: "Visitas",
        icon: "user-friends",
        showMenu: true
      }
    ],
    showMenu: true
  }
};

export default menus;
