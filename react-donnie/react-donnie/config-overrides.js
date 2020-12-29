// customize-cra guide
// https://github.com/arackaf/customize-cra/blob/HEAD/api.md
const path = require('path');
const {
    useBabelRc,
    addWebpackAlias,
    override,
    addBabelPlugin,
    addWebpackPlugin,
    fixBabelImports,
    addLessLoader
} = require('customize-cra');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
// const theme = require('./src/styles/theme/theme');

// 운영모드 빌드: GENERATE_SOURCEMAP false 메모리 부족현상 해결
if (process.env.NODE_ENV === 'development') {
    process.env.GENERATE_SOURCEMAP = "true";
} else if (process.env.NODE_ENV === 'production') {
    process.env.GENERATE_SOURCEMAP = "false";
}

const publicPathPlugin = (config, env) => {
    config.output = {
        ...config.output, // copy all settings
        filename: "static/js/[name].[hash:8].js",
        chunkFilename: "static/js/[name].[hash:8].async.js",
    }
    return config
}

module.exports = {
    webpack: override(
        publicPathPlugin,
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useBabelRc(),
        //antd app.js css or less not import
        fixBabelImports('antd', {
            libraryDirectory: 'es',
            libraryName: 'antd',
            style: true
        }),
        // fixBabelImports('antd-mobile', {
        //     libraryDirectory: 'es',
        //     libraryName: 'antd-mobile',
        //     style: true
        // }),
        // fixBabelImports("lodash", {
        //     libraryDirectory: "",
        //     libraryName: 'lodash',
        //     camel2DashComponentName: false
        // }),
        fixBabelImports("react-icon", {
            libraryDirectory: "",
            libraryName: 'react-icon',
            camel2DashComponentName: false
        }),
        addLessLoader({
            lessOptions: { // If you are using less-loader@5 please spread the lessOptions to options directly
                javascriptEnabled: true,
                // modifyVars: theme,
                // modifyVars: { '@primary-color': '#1DA57A' },
                localIdentName: '[local]--[hash:base64:5]' // 自定义 CSS Modules 的 localIdentName
            },
        }),
        // addWebpackExternals({
        //     'window.Quill': ['react-quill', 'Quill'],
        //     'Quill': 'quill'
        // }),
        addWebpackAlias({
            '~': path.resolve(__dirname, './src')
        }),
        addBabelPlugin(
            ['babel-plugin-styled-components',{
                displayName: true
            }]
        ),
        addWebpackPlugin(
            // moment locale 필요한것만 넣기(용량문제 해결)
            new MomentLocalesPlugin({
                localesToKeep: ['ko','en'],
            }),
        )
    )
};