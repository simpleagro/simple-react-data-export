import SimpleLoadable from "../../components/common/SimpleLoadable";
const menus = {
  "/visitas": {
    component: SimpleLoadable(() => import("../../components/Visits")),
    key: "/visitas",
    path: "/visitas",
    label: "Visitas",
    icon: "clipboard-list",
    showMenu: true,
    rule: "Visit"
  },
  "/visitas/:id": {
    component: SimpleLoadable(() => import("../../components/Visits/show")),
    showMenu: false
  }
};

export default menus;
