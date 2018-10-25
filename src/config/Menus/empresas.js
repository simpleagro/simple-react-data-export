import SimpleLoadable from "../../components/common/SimpleLoadable";

const menus = {
  "/empresas": {
    component: SimpleLoadable(() => false),
    key: "/empresas",
    path: "/empresas",
    label: "Empresa",
    icon: "building",
    onlyAccess: ["SuperUser"],
    showMenu: true
  }
};

export default menus;
