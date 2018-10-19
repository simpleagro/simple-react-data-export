import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/etapas-cultura": {
    component: SimpleLoadable(() => false),
    key: "/etapas-cultura",
    path: "/etapas-cultura",
    label: "Etapas de Cultura",
    icon: "leaf",
    showMenu: true
  }
};

export default menus;
