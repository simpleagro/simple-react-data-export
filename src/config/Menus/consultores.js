import Loadable from "react-loadable";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  "/consultores": {
    component: loadable(() => false),
    key: "/consultores",
    path: "/consultores",
    label: "Consultores",
    icon: "user-tie",
    showMenu: true
  },
};

export default menus;
