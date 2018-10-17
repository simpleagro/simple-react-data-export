import Loadable from "react-loadable";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  "/visitas": {
    submenu: true,
    subKey: "gestao-projetos-agricolas",
    subTitle: "Gestão de Projeto",
    subIcon: "clipboard-list",
    subs: [
      {
        component: loadable(() => import("../../components/Clients/DadosBasicos")),
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
