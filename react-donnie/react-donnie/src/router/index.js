import React, {useEffect} from 'react'
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom'
import loadable from '@loadable/component'
import useIWallet from "~/hooks/useIWallet";
import Theme from '~/styledComponents/Theme'
import useWindowDimensions from "~/hooks/useWindowDimensions";
import {menuModalState, windowSizeState} from "~/hooks/atomState";
import {useRecoilState} from "recoil";
import ComUtil from "~/util/ComUtil";
import useScrollPosition from "~/hooks/useScrollPosition";

const Template = loadable(() => import('~/components/template'))
const Home = loadable(() => import('~/components/home'))
const About = loadable(() => import('~/components/about'))

const CheckingWrap = loadable(() => import('~/components/common/wraps/CheckingWrap'))
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


export default () => {
    const history = useHistory()

    const {connectIWallet} = useIWallet()

    const {width} = useWindowDimensions()
    const [, setSize] = useRecoilState(windowSizeState)

    useScrollPosition()

    useEffect(() => {
        connectIWallet()
        history.listen(() => window.scrollTo({top: 0}))
    }, [])

    useEffect(() => {
        // lg, md, sm
        setSize(ComUtil.getWindowSize(width))

    }, [width])

    useEffect(() => {

        console.log({history})
    }, [history.location.key])

    return(
            <Switch>
                <Route exact path={'/'}>
                    <Theme.Gray />
                    <Home />
                </Route>

                <Route path={'/'}>
                    <Template>
                        <Theme.Gray />
                        <Switch>
                            <Route exact path={'/about'} >
                                <Theme.White />
                                <About/>
                            </Route>
                            <Route exact path={'/checking'} >
                                <CheckingWrap>
                                    <Checking />
                                </CheckingWrap>
                            </Route>

                            <Route exact path={'/trade/:tokenName'} >
                                <CheckingWrap>
                                    <Trade />
                                </CheckingWrap>
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
                        </Switch>

                        <ConnectWalletModal />
                        <MenuModal />
                        <MyDonModal />

                    </Template>
                </Route>

            </Switch>

    )
}
