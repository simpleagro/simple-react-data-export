import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/entidades": {
    component: SimpleLoadable(() => import("../../components/Entities")),
    key: "/entidades",
    path: "/entidades",
    label: "Entidades",
    icon: "file",
    onlyAccess: ["SuperUser"],
    showMenu: true
  }
};

export default menus;
