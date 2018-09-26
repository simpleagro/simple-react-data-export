import Loadable from "react-loadable";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  "/safras": {
    component: loadable(() => import("../../components/Seasons")),
    key: "/safras",
    path: "/safras",
    label: "Safras",
    icon: "circle-notch",
    showMenu: true
  },
  "/safras/:id/edit": {
    component: loadable(() => import("../../components/Seasons/form")),
    path: "/safras/:id/edit",
    showMenu: false
  },
  "/safras/new": {
    component: loadable(() => import("../../components/Seasons/form")),
    path: "/safras/new",
    showMenu: false
  }
};

export default menus;
