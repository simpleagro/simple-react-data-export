const { injectBabelPlugin } = require("react-app-rewired");
const rewireLess = require("react-app-rewire-less");

const moduleResolver = [
  "module-resolver",
  {
    root: ["./src"],
    alias: {
      "~": "./src",
      "actions" : "./src/actions",
      "assets" : "./src/assets",
      "components" : "./src/components",
      "common" : "./src/components/common",
      "config" : "./src/config",
      "lib" : "./src/lib",
      "reducers" : "./src/reducers",
      "services" : "./src/services",
    }
  }
];

module.exports = function override(config, env) {
  config = injectBabelPlugin(
    ["import", { libraryName: "antd", style: true }],
    config
  );

  config = injectBabelPlugin(moduleResolver, config);

  config = rewireLess.withLoaderOptions({
    modifyVars: {
      "@primary-color": "#009d55",
      "@info-color": "#3498db",
      "@success-color": "#009d55",
      "@processing-color": "#009d55",
      "@error-color": "#c0392b",
      "@highlight-color": "#f1c40f",
      "@warning-color": "#e67e22",
      "@normal-color": "#606062",
      "@layout-sider-background": "#606062"
    }
  })(config, env);

  return config;
};
