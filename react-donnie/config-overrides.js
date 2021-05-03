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
/*
다른 옵션으로는 [hash]나 [chunkhash]가 있습니다. [hash]는 매번 웹팩 컴파일 시 랜덤한 문자열을 붙여줍니다.
따라서 캐시 삭제 시 유용합니다. [hash]가 컴파일할 때마다 랜덤 문자열을 붙여준다면 [chunkhash]는 파일이 달라질 때에만 랜덤 값이 바뀝니다.
이것을 사용하면 변경되지 않은 파일들은 계속 캐싱하고 변경된 파일만 새로 불러올 수 있는 장점이 있습니다.
*/
const publicPathPlugin = (config, env) => {
    const isEnvProduction = env === 'production';
    config.output = {
        ...config.output, // copy all settings
        filename: isEnvProduction ? "static/js/[name].[chunkhash].js":"static/js/[name].[hash:8].js",
        chunkFilename: isEnvProduction ? "static/js/[name].[chunkhash].async.js":"static/js/[name].[hash:8].async.js",
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