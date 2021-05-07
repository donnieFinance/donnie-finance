import React, {useEffect, useState} from 'react'
import { BrowserRouter as Router, Route, Switch, useHistory, Redirect } from 'react-router-dom'
import loadable from '@loadable/component'
import useWallet from "~/hooks/useWallet";
import Theme from '~/styledComponents/Theme'
import useWindowDimensions from "~/hooks/useWindowDimensions";
import {menuModalState, windowSizeState} from "~/hooks/atomState";
import {useRecoilState} from "recoil";
import ComUtil from "~/util/ComUtil";
import useScrollPosition from "~/hooks/useScrollPosition";
import {PrivateRoute} from './PrivateRoute'
import SecureApi from '~/lib/secureApi'
import Loading from "~/components/common/loading";
import useInterval from "~/hooks/useInterval";
import IOST from 'iost'
import TestRemote from "~/components/common/testRemote";
import {Div} from "~/styledComponents/shared";

const AdminTemplate = loadable(() => import('~/components/admin/template'))

const Security = loadable(() => import('~/components/security'))

const Template = loadable(() => import('~/components/template'))
const Home = loadable(() => import('~/components/home'))
const About = loadable(() => import('~/components/about'))

const Checking = loadable(() => import('~/components/checking'))
const Trade = loadable(() => import('~/components/trade'))

const Loan = loadable(() => import('~/components/loan'))
const Exchange = loadable(() => import('~/components/exchange'))
const CreditAnalysis = loadable(() => import('~/components/creditAnalysis'))
const Payment = loadable(() => import('~/components/payment'))
const Portfolio = loadable(() => import('~/components/portfolio'))
const ConnectWalletModal = loadable(() => import('~/components/common/modals/ConnectWalletModal'))
const MenuModal = loadable(() => import('~/components/common/modals/MenuModal'))
const MyDonModal = loadable(() => import('~/components/common/modals/MyDonModal'))

const AdminLogin = loadable(() => import('~/components/admin/login'))
const DepositERCModal = loadable(() => import('~/components/common/modals/DepositERCModal'))
const WithdrawERCModal = loadable(() => import('~/components/common/modals/WithdrawERCModal'))

const DepositIWERCModal = loadable(() => import('~/components/common/modals/DepositIWERCModal'))
const WithdrawIWERCModal = loadable(() => import('~/components/common/modals/WithdrawIWERCModal'))
const DepositBNBModal = loadable(() => import('~/components/common/modals/DepositBNBModal'))
const WithdrawBNBModal = loadable(() => import('~/components/common/modals/WithdrawBNBModal'))
const NoticeModal = loadable(() => import('~/components/common/modals/NoticeModal'))

const BridgeDepositModal = loadable(() => import('~/components/common/modals/BridgeDepositModal'))
const BridgeWithdrawModal = loadable(() => import('~/components/common/modals/BridgeWithdrawModal'))

//라우터 변경시 자동 scroll top 제외 항목
const disabledScrollTopPathNames = [
    '/exchange/swap',
    '/exchange/liquidity',
    '/exchange/liquidity/add'
]

export default () => {
    const history = useHistory()

    const {connectIWallet} = useWallet()

    const {width} = useWindowDimensions()
    const [, setSize] = useRecoilState(windowSizeState)

    useScrollPosition()

    useEffect(() => {

        initializeInfo();

        async function fetch() {
            await initWallet()
            connectIWallet(localStorage.getItem('IostWalletGb') || "IWallet")
        }

        //라우터 변경시 callback : 항상 최상단으로 유지
        history.listen(async () => {
            // 널일경우 CSRF 세팅
            if(!localStorage.getItem("xToken")){
                initializeInfo();
            }
            console.log({history})

            if (!disabledScrollTopPathNames.includes(history.location.pathname))
                window.scrollTo({top: 0})
        });

        fetch()

    }, [])


    const initializeInfo = () => {
        //csrf 세팅
        SecureApi.setCsrf().then(()=>{
            SecureApi.getCsrf().then(({data})=>{
                localStorage.setItem('xToken',data);
            });
        });
    }

    //15분 마다 csrf set
    useInterval(() => {
        initializeInfo();
    }, 1000 * 60 * 15)


    const initWallet = async() => {

        window.myWallet = {};
        window.myWallet.IWallet = window.IWalletJS ? window.IWalletJS : null;
        await ComUtil.delay(3000)
        window.myWallet.Jetstream = window.jet && window.jet.iost ? window.jet.iost : null;
    }


    useEffect(() => {
        // lg, md, sm
        setSize(ComUtil.getWindowSize(width))

    }, [width])

    return(
        <>
            <TestRemote />
            <Switch>
                <Route exact path={'/'}>
                    <Theme.Gray />
                    <Home />
                </Route>

                <Route exact path={'/admin/login'} >
                    <AdminLogin />
                </Route>

                <PrivateRoute path="/admin" type={'admin'}>
                    <AdminTemplate />
                </PrivateRoute>

                <Route path={'/'}>
                    <Switch>

                        <Template>
                            <Theme.Gray />

                            <Route exact path={'/about'} >
                                <Theme.White />
                                <About/>
                            </Route>
                            <Route exact path={'/checking'} >
                                <Checking />
                            </Route>

                            <Route exact path={'/trade/:uniqueKey'} >
                                <Trade />
                            </Route>
                            <Route exact path={'/loan'} >
                                <Loan />
                            </Route>
                            <Route exact path={'/exchange'} >
                                <Redirect to={'/exchange/swap'} />
                            </Route>
                            <Route path={'/exchange'} >
                                <Exchange />
                            </Route>
                            <Route exact path={'/credit'} >
                                <CreditAnalysis />
                            </Route>
                            <Route exact path={'/payment'} >
                                <Payment />
                            </Route>
                            <Route exact path={'/portfolio'} >
                                <Portfolio />
                            </Route>

                            <ConnectWalletModal />
                            <MenuModal />

                            <MyDonModal />

                            <DepositERCModal />
                            <WithdrawERCModal />

                            <DepositIWERCModal/>
                            <WithdrawIWERCModal/>

                            <DepositBNBModal/>
                            <WithdrawBNBModal/>

                            <NoticeModal/>

                            <BridgeDepositModal/>
                            <BridgeWithdrawModal/>

                            <Loading />

                        </Template>
                    </Switch>

                </Route>

            </Switch>
        </>
    )
}
