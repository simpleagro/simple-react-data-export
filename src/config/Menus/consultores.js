import Loadable from "react-loadable";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  "/consultores": {
    component: loadable(() => import("../../components/Consultants")),
    key: "/consultores",
    path: "/consultores",
    label: "Consultores",
    icon: "user-tie",
    showMenu: true
  },
  "/consultores/:id/edit": {
    component: loadable(() => import("../../components/Consultants/form")),
    path: "/consultores/:id/edit",
    showMenu: false
  },
  "/consultores/new": {
    component: loadable(() => import("../../components/Consultants/form")),
    path: "/consultores/new",
    showMenu: false
  },
}; 

export default menus;
