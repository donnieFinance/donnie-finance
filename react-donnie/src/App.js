import React, {useEffect} from 'react';
import Router from "./router/index";
import IOST from 'iost'
import { BrowserRouter } from 'react-router-dom'
import properties from "~/properties";

//antd config locale setting
import { ConfigProvider } from 'antd';
import koKR from 'antd/es/locale/ko_KR';
import enUS from 'antd/es/locale/en_US';
import 'antd/dist/antd.min.css';

//redux 대체용 전역 state 관리
import {RecoilRoot} from 'recoil';
import BigNumber from "bignumber.js";


// 캐시 버스터
//import CacheBuster from './CacheBuster';

require('~/plugins/donnieCustom');

const isKoKR = false;//(localStorage.getItem("ko-KR")||"en_US") === 'ko-KR' ? true:false;

function App() {
    useEffect(() => {

        //BigNumber테스트용, 나중에 지우기..
        if (properties.isTestMode === true) {
            window.BigNumber = BigNumber;
        }

        window.clog = function() {
            if(properties.isTestMode === true) {
                var i;
                const logs = []
                for (i = 0; i < arguments.length; i++) {
                    logs.push(arguments[i])
                }
                console.log(logs);
            }
        }
    }, []);

    return (
        <RecoilRoot>
            <ConfigProvider locale={isKoKR ? koKR:enUS}>
                <BrowserRouter>
                    <Router />
                </BrowserRouter>
            </ConfigProvider>
        </RecoilRoot>
    );

    // return (
    //     <RecoilRoot>
    //         <ConfigProvider locale={isKoKR ? koKR:enUS}>
    //             <CacheBuster>
    //                 {({ loading, isLatestVersion, refreshCacheAndReload }) => {
    //                     if (loading) return null;
    //                     if (!loading && !isLatestVersion) {
    //                         refreshCacheAndReload();
    //                     }
    //                     return (
    //                         <BrowserRouter>
    //                             <Router />
    //                         </BrowserRouter>
    //                     );
    //                 }}
    //             </CacheBuster>
    //         </ConfigProvider>
    //     </RecoilRoot>
    // );
}

export default App;
