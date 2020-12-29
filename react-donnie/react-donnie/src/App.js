import React, {useEffect} from 'react';
import Router from "./router";
import IOST from 'iost'
import { BrowserRouter } from 'react-router-dom'

//antd config locale setting
import { ConfigProvider } from 'antd';
import koKR from 'antd/es/locale/ko_KR';
import enUS from 'antd/es/locale/en_US';
import 'antd/dist/antd.min.css';

//redux 대체용 전역 state 관리
import {RecoilRoot} from 'recoil';

// 캐시 버스터
import CacheBuster from './CacheBuster';

const isKoKR = (localStorage.getItem("ko-KR")||"en_US") === 'ko-KR' ? true:false;

function App() {
    return (
        <RecoilRoot>
            <ConfigProvider locale={isKoKR ? koKR:enUS}>
                <CacheBuster>
                    {({ loading, isLatestVersion, refreshCacheAndReload }) => {
                        if (loading) return null;
                        if (!loading && !isLatestVersion) {
                            refreshCacheAndReload();
                        }
                        return (
                            <BrowserRouter>
                                <Router />
                            </BrowserRouter>
                        );
                    }}
                </CacheBuster>
            </ConfigProvider>
        </RecoilRoot>
    );
}

export default App;
