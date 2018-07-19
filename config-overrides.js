const { injectBabelPlugin } = require('react-app-rewired');
const rewireLess = require('react-app-rewire-less');

module.exports = function override(config, env) {
    config = injectBabelPlugin(['import', { libraryName: 'antd', style: true }], config);  // change importing css to less
    config = rewireLess.withLoaderOptions({
        modifyVars: {
            "@primary-color": "#009E54",
            "@info-color": "#3498db",
            "@success-color": "#3AB54A",
            "@processing-color": "#3AB54A",
            "@error-color": "#c0392b",
            "@highlight-color": "#f1c40f",
            "@warning-color": "#e67e22",
            "@normal-color": "#606062",
            "@layout-sider-background" : "#4b4c49"
        },
    })(config, env);
    return config;
};