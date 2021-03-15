import React, {useEffect, useState} from 'react'
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom'
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

const AdminTemplate = loadable(() => import('~/components/admin/template'))

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

export default () => {
    const history = useHistory()

    const {connectIWallet} = useWallet()

    const {width} = useWindowDimensions()
    const [, setSize] = useRecoilState(windowSizeState)

    useScrollPosition()

    useEffect(() => {

        async function fetch() {
            SecureApi.setCsrf();
            await initWallet()
            connectIWallet(localStorage.getItem('IostWalletGb') || "IWallet")
        }

        history.listen(() => window.scrollTo({top: 0}))

        fetch()

    }, [])

    const initWallet = async() => {
        window.myWallet = {};
        // await ComUtil.delay(2000)
        window.myWallet.IWallet = window.IWalletJS ? window.IWalletJS : null;
        await ComUtil.delay(3000)
        window.myWallet.Jetstream = window.jet && window.jet.iost ? window.jet.iost : null;

        //console.log("window.myWallet.IWallet===",window.myWallet.IWallet)
        //console.log("window.myWallet.Jetstream===",window.myWallet.Jetstream)
    }


    useEffect(() => {
        // lg, md, sm
        setSize(ComUtil.getWindowSize(width))

    }, [width])

    return(
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

                        <Loading />

                    </Template>
                </Switch>

            </Route>

        </Switch>

    )
}
