import React from 'react';
import ReactDOM from 'react-dom';
import Server from '~/properties'
import { HelmetProvider } from 'react-helmet-async';
import HttpsRedirect from 'react-https-redirect';
//import './index.css';
import App from '~/App';
//import * as serviceWorker from './serviceWorker';

// message, notification (antd) 추가
import '~/plugins/ant';
// i18n 추가
import '~/plugins/i18n';

import { createGlobalStyle } from 'styled-components'
import GlobalInitStyle from '~/styles/GlobalStyles'

import 'ag-grid-community/dist/styles/ag-grid.min.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.min.css';

// 메인 토큰 네임 DONY
window.$tokenName = Server.token.name;

const GlobalStyle = createGlobalStyle`
   ${GlobalInitStyle.Fonts};
   ${GlobalInitStyle.Reset};
`;

const rootElement = document.getElementById('root');

let isHttpsDisabled = true;
// if(Server._serverMode() === 'production'){
//     isHttpsDisabled = false;
// }

const app = (
    <HelmetProvider>
        <GlobalStyle/>
        <React.StrictMode>
            <HttpsRedirect disabled={isHttpsDisabled} >
                <App/>
            </HttpsRedirect>
        </React.StrictMode>
    </HelmetProvider>
);

if (rootElement.hasChildNodes()) {
    ReactDOM.hydrate(
        app,
        rootElement
    );
}else{
    ReactDOM.render(
        app,
        rootElement
    );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
