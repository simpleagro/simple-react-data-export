import Loadable from "react-loadable";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  "/visitas": {
    component: loadable(() => import("../../components/Visits")),
    key: "/visitas",
    path: "/visitas",
    label: "Visitas",
    icon: "clipboard-list",
    showMenu: true
  },
  "/visitas/:id": {
    component: loadable(() => import("../../components/Visits/show")),
    showMenu: false
  },
};

export default menus;
